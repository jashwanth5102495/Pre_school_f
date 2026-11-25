import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schoolPortalService } from '../../services/school-portal.service';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { CalendarDays, Plus, Clock, CheckCircle2 } from 'lucide-react';

export const TeacherLeavesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    leaveTypeId: '',
    startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    reason: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['teacher-leaves'],
    queryFn: () => schoolPortalService.getTeacherLeaves(),
  });

  const applyMutation = useMutation({
    mutationFn: (data: any) => schoolPortalService.applyTeacherLeave(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-leaves'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-dashboard'] });
      setIsModalOpen(false);
      setForm({
        leaveTypeId: '',
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        reason: '',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyMutation.mutate(form);
  };

  const balances = data?.balances || [];
  const applications = data?.applications || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-indigo-600" /> Faculty Leave Applications &amp; Balances
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Check allocated leave quota, submit requests to Head Master, and view approval statuses
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4" /> Apply for Leave
        </Button>
      </div>

      {/* Leave Balances Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {balances.map((b: any) => {
          const remaining = b.allocatedDays - b.usedDays;
          return (
            <Card key={b.id} className="p-5">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-xs text-slate-800">{b.leaveType?.name}</span>
                <Badge variant="brand" className="font-bold">
                  {remaining} Available
                </Badge>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 mt-3">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{ width: `${Math.min(100, (remaining / b.allocatedDays) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 mt-2">
                <span>Consumed: {b.usedDays} days</span>
                <span>Annual Quota: {b.allocatedDays} days</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Applications History Table */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-900">
          My Submitted Leave Applications History
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        ) : applications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-3 px-4 font-semibold">Leave Type</th>
                  <th className="py-3 px-4 font-semibold">From Date</th>
                  <th className="py-3 px-4 font-semibold">To Date</th>
                  <th className="py-3 px-4 font-semibold">Reason</th>
                  <th className="py-3 px-4 font-semibold">Applied Date</th>
                  <th className="py-3 px-4 font-semibold">Review Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app: any) => (
                  <tr key={app.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-semibold text-slate-900">{app.leaveType?.name}</td>
                    <td className="py-3 px-4 text-slate-700">{new Date(app.startDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-slate-700">{new Date(app.endDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{app.reason}</td>
                    <td className="py-3 px-4 text-slate-400">{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        app.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : app.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs">No leave requests filed yet.</div>
        )}
      </Card>

      {/* Apply Leave Modal */}
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Submit Faculty Leave Application">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Select Leave Category</label>
              <select
                required
                value={form.leaveTypeId}
                onChange={(e) => setForm({ ...form, leaveTypeId: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Leave Type</option>
                {balances.map((b: any) => (
                  <option key={b.leaveTypeId} value={b.leaveTypeId}>
                    {b.leaveType?.name} ({b.allocatedDays - b.usedDays} days balance)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Start Date"
                type="date"
                required
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
              <Input
                label="End Date"
                type="date"
                required
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Reason for Leave</label>
              <textarea
                required
                rows={3}
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="State official reason (e.g. personal emergency, attending faculty symposium)..."
                className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={applyMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700">
                Submit Application to Head Master
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
