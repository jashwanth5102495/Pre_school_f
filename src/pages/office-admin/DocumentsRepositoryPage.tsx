import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schoolPortalService } from '../../services/school-portal.service';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  Files,
  Check,
  X,
  FileText,
  ExternalLink,
  Plus,
  Cloud,
  UploadCloud,
  Trash2,
  FileCheck,
  AlertCircle,
} from 'lucide-react';

export const DocumentsRepositoryPage: React.FC = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [statusFilter, setStatusFilter] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [rejectRemarks, setRejectRemarks] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [studentId, setStudentId] = useState('');
  const [documentType, setDocumentType] = useState('BIRTH_CERTIFICATE');
  const [documentName, setDocumentName] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const { data: docs, isLoading } = useQuery({
    queryKey: ['office-documents', statusFilter],
    queryFn: () => schoolPortalService.getDocuments({ status: statusFilter || undefined }),
  });

  const { data: studentsData } = useQuery({
    queryKey: ['school-students-dropdown'],
    queryFn: () => schoolPortalService.getStudents({ limit: 100 }),
  });

  const verifyMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      schoolPortalService.verifyDocument(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['office-documents'] });
      queryClient.invalidateQueries({ queryKey: ['office-dashboard'] });
      setSelectedDoc(null);
      setRejectRemarks('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => schoolPortalService.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['office-documents'] });
      queryClient.invalidateQueries({ queryKey: ['office-dashboard'] });
    },
  });

  const uploadFileMutation = useMutation({
    mutationFn: (formData: FormData) => schoolPortalService.uploadDocumentFile(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['office-documents'] });
      queryClient.invalidateQueries({ queryKey: ['office-dashboard'] });
      closeUploadModal();
    },
    onError: (err: any) => {
      setUploadError(err.response?.data?.message || err.message || 'Failed to upload document to S3');
    },
  });

  const closeUploadModal = () => {
    setIsUploadModalOpen(false);
    setSelectedFile(null);
    setStudentId('');
    setDocumentType('BIRTH_CERTIFICATE');
    setDocumentName('');
    setRemarks('');
    setUploadError('');
  };

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    setSelectedFile(file);
    setUploadError('');
    if (!documentName) {
      // Auto-populate document title without extension
      const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      setDocumentName(nameWithoutExt.replace(/[_-]/g, ' '));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select a file to upload to S3');
      return;
    }
    if (!studentId) {
      setUploadError('Please select a student for this document');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('studentId', studentId);
    formData.append('documentType', documentType);
    formData.append('documentName', documentName || selectedFile.name);
    if (remarks) formData.append('remarks', remarks);

    uploadFileMutation.mutate(formData);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const studentsList = studentsData?.data || [];

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Files className="w-5 h-5 text-[#eb4438]" /> Student Document Repository &amp; Verification
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#eb4438]/10 text-[#eb4438] border border-[#eb4438]/20">
              <Cloud className="w-3 h-3" /> S3 Storage (Railway S3)
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Secure cloud-backed institutional archives for birth certificates, transfer certificates, previous marksheets, and identity records
          </p>
        </div>
        <Button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-2 bg-[#eb4438] hover:bg-[#d9382d] text-white shadow-sm"
        >
          <UploadCloud className="w-4 h-4" /> Upload Document to S3
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 text-xs">
        {['', 'PENDING', 'VERIFIED', 'REJECTED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              statusFilter === st
                ? 'bg-[#eb4438] text-white shadow-sm'
                : 'bg-white dark:bg-[#2b2b2b] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#383838] hover:bg-slate-50 dark:hover:bg-[#333333]'
            }`}
          >
            {st === '' ? 'All Documents' : st}
          </button>
        ))}
      </div>

      {/* Documents Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        ) : docs && docs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#1a1a1a] border-b border-slate-200 dark:border-[#333333] text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-4 font-semibold">Student Name</th>
                  <th className="py-3 px-4 font-semibold">Document Title</th>
                  <th className="py-3 px-4 font-semibold">Type</th>
                  <th className="py-3 px-4 font-semibold">Storage</th>
                  <th className="py-3 px-4 font-semibold">Uploaded Date</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#333333]">
                {docs.map((d: any) => (
                  <tr key={d.id} className="hover:bg-slate-50/50 dark:hover:bg-[#2a2a2a]/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                      <div>{d.student?.firstName} {d.student?.lastName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{d.student?.studentCode}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800 dark:text-slate-200 font-medium flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#eb4438] shrink-0" />
                        <span>{d.documentName}</span>
                      </div>
                      {d.remarks && (
                        <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-xs">
                          {d.remarks}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      <Badge variant="neutral" className="text-[10px]">{d.documentType.replace(/_/g, ' ')}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40">
                        <Cloud className="w-3 h-3" /> S3
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        d.status === 'VERIFIED'
                          ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                          : d.status === 'REJECTED'
                          ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300'
                          : 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View in S3 / Download */}
                        <a
                          href={d.viewUrl || d.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md border border-slate-200 dark:border-[#383838] bg-white dark:bg-[#2b2b2b] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#333333] text-xs font-medium transition-colors"
                        >
                          <ExternalLink className="w-3 h-3 text-[#eb4438]" /> View
                        </a>

                        {d.status === 'PENDING' && (
                          <>
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 px-2.5 text-xs"
                              onClick={() => verifyMutation.mutate({ id: d.id, data: { status: 'VERIFIED' } })}
                            >
                              <Check className="w-3 h-3 mr-1" /> Verify
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-rose-600 border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/20 h-7 px-2.5 text-xs"
                              onClick={() => setSelectedDoc(d)}
                            >
                              <X className="w-3 h-3 mr-1" /> Reject
                            </Button>
                          </>
                        )}

                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600"
                          title="Delete Document"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete ${d.documentName}?`)) {
                              deleteMutation.mutate(d.id);
                            }
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
            <Files className="w-8 h-8 mx-auto mb-2 opacity-50" />
            No student documents found. Click "Upload Document to S3" to upload institutional records.
          </div>
        )}
      </Card>

      {/* Reject Modal */}
      {selectedDoc && (
        <Modal
          isOpen={!!selectedDoc}
          onClose={() => setSelectedDoc(null)}
          title={`Reject Document: ${selectedDoc.documentName}`}
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 dark:text-slate-400">
              Provide feedback on why this document is rejected (e.g. illegible scan, mismatched identity details, expired document):
            </p>
            <textarea
              rows={3}
              value={rejectRemarks}
              onChange={(e) => setRejectRemarks(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-[#383838] dark:bg-[#212121] dark:text-white text-xs focus:ring-2 focus:ring-[#eb4438]"
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setSelectedDoc(null)}>
                Cancel
              </Button>
              <Button
                className="bg-rose-600 hover:bg-rose-700 text-white"
                onClick={() =>
                  verifyMutation.mutate({
                    id: selectedDoc.id,
                    data: { status: 'REJECTED', remarks: rejectRemarks },
                  })
                }
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Upload Document Modal (Railway S3 Upload) */}
      {isUploadModalOpen && (
        <Modal
          isOpen={isUploadModalOpen}
          onClose={closeUploadModal}
          title="Upload Student Document to S3"
        >
          <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
            {uploadError && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Drag & Drop File Zone */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1.5">
                Select Document File
              </label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-[#eb4438] bg-[#eb4438]/5'
                    : selectedFile
                    ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20'
                    : 'border-slate-300 dark:border-[#383838] hover:border-[#eb4438] hover:bg-slate-50 dark:hover:bg-[#2b2b2b]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileChange(e.target.files[0]);
                    }
                  }}
                />

                {selectedFile ? (
                  <div className="flex flex-col items-center">
                    <FileCheck className="w-8 h-8 text-emerald-600 mb-2" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                      {selectedFile.name}
                    </span>
                    <span className="text-[11px] text-slate-500 mt-0.5">
                      {formatFileSize(selectedFile.size)} &middot; Ready for S3 upload
                    </span>
                    <span className="text-[10px] text-[#eb4438] mt-2 underline">Click to change file</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <UploadCloud className="w-8 h-8 text-[#eb4438] mb-2" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Click to browse or drag and drop document
                    </span>
                    <span className="text-[11px] text-slate-500 mt-1">
                      Supports PDF, PNG, JPG, WEBP, DOC, DOCX (Max 25MB)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Student Dropdown */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                Select Student <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-[#383838] dark:bg-[#212121] dark:text-white text-xs focus:ring-2 focus:ring-[#eb4438]"
              >
                <option value="">-- Choose Student --</option>
                {studentsList.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName} ({s.studentCode}) - {s.class?.name || 'Class 10'}
                  </option>
                ))}
              </select>
            </div>

            {/* Category & Title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Document Category</label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-[#383838] dark:bg-[#212121] dark:text-white text-xs"
                >
                  <option value="BIRTH_CERTIFICATE">Birth Certificate</option>
                  <option value="TRANSFER_CERTIFICATE">Transfer Certificate (TC)</option>
                  <option value="PREVIOUS_MARKSHEET">Previous Marksheet</option>
                  <option value="ID_PROOF">Aadhaar / National ID Proof</option>
                  <option value="MEDICAL_RECORD">Medical Record &amp; Immunization</option>
                  <option value="OTHER">Other Institutional Document</option>
                </select>
              </div>

              <Input
                label="Document Title"
                required
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder="e.g. Birth Certificate Original"
              />
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Remarks (Optional)</label>
              <Input
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Verified by parent during admissions"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-[#333333]">
              <Button type="button" variant="outline" onClick={closeUploadModal}>
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={uploadFileMutation.isPending}
                className="bg-[#eb4438] hover:bg-[#d9382d] text-white flex items-center gap-1.5"
              >
                <Cloud className="w-4 h-4" /> Upload to S3
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
