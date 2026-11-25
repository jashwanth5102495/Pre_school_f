import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schoolPortalService } from '../../services/school-portal.service';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  CalendarCheck,
  CheckCircle2,
  Calendar,
  Save,
  Users,
  Check,
  X,
  Clock,
  Sparkles,
} from 'lucide-react';

export const TakeAttendancePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [rosterState, setRosterState] = useState<any[]>([]);
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);

  // Get teacher's assigned classes
  const { data: assigned } = useQuery({
    queryKey: ['teacher-assigned'],
    queryFn: () => schoolPortalService.getTeacherAssigned(),
  });

  // Set default class & section from assigned
  useEffect(() => {
    if (assigned && assigned.length > 0 && !selectedClassId) {
      setSelectedClassId(assigned[0].classId);
      setSelectedSectionId(assigned[0].sectionId);
    }
  }, [assigned, selectedClassId]);

  // Fetch session & roster
  const { data: sessionData, isLoading: isRosterLoading } = useQuery({
    queryKey: ['teacher-attendance-session', selectedClassId, selectedSectionId, date],
    queryFn: () => schoolPortalService.getAttendanceSession(selectedClassId, selectedSectionId, date),
    enabled: !!selectedClassId && !!selectedSectionId,
  });

  // Sync rosterState from sessionData
  useEffect(() => {
    if (sessionData?.roster) {
      setRosterState(
        sessionData.roster.map((s: any) => ({
          studentId: s.studentId,
          studentCode: s.studentCode,
          firstName: s.firstName,
          lastName: s.lastName,
          status: s.status || 'PRESENT',
          remarks: s.remarks || '',
        }))
      );
    }
  }, [sessionData]);

  const markMutation = useMutation({
    mutationFn: (data: any) => schoolPortalService.markAttendance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-attendance-session'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-dashboard'] });
      setIsSavedSuccess(true);
      setTimeout(() => setIsSavedSuccess(false), 4000);
    },
  });

  const handleStatusChange = (studentId: string, status: string) => {
    setRosterState((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, status } : s))
    );
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setRosterState((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, remarks } : s))
    );
  };

  const markAllPresent = () => {
    setRosterState((prev) => prev.map((s) => ({ ...s, status: 'PRESENT' })));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    markMutation.mutate({
      classId: selectedClassId,
      sectionId: selectedSectionId,
      date,
      records: rosterState.map((s) => ({
        studentId: s.studentId,
        status: s.status,
        remarks: s.remarks || undefined,
      })),
    });
  };

  // Group unique class/sections
  const uniqueClassSections: any[] = [];
  assigned?.forEach((a: any) => {
    if (!uniqueClassSections.some((u) => u.classId === a.classId && u.sectionId === a.sectionId)) {
      uniqueClassSections.push(a);
    }
  });

  const presentCount = rosterState.filter((s) => s.status === 'PRESENT' || s.status === 'LATE').length;
  const absentCount = rosterState.filter((s) => s.status === 'ABSENT').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-indigo-600" /> Daily Classroom Attendance Register
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Log student morning roll call, track absentees, and synchronize live school attendance metrics
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm text-xs">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="font-medium text-slate-700">Date:</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="text-xs font-semibold text-slate-800 focus:outline-none bg-transparent"
          />
        </div>
      </div>

      {isSavedSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Attendance register saved and synced to database successfully!</span>
        </div>
      )}

      {/* Class Selector Bar */}
      <Card className="p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-700">Select Section:</span>
          <select
            value={`${selectedClassId}_${selectedSectionId}`}
            onChange={(e) => {
              const [cId, sId] = e.target.value.split('_');
              setSelectedClassId(cId);
              setSelectedSectionId(sId);
            }}
            className="p-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
          >
            {uniqueClassSections.map((item: any) => (
              <option key={`${item.classId}_${item.sectionId}`} value={`${item.classId}_${item.sectionId}`}>
                {item.class?.name} ({item.section?.name}) {item.isClassTeacher ? '★ (Class Teacher)' : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-600">
            Present: <strong className="text-emerald-600">{presentCount}</strong> &middot; Absent:{' '}
            <strong className="text-rose-600">{absentCount}</strong> of {rosterState.length}
          </div>
          <Button size="sm" variant="outline" onClick={markAllPresent} className="text-xs h-8">
            <Check className="w-3.5 h-3.5 mr-1" /> Mark All Present
          </Button>
        </div>
      </Card>

      {/* Roster Table */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="overflow-hidden">
          {isRosterLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          ) : rosterState.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Student Code</th>
                    <th className="py-3 px-4 font-semibold">Student Name</th>
                    <th className="py-3 px-4 font-semibold">Attendance Status</th>
                    <th className="py-3 px-4 font-semibold">Remarks (Optional)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rosterState.map((stu) => (
                    <tr key={stu.studentId} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono font-medium text-indigo-700">
                        {stu.studentCode}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {stu.firstName} {stu.lastName}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY'].map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => handleStatusChange(stu.studentId, st)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                stu.status === st
                                  ? st === 'PRESENT'
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : st === 'ABSENT'
                                    ? 'bg-rose-600 text-white shadow-sm'
                                    : 'bg-amber-600 text-white shadow-sm'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={stu.remarks}
                          onChange={(e) => handleRemarksChange(stu.studentId, e.target.value)}
                          placeholder="e.g. Doctor appointment, excused..."
                          className="w-full p-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              No students enrolled in this section.
            </div>
          )}
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            isLoading={markMutation.isPending}
            className="bg-[#eb4438] hover:bg-[#d9382d] text-white flex items-center gap-2 shadow-md"
          >
            <Save className="w-4 h-4" /> Save &amp; Submit Attendance Roster
          </Button>
        </div>
      </form>
    </div>
  );
};
