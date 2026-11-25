import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schoolPortalService } from '../../services/school-portal.service';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { GraduationCap, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export const TeacherAllocationsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    teacherId: '',
    classId: '',
    sectionId: '',
    subjectId: '',
    isClassTeacher: false,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['head-master-allocations'],
    queryFn: () => schoolPortalService.getAllocations(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => schoolPortalService.createAllocation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['head-master-allocations'] });
      setIsModalOpen(false);
      setFormData({
        teacherId: '',
        classId: '',
        sectionId: '',
        subjectId: '',
        isClassTeacher: false,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => schoolPortalService.deleteAllocation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['head-master-allocations'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const allocations = data?.allocations || [];
  const teachers = data?.teachers || [];
  const classes = data?.classes || [];
  const subjects = data?.subjects || [];

  const selectedClass = classes.find((c: any) => c.id === formData.classId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-amber-600" /> Faculty Allotment &amp; Class Teacher Assignments
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Assign teachers to subject curriculum, sections, and designate official Class Teachers
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700">
          <Plus className="w-4 h-4" /> Allot New Subject / Class
        </Button>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        ) : allocations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-3 px-4 font-semibold">Teacher Name</th>
                  <th className="py-3 px-4 font-semibold">Assigned Class &amp; Section</th>
                  <th className="py-3 px-4 font-semibold">Subject</th>
                  <th className="py-3 px-4 font-semibold">Designation</th>
                  <th className="py-3 px-4 font-semibold">Class Teacher Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allocations.map((alloc: any) => (
                  <tr key={alloc.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <div>{alloc.teacher?.firstName} {alloc.teacher?.lastName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{alloc.teacher?.teacherCode}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <span className="font-semibold text-slate-900">{alloc.class?.name}</span> ({alloc.section?.name})
                    </td>
                    <td className="py-3 px-4 font-semibold text-amber-700">
                      {alloc.subject?.name}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{alloc.teacher?.designation || 'Teacher'}</td>
                    <td className="py-3 px-4">
                      {alloc.isClassTeacher ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          Class Teacher
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Subject Faculty</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteMutation.mutate(alloc.id)}
                        className="text-rose-600 border-rose-200 hover:bg-rose-50 h-7 px-2 text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs">No teacher allocations configured yet.</div>
        )}
      </Card>

      {/* New Allocation Modal */}
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Assign Teacher Allocation">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Select Faculty Teacher</label>
              <select
                required
                value={formData.teacherId}
                onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Choose Teacher</option>
                {teachers.map((t: any) => (
                  <option key={t.id} value={t.id}>
                    {t.firstName} {t.lastName} ({t.teacherCode}) - {t.designation || 'Faculty'}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Class</label>
                <select
                  required
                  value={formData.classId}
                  onChange={(e) => setFormData({ ...formData, classId: e.target.value, sectionId: '' })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs"
                >
                  <option value="">Choose Class</option>
                  {classes.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Section</label>
                <select
                  required
                  disabled={!selectedClass}
                  value={formData.sectionId}
                  onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs"
                >
                  <option value="">Choose Section</option>
                  {selectedClass?.sections?.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Subject</label>
              <select
                required
                value={formData.subjectId}
                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 text-xs"
              >
                <option value="">Choose Subject</option>
                {subjects.map((sub: any) => (
                  <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
                ))}
              </select>
            </div>

            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isClassTeacher}
                  onChange={(e) => setFormData({ ...formData, isClassTeacher: e.target.checked })}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="text-xs font-semibold text-slate-800">
                  Designate as Class Teacher for this Section
                </span>
              </label>
              <p className="text-[10px] text-slate-500 mt-1 pl-6">
                Class teacher is primarily responsible for daily morning student attendance logging.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={createMutation.isPending} className="bg-amber-600 hover:bg-amber-700">
                Confirm Allocation
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
