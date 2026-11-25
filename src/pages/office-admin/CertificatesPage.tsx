import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schoolPortalService } from '../../services/school-portal.service';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { Award, Plus, Printer, CheckCircle2 } from 'lucide-react';

export const CertificatesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCertificate, setActiveCertificate] = useState<any>(null);

  const [form, setForm] = useState({
    studentId: '',
    certificateType: 'BONAFIDE',
    purpose: 'Higher Education & Visa Verification',
  });

  const { data: certs, isLoading } = useQuery({
    queryKey: ['office-certificates'],
    queryFn: () => schoolPortalService.getCertificates(),
  });

  const { data: studentsData } = useQuery({
    queryKey: ['school-students-dropdown'],
    queryFn: () => schoolPortalService.getStudents({ limit: 100 }),
  });

  const generateMutation = useMutation({
    mutationFn: (data: any) =>
      schoolPortalService.generateCertificate({
        studentId: data.studentId,
        certificateType: data.certificateType,
        contentJson: {
          purpose: data.purpose,
          academicYear: '2025-2026',
        },
      }),
    onSuccess: (newCert) => {
      queryClient.invalidateQueries({ queryKey: ['office-certificates'] });
      setIsModalOpen(false);
      setActiveCertificate(newCert);
    },
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    generateMutation.mutate(form);
  };

  const studentsList = studentsData?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" /> Official Certificate Issuance &amp; Verification
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Generate and print authenticated Bonafide, Study &amp; Conduct, and Transfer Certificates (TC)
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4" /> Issue New Certificate
        </Button>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        ) : certs && certs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-3 px-4 font-semibold">Certificate Number</th>
                  <th className="py-3 px-4 font-semibold">Student Name</th>
                  <th className="py-3 px-4 font-semibold">Class</th>
                  <th className="py-3 px-4 font-semibold">Certificate Type</th>
                  <th className="py-3 px-4 font-semibold">Issue Date</th>
                  <th className="py-3 px-4 font-semibold text-right">View / Print</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {certs.map((c: any) => (
                  <tr key={c.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-medium text-emerald-700">
                      {c.certificateNumber}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <div>{c.student?.firstName} {c.student?.lastName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{c.student?.studentCode}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{c.student?.class?.name}</td>
                    <td className="py-3 px-4">
                      <Badge variant="neutral" className="font-semibold text-[10px]">
                        {c.certificateType}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(c.issueDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setActiveCertificate(c)}
                        className="text-xs h-7 px-2.5"
                      >
                        <Printer className="w-3.5 h-3.5 mr-1" /> View &amp; Print
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs">No certificates issued yet.</div>
        )}
      </Card>

      {/* Generate Certificate Modal */}
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Issue Official Institutional Certificate">
          <form onSubmit={handleGenerate} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Select Student</label>
              <select
                required
                value={form.studentId}
                onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Choose Student</option>
                {studentsList.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName} ({s.studentCode}) - {s.class?.name || 'Class 10'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Certificate Type</label>
              <select
                value={form.certificateType}
                onChange={(e) => setForm({ ...form, certificateType: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 text-xs"
              >
                <option value="BONAFIDE">Bonafide Certificate</option>
                <option value="STUDY">Study &amp; Character Certificate</option>
                <option value="CONDUCT">Good Conduct Certificate</option>
                <option value="TRANSFER">Transfer Certificate (TC)</option>
              </select>
            </div>

            <Input
              label="Declared Purpose / Remarks"
              value={form.purpose}
              onChange={(e) => setForm({ ...form, purpose: e.target.value })}
              placeholder="e.g. Passport verification or scholarship submission"
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={generateMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700">
                Generate Authenticated Certificate
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Printable Certificate Modal */}
      {activeCertificate && (
        <Modal
          isOpen={!!activeCertificate}
          onClose={() => setActiveCertificate(null)}
          title="Official Certificate Document"
          maxWidth="3xl"
        >
          <div className="p-8 border-4 border-double border-slate-300 rounded-2xl bg-white shadow-sm space-y-6 text-center font-serif text-xs">
            <div>
              <div className="text-xl font-bold uppercase tracking-wider text-slate-900">
                Oakridge International Academy
              </div>
              <div className="text-[11px] text-slate-500 font-sans mt-0.5">
                CBSE Affiliation # 1130829 &middot; Knowledge Park Campus, Mumbai
              </div>
            </div>

            <div className="pt-2">
              <span className="text-sm font-bold tracking-widest uppercase border-b-2 border-slate-800 pb-1 px-4 inline-block font-sans text-emerald-800">
                {activeCertificate.certificateType} CERTIFICATE
              </span>
            </div>

            <div className="text-left font-sans text-[11px] text-slate-500 font-mono flex justify-between">
              <span>Cert #: {activeCertificate.certificateNumber}</span>
              <span>Date: {new Date(activeCertificate.issueDate).toLocaleDateString()}</span>
            </div>

            <p className="text-justify leading-relaxed text-sm font-serif text-slate-800 px-4">
              This is to certify that <strong>{activeCertificate.student?.firstName} {activeCertificate.student?.lastName}</strong>, bearing Student Identification Code <strong>{activeCertificate.student?.studentCode}</strong> and Admission Number <strong>{activeCertificate.student?.admissionNo}</strong>, is a bonafide student of this institution studying in <strong>{activeCertificate.student?.class?.name || 'Class 10'}</strong> during the academic year <strong>2025-2026</strong>. To the best of our knowledge and records, the student bears an exemplary moral character and satisfactory academic conduct.
            </p>

            <div className="text-left text-xs font-sans text-slate-600 px-4">
              Purpose: <em>{activeCertificate.contentJson?.purpose || 'Official Verification'}</em>
            </div>

            <div className="pt-12 flex justify-between items-end font-sans text-xs text-slate-600 px-4">
              <div>
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-400 font-mono">
                  Institutional Seal
                </div>
              </div>
              <div className="text-right">
                <div className="border-t border-slate-800 pt-1 font-semibold text-slate-900">
                  Principal &amp; Head Master
                </div>
                <div className="text-[10px] text-slate-400">Oakridge International Academy</div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => window.print()} className="flex items-center gap-1.5 text-xs">
              <Printer className="w-3.5 h-3.5" /> Print Certificate
            </Button>
            <Button onClick={() => setActiveCertificate(null)} className="text-xs">
              Done
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
