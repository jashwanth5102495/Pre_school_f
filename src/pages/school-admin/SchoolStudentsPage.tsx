import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schoolPortalService } from '../../services/school-portal.service';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  GraduationCap,
  Search,
  Plus,
  Eye,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  FileText,
  CreditCard,
  Award,
} from 'lucide-react';

export const SchoolStudentsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);

  // Form state for enrollment
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: 'MALE',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    classId: '',
    sectionId: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['school-students', search],
    queryFn: () => schoolPortalService.getStudents({ search }),
  });

  const { data: studentDetail, isLoading: isDetailLoading } = useQuery({
    queryKey: ['school-student-detail', selectedStudentId],
    queryFn: () => schoolPortalService.getStudentById(selectedStudentId!),
    enabled: !!selectedStudentId,
  });

  const { data: classes } = useQuery({
    queryKey: ['school-classes'],
    queryFn: () => schoolPortalService.getClasses(),
  });

  const enrollMutation = useMutation({
    mutationFn: (data: any) => schoolPortalService.createStudent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-students'] });
      queryClient.invalidateQueries({ queryKey: ['school-admin-dashboard'] });
      setIsEnrollModalOpen(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        gender: 'MALE',
        parentName: '',
        parentPhone: '',
        parentEmail: '',
        classId: '',
        sectionId: '',
      });
    },
  });

  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    enrollMutation.mutate(formData);
  };

  const studentsList = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-600" /> Student Directory &amp; Records
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Complete student academic history, attendance, documents, and fee records
          </p>
        </div>
        <Button onClick={() => setIsEnrollModalOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Enroll New Student
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name, code (STU-...), admission number, or parent name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </Card>

      {/* Students Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-3 px-4 font-semibold">Student Code</th>
                  <th className="py-3 px-4 font-semibold">Admission #</th>
                  <th className="py-3 px-4 font-semibold">Full Name</th>
                  <th className="py-3 px-4 font-semibold">Class &amp; Section</th>
                  <th className="py-3 px-4 font-semibold">Parent Contact</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentsList.map((stu: any) => (
                  <tr key={stu.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-blue-600">{stu.studentCode}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{stu.admissionNo}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {stu.firstName} {stu.lastName}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {stu.class?.name || 'Class 10'} {stu.section ? `- ${stu.section.name}` : ''}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>{stu.parentName || 'N/A'}</div>
                      <div className="text-[10px] text-slate-400">{stu.parentPhone || ''}</div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="success">
                        {stu.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedStudentId(stu.id)}
                        className="text-xs h-7 px-2.5"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> View Profile
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Student Profile Modal */}
      {selectedStudentId && (
        <Modal
          isOpen={!!selectedStudentId}
          onClose={() => setSelectedStudentId(null)}
          title={`Student Profile: ${studentDetail ? `${studentDetail.firstName} ${studentDetail.lastName}` : 'Loading...'}`}
          maxWidth="3xl"
        >
          {isDetailLoading || !studentDetail ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-40 w-full rounded-xl" />
            </div>
          ) : (
            <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
              {/* Header Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap justify-between items-center gap-3">
                <div>
                  <div className="text-base font-bold text-slate-900">
                    {studentDetail.firstName} {studentDetail.lastName}
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    Code: {studentDetail.studentCode} &middot; Admission: {studentDetail.admissionNo}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold text-blue-600">
                    {studentDetail.class?.name || 'Class 10'} &middot; {studentDetail.section?.name || 'Section A'}
                  </div>
                  <div className="text-[11px] text-slate-500">Gender: {studentDetail.gender || 'Not specified'}</div>
                </div>
              </div>

              {/* Parent & Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block mb-1 font-medium">Guardian Info</span>
                  <div className="font-semibold text-slate-800">{studentDetail.parentName || 'N/A'}</div>
                  <div className="text-slate-500 flex items-center gap-1.5 mt-1">
                    <Phone className="w-3 h-3" /> {studentDetail.parentPhone || 'No phone'}
                  </div>
                  <div className="text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <Mail className="w-3 h-3" /> {studentDetail.parentEmail || 'No email'}
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block mb-1 font-medium">Residential &amp; Medical</span>
                  <div className="text-slate-700">{studentDetail.address || 'Address on file'}</div>
                  <div className="text-slate-500 mt-1">Blood Group: <span className="font-semibold">{studentDetail.bloodGroup || 'B+'}</span></div>
                </div>
              </div>

              {/* Academic Marks History */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" /> Examination Performance
                </h4>
                {studentDetail.marks && studentDetail.marks.length > 0 ? (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                        <tr>
                          <th className="py-2 px-3">Exam</th>
                          <th className="py-2 px-3">Subject</th>
                          <th className="py-2 px-3">Marks</th>
                          <th className="py-2 px-3">Grade</th>
                          <th className="py-2 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {studentDetail.marks.map((m: any) => (
                          <tr key={m.id}>
                            <td className="py-2 px-3">{m.examSubject?.exam?.name || 'Mid-Term'}</td>
                            <td className="py-2 px-3 font-medium">{m.examSubject?.subject?.name || 'Subject'}</td>
                            <td className="py-2 px-3 font-semibold text-slate-900">{m.marksObtained} / 100</td>
                            <td className="py-2 px-3 font-bold text-blue-600">{m.grade || 'A'}</td>
                            <td className="py-2 px-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700">
                                {m.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 p-3 bg-slate-50 rounded-lg">No examination records logged yet.</div>
                )}
              </div>

              {/* Fee Payment Obligations */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-blue-600" /> Fee Accounts &amp; Payments
                </h4>
                {studentDetail.fees && studentDetail.fees.length > 0 ? (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                        <tr>
                          <th className="py-2 px-3">Category</th>
                          <th className="py-2 px-3">Total Amount</th>
                          <th className="py-2 px-3">Paid</th>
                          <th className="py-2 px-3">Balance</th>
                          <th className="py-2 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {studentDetail.fees.map((f: any) => (
                          <tr key={f.id}>
                            <td className="py-2 px-3 font-medium">{f.feeStructure?.category?.name || 'Tuition'}</td>
                            <td className="py-2 px-3">₹{f.amount.toLocaleString()}</td>
                            <td className="py-2 px-3 text-emerald-600 font-semibold">₹{f.paidAmount.toLocaleString()}</td>
                            <td className="py-2 px-3 text-rose-600 font-semibold">₹{f.balanceAmount.toLocaleString()}</td>
                            <td className="py-2 px-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                f.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {f.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 p-3 bg-slate-50 rounded-lg">No fee structures assigned yet.</div>
                )}
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* Enroll Student Modal */}
      {isEnrollModalOpen && (
        <Modal
          isOpen={isEnrollModalOpen}
          onClose={() => setIsEnrollModalOpen(false)}
          title="Enroll New Student to Roster"
        >
          <form onSubmit={handleEnrollSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First Name"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Student first name"
              />
              <Input
                label="Last Name"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Student last name"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Class</label>
                <select
                  required
                  value={formData.classId}
                  onChange={(e) => {
                    const newClassId = e.target.value;
                    const c = classes?.find((cls: any) => cls.id === newClassId);
                    setFormData({
                      ...formData,
                      classId: newClassId,
                      sectionId: c?.sections?.[0]?.id || '',
                    });
                  }}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-[#383838] bg-white dark:bg-[#202020] text-xs focus:ring-2 focus:ring-[#eb4438]"
                >
                  <option value="">Select Class</option>
                  {classes?.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Section</label>
                <select
                  value={formData.sectionId}
                  onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-[#383838] bg-white dark:bg-[#202020] text-xs focus:ring-2 focus:ring-[#eb4438]"
                >
                  {classes?.find((c: any) => c.id === formData.classId)?.sections?.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  )) || <option value="">Default (Section A)</option>}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-[#383838] bg-white dark:bg-[#202020] text-xs"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Guardian Name"
                required
                value={formData.parentName}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                placeholder="Parent / Guardian Name"
              />
              <Input
                label="Guardian Phone"
                required
                value={formData.parentPhone}
                onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                placeholder="+91 98..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsEnrollModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={enrollMutation.isPending}>
                Complete Enrollment
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
