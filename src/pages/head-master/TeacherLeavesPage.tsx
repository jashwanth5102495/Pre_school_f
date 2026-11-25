import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schoolPortalService } from '../../services/school-portal.service';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { CalendarDays, Check, X, Clock, UserCheck, AlertCircle } from 'lucide-react';

export const TeacherLeavesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedLeave, setSelectedLeave] = useState<any>(null);
  const [reviewAction, setReviewAction] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [substituteTeacherId, setSubstituteTeacherId] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const { data: leaves, isLoading } = useQuery({
    queryKey: ['head-master-leaves'],
    queryFn: () => schoolPortalService.getLeaves(),
  });

  const { data: staffData } = useQuery({
    queryKey: ['school-staff'],
    queryFn: () => schoolPortalService.getStaff(),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      schoolPortalService.reviewLeave(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['head-master-leaves'] });
      queryClient.invalidateQueries({ queryKey: ['head-master-dashboard'] });
      setSelectedLeave(null);
      setSubstituteTeacherId('');
      setRejectionReason('');
    },
  });

  const openReviewModal = (leave: any, action: 'APPROVE' | 'REJECT') => {
    setSelectedLeave(leave);
    setReviewAction(action);
    setSubstituteTeacherId(leave.substituteTeacherId || '');
    setRejectionReason('');
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeave) return;

    reviewMutation.mutate({
      id: selectedLeave.id,
      data: {
        action: reviewAction,
        substituteTeacherId: substituteTeacherId || undefined,
        rejectionReason: reviewAction === 'REJECT' ? rejectionReason : undefined,
      },
    });
  };

  const teachers = staffData?.teachers || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-amber-600" /> Faculty Leave Applications &amp; Substitute Assignment
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Review, approve, or reject teacher leave requests, assign proxy teachers, and automatically sync leave balances
        </p>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : leaves && leaves.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-3 px-4 font-semibold">Teacher</th>
                  <th className="py-3 px-4 font-semibold">Leave Type</th>
                  <th className="py-3 px-4 font-semibold">Duration</th>
                  <th className="py-3 px-4 font-semibold">Reason</th>
                  <th className="py-3 px-4 font-semibold">Substitute Assigned</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaves.map((l: any) => (
                  <tr key={l.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">
                        {l.teacher?.firstName} {l.teacher?.lastName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">{l.teacher?.teacherCode}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">{l.leaveType?.name}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {new Date(l.startDate).toLocaleDateString()} to {new Date(l.endDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{l.reason}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {l.substituteTeacher ? (
                        <span className="flex items-center gap-1 text-slate-700 font-medium">
                          <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                          {l.substituteTeacher.firstName} {l.substituteTeacher.lastName}
                        </span>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        l.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-700'
                          : l.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {l.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 px-2.5 text-xs"
                            onClick={() => openReviewModal(l, 'APPROVE')}
                          >
                            <Check className="w-3 h-3 mr-1" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-rose-600 border-rose-200 hover:bg-rose-50 h-7 px-2.5 text-xs"
                            onClick={() => openReviewModal(l, 'REJECT')}
                          >
                            <X className="w-3 h-3 mr-1" /> Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">Decision Recorded</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs">No leave applications currently submitted.</div>
        )}
      </Card>

      {/* Review Modal */}
      {selectedLeave && (
        <Modal
          isOpen={!!selectedLeave}
          onClose={() => setSelectedLeave(null)}
          title={reviewAction === 'APPROVE' ? 'Approve Faculty Leave Request' : 'Reject Faculty Leave Request'}
        >
          <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="font-bold text-slate-900 text-sm">
                {selectedLeave.teacher?.firstName} {selectedLeave.teacher?.lastName}
              </div>
              <div className="text-slate-500 mt-0.5">
                Leave Type: <strong className="text-slate-800">{selectedLeave.leaveType?.name}</strong> &middot;{' '}
                {new Date(selectedLeave.startDate).toLocaleDateString()} to{' '}
                {new Date(selectedLeave.endDate).toLocaleDateString()}
              </div>
              <div className="text-slate-600 mt-2 text-[11px]">Reason: {selectedLeave.reason}</div>
            </div>

            {reviewAction === 'APPROVE' ? (
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Assign Substitute / Proxy Teacher (Optional)
                </label>
                <select
                  value={substituteTeacherId}
                  onChange={(e) => setSubstituteTeacherId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">No Substitute Required</option>
                  {teachers
                    .filter((t: any) => t.id !== selectedLeave.teacherId)
                    .map((t: any) => (
                      <option key={t.id} value={t.id}>
                        {t.firstName} {t.lastName} ({t.designation || 'Teacher'})
                      </option>
                    ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Assigned substitute teacher will cover classes during this leave period.
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Rejection Reason / Administrative Feedback
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this leave application cannot be sanctioned..."
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setSelectedLeave(null)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className={reviewAction === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}
                isLoading={reviewMutation.isPending}
              >
                Confirm {reviewAction === 'APPROVE' ? 'Approval' : 'Rejection'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
