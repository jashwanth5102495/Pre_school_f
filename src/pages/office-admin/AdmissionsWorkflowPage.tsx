import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schoolPortalService } from '../../services/school-portal.service';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { UserPlus, Plus, Check, X, UserCheck, Phone, Mail, Search } from 'lucide-react';

export const AdmissionsWorkflowPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [enrollTargetApp, setEnrollTargetApp] = useState<any>(null);

  // Registration Form
  const [regForm, setRegForm] = useState({
    firstName: '',
    lastName: '',
    gender: 'MALE',
    dob: '2012-05-10',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    applyingClassId: '',
    remarks: '',
  });

  // Enrollment Form
  const [enrollForm, setEnrollForm] = useState({
    sectionId: '',
  });

  const { data: admissions, isLoading } = useQuery({
    queryKey: ['office-admissions', search],
    queryFn: () => schoolPortalService.getAdmissions({ search }),
  });

  const { data: classes } = useQuery({
    queryKey: ['school-classes'],
    queryFn: () => schoolPortalService.getClasses(),
  });

  const registerMutation = useMutation({
    mutationFn: (data: any) => schoolPortalService.createAdmission(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['office-admissions'] });
      queryClient.invalidateQueries({ queryKey: ['office-dashboard'] });
      setIsRegisterModalOpen(false);
      setRegForm({
        firstName: '',
        lastName: '',
        gender: 'MALE',
        dob: '2012-05-10',
        parentName: '',
        parentPhone: '',
        parentEmail: '',
        applyingClassId: '',
        remarks: '',
      });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      schoolPortalService.updateAdmissionStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['office-admissions'] });
      queryClient.invalidateQueries({ queryKey: ['office-dashboard'] });
    },
  });

  const enrollMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      schoolPortalService.enrollStudent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['office-admissions'] });
      queryClient.invalidateQueries({ queryKey: ['office-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['school-students'] });
      setEnrollTargetApp(null);
    },
  });

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(regForm);
  };

  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollTargetApp) return;

    enrollMutation.mutate({
      id: enrollTargetApp.id,
      data: {
        classId: enrollTargetApp.applyingClassId,
        sectionId: enrollForm.sectionId,
      },
    });
  };

  const targetClass = classes?.find((c: any) => c.id === enrollTargetApp?.applyingClassId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-600" /> Admissions Processing &amp; Enrollment
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Intake pipeline: registration, document review, acceptance, and official roster enrollment
          </p>
        </div>
        <Button onClick={() => setIsRegisterModalOpen(true)} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4" /> Register Candidate Application
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="p-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidate by name, application number (APP-...), or parent..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </Card>

      {/* Applications Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : admissions && admissions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-3 px-4 font-semibold">Application #</th>
                  <th className="py-3 px-4 font-semibold">Candidate Name</th>
                  <th className="py-3 px-4 font-semibold">Class Applying</th>
                  <th className="py-3 px-4 font-semibold">Guardian Info</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Workflow Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {admissions.map((app: any) => (
                  <tr key={app.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-medium text-emerald-700">
                      {app.applicationNumber}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <div>{app.firstName} {app.lastName}</div>
                      <div className="text-[10px] text-slate-400">Gender: {app.gender || 'MALE'}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {app.applyingClass?.name || 'Class 10'}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>{app.parentName}</div>
                      <div className="text-[10px] text-slate-400">{app.parentPhone}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        app.status === 'ADMITTED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : app.status === 'APPROVED'
                          ? 'bg-blue-100 text-blue-800'
                          : app.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {app.status === 'PENDING' && (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white h-7 px-2.5 text-xs"
                            onClick={() => statusMutation.mutate({ id: app.id, data: { status: 'APPROVED' } })}
                          >
                            <Check className="w-3 h-3 mr-1" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-rose-600 border-rose-200 hover:bg-rose-50 h-7 px-2.5 text-xs"
                            onClick={() => statusMutation.mutate({ id: app.id, data: { status: 'REJECTED' } })}
                          >
                            <X className="w-3 h-3 mr-1" /> Reject
                          </Button>
                        </div>
                      )}

                      {app.status === 'APPROVED' && (
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 px-2.5 text-xs"
                          onClick={() => {
                            setEnrollTargetApp(app);
                            const foundClass = classes?.find((c: any) => c.id === app.applyingClassId);
                            setEnrollForm({ sectionId: foundClass?.sections?.[0]?.id || '' });
                          }}
                        >
                          <UserCheck className="w-3.5 h-3.5 mr-1" /> Officially Enroll
                        </Button>
                      )}

                      {app.status === 'ADMITTED' && (
                        <span className="text-[11px] text-emerald-700 font-medium">Enrolled on Roster</span>
                      )}

                      {app.status === 'REJECTED' && (
                        <span className="text-[11px] text-slate-400">Application Declined</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs">No admission applications found.</div>
        )}
      </Card>

      {/* Candidate Registration Modal */}
      {isRegisterModalOpen && (
        <Modal
          isOpen={isRegisterModalOpen}
          onClose={() => setIsRegisterModalOpen(false)}
          title="Register Admission Candidate Application"
        >
          <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First Name"
                required
                value={regForm.firstName}
                onChange={(e) => setRegForm({ ...regForm, firstName: e.target.value })}
                placeholder="Candidate first name"
              />
              <Input
                label="Last Name"
                required
                value={regForm.lastName}
                onChange={(e) => setRegForm({ ...regForm, lastName: e.target.value })}
                placeholder="Candidate last name"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Applying Class</label>
                <select
                  required
                  value={regForm.applyingClassId}
                  onChange={(e) => setRegForm({ ...regForm, applyingClassId: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select Grade</option>
                  {classes?.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Gender</label>
                <select
                  value={regForm.gender}
                  onChange={(e) => setRegForm({ ...regForm, gender: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Parent / Guardian Name"
                required
                value={regForm.parentName}
                onChange={(e) => setRegForm({ ...regForm, parentName: e.target.value })}
                placeholder="Full parent name"
              />
              <Input
                label="Parent Contact Phone"
                required
                value={regForm.parentPhone}
                onChange={(e) => setRegForm({ ...regForm, parentPhone: e.target.value })}
                placeholder="+91 98..."
              />
            </div>

            <Input
              label="Application Notes / Migration Details"
              value={regForm.remarks}
              onChange={(e) => setRegForm({ ...regForm, remarks: e.target.value })}
              placeholder="e.g. Transferred from Bangalore CBSE school, marks verified"
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsRegisterModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={registerMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700">
                Register Candidate
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Official Enrollment Modal */}
      {enrollTargetApp && (
        <Modal
          isOpen={!!enrollTargetApp}
          onClose={() => setEnrollTargetApp(null)}
          title="Official Enrollment into School Roster"
        >
          <form onSubmit={handleEnrollSubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-slate-800">
              <div className="font-bold text-sm">
                Enrolling: {enrollTargetApp.firstName} {enrollTargetApp.lastName}
              </div>
              <div className="text-[11px] text-slate-600 mt-1">
                Class: <strong className="text-slate-900">{enrollTargetApp.applyingClass?.name || 'Class 10'}</strong>
              </div>
              <div className="text-[11px] text-slate-600">
                Parent: {enrollTargetApp.parentName} ({enrollTargetApp.parentPhone})
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Assign Section</label>
              <select
                required
                value={enrollForm.sectionId}
                onChange={(e) => setEnrollForm({ ...enrollForm, sectionId: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select Section</option>
                {targetClass?.sections?.map((sec: any) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.name} ({sec.capacity} Capacity)
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-[11px] space-y-1">
              <div className="font-semibold text-slate-800">Automatic Roster Actions:</div>
              <div>&bull; Generates official Student Code (STU-XXXX) and Admission Number.</div>
              <div>&bull; Sets up fee accounts according to Grade 10 fee structures.</div>
              <div>&bull; Links student to section attendance roster.</div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setEnrollTargetApp(null)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={enrollMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700">
                Confirm Enrollment
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
