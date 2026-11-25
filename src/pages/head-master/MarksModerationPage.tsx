import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schoolPortalService } from '../../services/school-portal.service';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { FileCheck2, Eye, CheckCircle2, XCircle, Award } from 'lucide-react';

export const MarksModerationPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [reviewAction, setReviewAction] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [comments, setComments] = useState('');

  const { data: submissions, isLoading } = useQuery({
    queryKey: ['head-master-marks-submissions'],
    queryFn: () => schoolPortalService.getMarksSubmissions(),
  });

  const { data: detail, isLoading: isDetailLoading } = useQuery({
    queryKey: ['head-master-marks-detail', selectedSubmissionId],
    queryFn: () => schoolPortalService.getSubmissionDetails(selectedSubmissionId!),
    enabled: !!selectedSubmissionId,
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      schoolPortalService.reviewMarksSubmission(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['head-master-marks-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['head-master-dashboard'] });
      setSelectedSubmissionId(null);
      setComments('');
    },
  });

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmissionId) return;

    reviewMutation.mutate({
      id: selectedSubmissionId,
      data: {
        action: reviewAction,
        comments,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <FileCheck2 className="w-5 h-5 text-amber-600" /> Examination Marks Moderation &amp; Publication
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Review subject scores entered by teaching faculty, moderate grading curves, and officially publish results
        </p>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : submissions && submissions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-3 px-4 font-semibold">Exam Title</th>
                  <th className="py-3 px-4 font-semibold">Class &amp; Subject</th>
                  <th className="py-3 px-4 font-semibold">Teacher Submitting</th>
                  <th className="py-3 px-4 font-semibold">Submitted Date</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {submissions.map((sub: any) => (
                  <tr key={sub.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {sub.examSubject?.exam?.name || 'Mid-Term Exam'}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <span className="font-semibold">{sub.examSubject?.class?.name}</span> &middot;{' '}
                      <span className="text-amber-700 font-medium">{sub.examSubject?.subject?.name}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>{sub.teacher?.firstName} {sub.teacher?.lastName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{sub.teacher?.teacherCode}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(sub.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        sub.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : sub.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {sub.status === 'APPROVED' ? 'PUBLISHED' : sub.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedSubmissionId(sub.id)}
                        className="text-xs h-7 px-2.5"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> Inspect Scores
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs">No marks submissions awaiting review.</div>
        )}
      </Card>

      {/* Marks Sheet Inspection & Moderation Modal */}
      {selectedSubmissionId && (
        <Modal
          isOpen={!!selectedSubmissionId}
          onClose={() => setSelectedSubmissionId(null)}
          title="Inspect & Moderate Examination Score Sheet"
          maxWidth="3xl"
        >
          {isDetailLoading || !detail ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-40 w-full rounded-xl" />
            </div>
          ) : (
            <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1 text-xs">
              {/* Header Info */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    {detail.examSubject?.exam?.name} &middot; {detail.examSubject?.subject?.name}
                  </div>
                  <div className="text-slate-500 mt-0.5">
                    Class: <span className="font-semibold text-slate-800">{detail.examSubject?.class?.name}</span> &middot; Max Marks: {detail.examSubject?.maxMarks} &middot; Pass Marks: {detail.examSubject?.passMarks}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium text-slate-700">
                    Submitted by: {detail.teacher?.firstName} {detail.teacher?.lastName}
                  </div>
                  <Badge variant="neutral" className="mt-1 text-[10px]">
                    Status: {detail.status}
                  </Badge>
                </div>
              </div>

              {/* Student Marks Roster */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Student Code</th>
                      <th className="py-2.5 px-3 font-semibold">Name</th>
                      <th className="py-2.5 px-3 font-semibold">Marks Obtained</th>
                      <th className="py-2.5 px-3 font-semibold">Grade</th>
                      <th className="py-2.5 px-3 font-semibold">Teacher Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {detail.examSubject?.studentMarks?.map((m: any) => (
                      <tr key={m.id}>
                        <td className="py-2 px-3 font-mono text-blue-600 font-medium">
                          {m.student?.studentCode}
                        </td>
                        <td className="py-2 px-3 font-medium text-slate-900">
                          {m.student?.firstName} {m.student?.lastName}
                        </td>
                        <td className="py-2 px-3 font-bold text-slate-900">
                          {m.marksObtained} / {detail.examSubject?.maxMarks}
                        </td>
                        <td className="py-2 px-3 font-bold text-blue-600">
                          {m.grade || 'A'}
                        </td>
                        <td className="py-2 px-3 text-slate-500">{m.remarks || 'Normal performance'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Moderation Actions Form */}
              <form onSubmit={handleReviewSubmit} className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-3">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-600" /> Head Master Moderation Decision
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Administrative Comments / Reason</label>
                  <input
                    type="text"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Enter approval feedback or revisions required by faculty..."
                    className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="text-rose-600 border-rose-200 hover:bg-rose-50"
                    onClick={() => {
                      setReviewAction('REJECT');
                      reviewMutation.mutate({
                        id: selectedSubmissionId,
                        data: { action: 'REJECT', comments: comments || 'Requires revision' },
                      });
                    }}
                    isLoading={reviewMutation.isPending && reviewAction === 'REJECT'}
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1" /> Reject for Revision
                  </Button>

                  <Button
                    type="button"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => {
                      setReviewAction('APPROVE');
                      reviewMutation.mutate({
                        id: selectedSubmissionId,
                        data: { action: 'APPROVE', comments: comments || 'Moderated and approved for publication' },
                      });
                    }}
                    isLoading={reviewMutation.isPending && reviewAction === 'APPROVE'}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve &amp; Publish Marks
                  </Button>
                </div>
              </form>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};
