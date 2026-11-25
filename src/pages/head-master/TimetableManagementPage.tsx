import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schoolPortalService } from '../../services/school-portal.service';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { Clock, Plus, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';

export const TimetableManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [conflictError, setConflictError] = useState<string | null>(null);

  const [periodForm, setPeriodForm] = useState({
    dayOfWeek: 'MONDAY',
    periodNumber: 1,
    startTime: '08:30',
    endTime: '09:15',
    subjectId: '',
    teacherId: '',
    classroom: 'Room 101',
    isBreak: false,
  });

  const { data: classes } = useQuery({
    queryKey: ['head-master-classes'],
    queryFn: () => schoolPortalService.getClassesAndSections(),
  });

  // Set default selected class & section when classes load
  React.useEffect(() => {
    if (classes && classes.length > 0 && !selectedClassId) {
      setSelectedClassId(classes[0].id);
      if (classes[0].sections && classes[0].sections.length > 0) {
        setSelectedSectionId(classes[0].sections[0].id);
      }
    }
  }, [classes, selectedClassId]);

  const { data: allocationsData } = useQuery({
    queryKey: ['head-master-allocations'],
    queryFn: () => schoolPortalService.getAllocations(),
  });

  const { data: periods, isLoading } = useQuery({
    queryKey: ['timetable-periods', selectedClassId, selectedSectionId],
    queryFn: () =>
      schoolPortalService.getTimetable({
        classId: selectedClassId,
        sectionId: selectedSectionId,
      }),
    enabled: !!selectedClassId && !!selectedSectionId,
  });

  const createPeriodMutation = useMutation({
    mutationFn: (data: any) =>
      schoolPortalService.createTimetablePeriod({
        ...data,
        classId: selectedClassId,
        sectionId: selectedSectionId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable-periods'] });
      setIsModalOpen(false);
      setConflictError(null);
    },
    onError: (err: any) => {
      setConflictError(err.response?.data?.error?.message || err.message || 'Timetable clash detected');
    },
  });

  const deletePeriodMutation = useMutation({
    mutationFn: (id: string) => schoolPortalService.deleteTimetablePeriod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable-periods'] });
    },
  });

  const handlePeriodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError(null);
    createPeriodMutation.mutate(periodForm);
  };

  const currentClass = classes?.find((c: any) => c.id === selectedClassId);
  const teachers = allocationsData?.teachers || [];
  const subjects = allocationsData?.subjects || [];

  const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  const periodNumbers = [1, 2, 3, 4, 5, 6];

  const getPeriodCell = (day: string, pNum: number) => {
    return periods?.find((p: any) => p.dayOfWeek === day && p.periodNumber === pNum);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" /> Timetable Scheduler &amp; Conflict Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Weekly period grid with automated collision detection (prevents double-booking teachers, sections, or classrooms)
          </p>
        </div>
        <Button
          onClick={() => {
            setConflictError(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700"
        >
          <Plus className="w-4 h-4" /> Schedule Period
        </Button>
      </div>

      {/* Class & Section Selector Bar */}
      <Card className="p-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700">Class:</span>
          <select
            value={selectedClassId}
            onChange={(e) => {
              setSelectedClassId(e.target.value);
              const found = classes?.find((c: any) => c.id === e.target.value);
              if (found?.sections?.[0]) setSelectedSectionId(found.sections[0].id);
            }}
            className="p-1.5 rounded-lg border border-slate-200 text-xs font-medium"
          >
            {classes?.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700">Section:</span>
          <select
            value={selectedSectionId}
            onChange={(e) => setSelectedSectionId(e.target.value)}
            className="p-1.5 rounded-lg border border-slate-200 text-xs font-medium"
          >
            {currentClass?.sections?.map((s: any) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Timetable Weekly Matrix */}
      <Card className="p-6 overflow-x-auto">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : (
          <table className="w-full text-center border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                <th className="p-3 font-semibold text-left w-24">Day / Period</th>
                {periodNumbers.map((pNum) => (
                  <th key={pNum} className="p-3 font-semibold border-l border-slate-200 min-w-[140px]">
                    Period {pNum}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {daysOfWeek.map((day) => (
                <tr key={day} className="hover:bg-slate-50/30">
                  <td className="p-3 font-bold text-left text-slate-900 bg-slate-50/50">
                    {day}
                  </td>
                  {periodNumbers.map((pNum) => {
                    const period = getPeriodCell(day, pNum);
                    return (
                      <td key={pNum} className="p-2 border-l border-slate-200 align-top h-24">
                        {period ? (
                          <div className={`p-2 rounded-lg text-left relative group border ${
                            period.isBreak
                              ? 'bg-amber-50/80 border-amber-200 text-amber-800'
                              : 'bg-blue-50/80 border-blue-200 text-blue-900'
                          }`}>
                            <div className="font-bold text-xs truncate">
                              {period.isBreak ? '☕ Recess Break' : period.subject?.name || 'Class Period'}
                            </div>
                            {!period.isBreak && (
                              <>
                                <div className="text-[11px] text-slate-600 truncate mt-0.5">
                                  {period.teacher ? `${period.teacher.firstName} ${period.teacher.lastName}` : 'Unassigned'}
                                </div>
                                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                  {period.startTime} - {period.endTime} &middot; {period.classroom || 'Classroom'}
                                </div>
                              </>
                            )}
                            <button
                              onClick={() => deletePeriodMutation.mutate(period.id)}
                              title="Delete period"
                              className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 p-1 text-rose-500 hover:bg-rose-100 rounded transition-all"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="h-full border border-dashed border-slate-200 rounded-lg flex items-center justify-center text-[10px] text-slate-300">
                            Free
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Schedule Period Modal with Conflict Detection */}
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule Period (Conflict Validated)">
          {conflictError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{conflictError}</span>
            </div>
          )}

          <form onSubmit={handlePeriodSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Day of Week</label>
                <select
                  value={periodForm.dayOfWeek}
                  onChange={(e) => setPeriodForm({ ...periodForm, dayOfWeek: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs"
                >
                  {daysOfWeek.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Period Number</label>
                <select
                  value={periodForm.periodNumber}
                  onChange={(e) => setPeriodForm({ ...periodForm, periodNumber: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs"
                >
                  {periodNumbers.map((n) => (
                    <option key={n} value={n}>Period {n}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Start Time"
                value={periodForm.startTime}
                onChange={(e) => setPeriodForm({ ...periodForm, startTime: e.target.value })}
                placeholder="08:30"
              />
              <Input
                label="End Time"
                value={periodForm.endTime}
                onChange={(e) => setPeriodForm({ ...periodForm, endTime: e.target.value })}
                placeholder="09:15"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer mb-2">
                <input
                  type="checkbox"
                  checked={periodForm.isBreak}
                  onChange={(e) => setPeriodForm({ ...periodForm, isBreak: e.target.checked })}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="font-semibold text-slate-800">Recess / Break Period (No subject or teacher)</span>
              </label>

              {!periodForm.isBreak && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Subject</label>
                    <select
                      required={!periodForm.isBreak}
                      value={periodForm.subjectId}
                      onChange={(e) => setPeriodForm({ ...periodForm, subjectId: e.target.value })}
                      className="w-full p-2 rounded-lg border border-slate-200 text-xs"
                    >
                      <option value="">Select Subject</option>
                      {subjects.map((sub: any) => (
                        <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Assigned Teacher</label>
                    <select
                      value={periodForm.teacherId}
                      onChange={(e) => setPeriodForm({ ...periodForm, teacherId: e.target.value })}
                      className="w-full p-2 rounded-lg border border-slate-200 text-xs"
                    >
                      <option value="">Select Teacher (Optional)</option>
                      {teachers.map((t: any) => (
                        <option key={t.id} value={t.id}>{t.firstName} {t.lastName} ({t.designation || 'Teacher'})</option>
                      ))}
                    </select>
                  </div>

                  <Input
                    label="Classroom / Lab Location"
                    value={periodForm.classroom}
                    onChange={(e) => setPeriodForm({ ...periodForm, classroom: e.target.value })}
                    placeholder="e.g. Room 204 or Physics Lab"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={createPeriodMutation.isPending} className="bg-amber-600 hover:bg-amber-700">
                Confirm &amp; Validate Period
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
