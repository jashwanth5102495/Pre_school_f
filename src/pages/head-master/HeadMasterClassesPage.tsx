import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schoolPortalService } from '../../services/school-portal.service';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { Layers, Plus, BookOpen, Users, Hash } from 'lucide-react';

export const HeadMasterClassesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState('');

  const [classForm, setClassForm] = useState({ name: '', code: '' });
  const [sectionForm, setSectionForm] = useState({ name: '', capacity: 40 });

  const { data: classes, isLoading } = useQuery({
    queryKey: ['head-master-classes'],
    queryFn: () => schoolPortalService.getClassesAndSections(),
  });

  const createClassMutation = useMutation({
    mutationFn: (data: any) => schoolPortalService.createClass(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['head-master-classes'] });
      setIsClassModalOpen(false);
      setClassForm({ name: '', code: '' });
    },
  });

  const createSectionMutation = useMutation({
    mutationFn: (data: any) => schoolPortalService.createSection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['head-master-classes'] });
      setIsSectionModalOpen(false);
      setSectionForm({ name: '', capacity: 40 });
    },
  });

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    createClassMutation.mutate(classForm);
  };

  const handleCreateSection = (e: React.FormEvent) => {
    e.preventDefault();
    createSectionMutation.mutate({
      classId: selectedClassId,
      name: sectionForm.name,
      capacity: Number(sectionForm.capacity),
    });
  };

  const openAddSection = (classId: string) => {
    setSelectedClassId(classId);
    setIsSectionModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-600" /> Academic Classes &amp; Section Architecture
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Create classes, define section capacities, and configure academic curriculum branches
          </p>
        </div>
        <Button onClick={() => setIsClassModalOpen(true)} className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700">
          <Plus className="w-4 h-4" /> Create New Class
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {classes?.map((cls: any) => (
            <Card key={cls.id} className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
                      <Hash className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{cls.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Code: {cls.code}</div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openAddSection(cls.id)}
                    className="h-7 text-xs px-2 text-amber-700 border-amber-200 hover:bg-amber-50"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Section
                  </Button>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" /> Sections ({cls.sections?.length || 0})
                  </div>
                  <div className="space-y-1.5">
                    {cls.sections?.map((sec: any) => (
                      <div
                        key={sec.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200/60 text-xs"
                      >
                        <span className="font-semibold text-slate-800">{sec.name}</span>
                        <span className="text-[11px] text-slate-500">
                          {sec._count?.students || 0} / {sec.capacity} Capacity
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5 mb-2">
                    <BookOpen className="w-3.5 h-3.5 text-amber-500" /> Linked Subjects:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {cls.classSubjects && cls.classSubjects.length > 0 ? (
                      cls.classSubjects.map((cs: any) => (
                        <span
                          key={cs.id}
                          className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium"
                        >
                          {cs.subject?.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-400">Core Subjects</span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Class Modal */}
      {isClassModalOpen && (
        <Modal isOpen={isClassModalOpen} onClose={() => setIsClassModalOpen(false)} title="Create New Academic Class">
          <form onSubmit={handleCreateClass} className="space-y-4 text-xs">
            <Input
              label="Class Name"
              required
              value={classForm.name}
              onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
              placeholder="e.g. Class 11 (Senior Secondary)"
            />
            <Input
              label="Class Code"
              required
              value={classForm.code}
              onChange={(e) => setClassForm({ ...classForm, code: e.target.value.toUpperCase() })}
              placeholder="e.g. GRADE-11"
            />
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsClassModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={createClassMutation.isPending} className="bg-amber-600 hover:bg-amber-700">
                Create Class
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Create Section Modal */}
      {isSectionModalOpen && (
        <Modal isOpen={isSectionModalOpen} onClose={() => setIsSectionModalOpen(false)} title="Add Section to Class">
          <form onSubmit={handleCreateSection} className="space-y-4 text-xs">
            <Input
              label="Section Name"
              required
              value={sectionForm.name}
              onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })}
              placeholder="e.g. Section C"
            />
            <Input
              label="Capacity (Max Students)"
              type="number"
              required
              value={sectionForm.capacity}
              onChange={(e) => setSectionForm({ ...sectionForm, capacity: Number(e.target.value) })}
            />
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsSectionModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={createSectionMutation.isPending} className="bg-amber-600 hover:bg-amber-700">
                Add Section
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
