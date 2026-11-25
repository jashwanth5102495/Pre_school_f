import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schoolPortalService } from '../../services/school-portal.service';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { BookMarked, Plus, Calendar, Clock } from 'lucide-react';

export const TeacherHomeworkPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    classId: '',
    sectionId: '',
    subjectId: '',
    title: '',
    description: '',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const { data: homeworkList, isLoading } = useQuery({
    queryKey: ['teacher-homework'],
    queryFn: () => schoolPortalService.getHomework(),
  });

  const { data: assigned } = useQuery({
    queryKey: ['teacher-assigned'],
    queryFn: () => schoolPortalService.getTeacherAssigned(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => schoolPortalService.createHomework(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-homework'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-dashboard'] });
      setIsModalOpen(false);
      setForm({
        classId: '',
        sectionId: '',
        subjectId: '',
        title: '',
        description: '',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-indigo-600" /> Homework &amp; Classroom Assignments
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Publish coursework, reading chapters, problem sets, and submission deadlines for students
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4" /> Create Homework Assignment
        </Button>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : homeworkList && homeworkList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-3 px-4 font-semibold">Assignment Title</th>
                  <th className="py-3 px-4 font-semibold">Class &amp; Section</th>
                  <th className="py-3 px-4 font-semibold">Subject</th>
                  <th className="py-3 px-4 font-semibold">Assigned Date</th>
                  <th className="py-3 px-4 font-semibold">Submission Deadline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {homeworkList.map((hw: any) => (
                  <tr key={hw.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{hw.title}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">{hw.description}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {hw.class?.name} ({hw.section?.name})
                    </td>
                    <td className="py-3 px-4 font-semibold text-indigo-700">
                      {hw.subject?.name}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(hw.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-semibold text-rose-600">
                      {new Date(hw.dueDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs">
            No homework assignments currently posted.
          </div>
        )}
      </Card>

      {/* Create Homework Modal */}
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Assign Classroom Homework">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Target Class, Section &amp; Subject</label>
              <select
                required
                value={`${form.classId}_${form.sectionId}_${form.subjectId}`}
                onChange={(e) => {
                  const [cId, sId, subId] = e.target.value.split('_');
                  setForm({ ...form, classId: cId, sectionId: sId, subjectId: subId });
                }}
                className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Class &amp; Subject</option>
                {assigned?.map((a: any) => (
                  <option key={a.id} value={`${a.classId}_${a.sectionId}_${a.subjectId}`}>
                    {a.class?.name} ({a.section?.name}) - {a.subject?.name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Assignment Title"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Chapter 4 Practice Set &amp; Diagram Submission"
            />

            <div>
              <label className="block text-slate-700 font-medium mb-1">Instructions &amp; Problem Descriptions</label>
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Detail the questions, textbook exercises, or research tasks students must complete..."
                className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <Input
              label="Submission Deadline"
              type="date"
              required
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={createMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700">
                Publish Homework
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
