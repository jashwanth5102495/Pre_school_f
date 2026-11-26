import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schoolPortalService } from '../../services/school-portal.service';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { Users, Plus, Mail, Phone, BookOpen, ShieldCheck } from 'lucide-react';

export const SchoolStaffPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'TEACHER',
    designation: 'Faculty Teacher',
    qualification: 'M.Sc., B.Ed.',
    specialization: '',
    password: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['school-staff'],
    queryFn: () => schoolPortalService.getStaff(),
  });

  const createStaffMutation = useMutation({
    mutationFn: (data: any) => schoolPortalService.createStaff(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-staff'] });
      queryClient.invalidateQueries({ queryKey: ['school-admin-dashboard'] });
      setIsModalOpen(false);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        role: 'TEACHER',
        designation: 'Faculty Teacher',
        qualification: 'M.Sc., B.Ed.',
        specialization: '',
        password: '',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createStaffMutation.mutate(formData);
  };

  const teachers = data?.teachers || [];
  const schoolUsers = data?.schoolUsers || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" /> Teaching Faculty &amp; School Staff
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Directory of teachers, administrators, and operational staff with teaching allocations
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-[#eb4438] hover:bg-[#c9352a] text-white">
          <Plus className="w-4 h-4" /> Add Teacher / Staff Member
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Faculty Teachers Cards */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Teaching Faculty ({teachers.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teachers.map((tch: any) => (
                <Card key={tch.id} className="p-5 flex flex-col justify-between hover:border-blue-200 transition-colors">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-bold text-slate-900">
                          {tch.firstName} {tch.lastName}
                        </div>
                        <div className="text-xs text-blue-600 font-medium mt-0.5">
                          {tch.designation || 'Teacher'}
                        </div>
                      </div>
                      <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                        {tch.teacherCode}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{tch.email}</span>
                      </div>
                      {tch.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{tch.phone}</span>
                        </div>
                      )}
                      <div className="text-[11px] text-slate-600 pt-1">
                        Qualification: <span className="font-medium">{tch.qualification || 'B.Ed.'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5 mb-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-blue-500" /> Assigned Classes:
                    </div>
                    {tch.allocations && tch.allocations.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {tch.allocations.map((a: any) => (
                          <span
                            key={a.id}
                            className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-medium border border-blue-100"
                          >
                            {a.class?.name} ({a.section?.name}) - {a.subject?.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400">No classes assigned yet</span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* School User Accounts */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Administrative &amp; Portal Accounts ({schoolUsers.length})
            </h3>
            <Card className="overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Name</th>
                    <th className="py-3 px-4 font-semibold">Email</th>
                    <th className="py-3 px-4 font-semibold">Role</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Last Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {schoolUsers.map((u: any) => (
                    <tr key={u.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-medium text-slate-900 flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                        {u.fullName}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{u.email}</td>
                      <td className="py-3 px-4">
                        <Badge variant="neutral" className="font-semibold text-[10px]">
                          {u.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700">
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create School Staff / Teacher Account">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <Input
              label="Full Name"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="e.g. Dr. Rajesh Kumar"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Email Address"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="staff@school.edu"
              />
              <Input
                label="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-200 text-xs"
                >
                  <option value="TEACHER">Teacher</option>
                  <option value="HEAD_MASTER">Head Master</option>
                  <option value="OFFICE_ADMIN">Office Admin</option>
                  <option value="SCHOOL_ADMIN">School Admin</option>
                </select>
              </div>
              <Input
                label="Designation"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                placeholder="e.g. Senior Math Faculty"
              />
            </div>
            <Input
              label="Temporary Password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••••••"
            />
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={createStaffMutation.isPending}>
                Create Staff Account
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
