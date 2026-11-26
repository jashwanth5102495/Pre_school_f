import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  BookOpen,
  Sparkles,
} from 'lucide-react';

export const TakeAttendancePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlClassId = searchParams.get('classId');
  const urlSectionId = searchParams.get('sectionId');

  const [selectedClassId, setSelectedClassId] = useState(urlClassId || '');
  const [selectedSectionId, setSelectedSectionId] = useState(urlSectionId || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [rosterState, setRosterState] = useState<any[]>([]);
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);

  // Get teacher's assigned classes
  const { data: assigned } = useQuery({
    queryKey: ['teacher-assigned'],
    queryFn: () => schoolPortalService.getTeacherAssigned(),
  });

  // Group unique class/sections
  const uniqueClassSections: any[] = [];
  assigned?.forEach((a: any) => {
    if (!uniqueClassSections.some((u) => u.classId === a.classId && u.sectionId === a.sectionId)) {
      uniqueClassSections.push(a);
    }
  });

  // Set default class & section from url or assigned
  useEffect(() => {
    if (urlClassId) {
      setSelectedClassId(urlClassId);
      if (urlSectionId) setSelectedSectionId(urlSectionId);
    } else if (uniqueClassSections.length > 0 && !selectedClassId) {
      setSelectedClassId(uniqueClassSections[0].classId);
      setSelectedSectionId(uniqueClassSections[0].sectionId || '');
    }
  }, [assigned, urlClassId, urlSectionId]);

  // Fetch session & roster
  const { data: sessionData, isLoading: isRosterLoading } = useQuery({
    queryKey: ['teacher-attendance-session', selectedClassId, selectedSectionId, date],
    queryFn: () => schoolPortalService.getAttendanceSession(selectedClassId, selectedSectionId, date),
    enabled: !!selectedClassId,
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
    } else {
      setRosterState([]);
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
    if (!selectedClassId) return;
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

  const currentSelection = uniqueClassSections.find(
    (u) => u.classId === selectedClassId && (u.sectionId === selectedSectionId || !selectedSectionId)
  ) || uniqueClassSections[0];

  const presentCount = rosterState.filter((s) => s.status === 'PRESENT' || s.status === 'LATE').length;
  const absentCount = rosterState.filter((s) => s.status === 'ABSENT').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-[#eb4438]" /> Daily Classroom Attendance Register
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Log student morning roll call, track absentees, and synchronize live school attendance metrics
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-white dark:bg-[#252525] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#383838] shadow-xs text-xs">
          <Calendar className="w-4 h-4 text-[#eb4438]" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">Date:</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="text-xs font-semibold text-slate-800 dark:text-white focus:outline-none bg-transparent"
          />
        </div>
      </div>

      {isSavedSuccess && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Attendance register saved and synced to database successfully!</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INTERACTIVE ALLOTTED CLASS SELECTION TABS                                 */}
      {/* ========================================================================= */}
      <div className="space-y-2">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Select Teaching Batch:
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {uniqueClassSections.map((item: any) => {
            const isSelected = item.classId === selectedClassId;
            return (
              <button
                key={`${item.classId}_${item.sectionId}`}
                type="button"
                onClick={() => {
                  setSelectedClassId(item.classId);
                  setSelectedSectionId(item.sectionId || '');
                  setSearchParams({ classId: item.classId, sectionId: item.sectionId || '' });
                }}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-[#eb4438] text-white border-[#eb4438] shadow-md shadow-[#eb4438]/25 scale-102'
                    : 'bg-white dark:bg-[#252525] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#383838] hover:border-[#eb4438]/50'
                }`}
              >
                <BookOpen className="w-4 h-4 shrink-0" />
                <span className="font-bold">{item.class?.name || 'Class'}</span>
                <span className="text-[11px] opacity-90">({item.section?.name || 'Section A'})</span>
                {item.subject?.name && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                    isSelected ? 'bg-black/25 text-white' : 'bg-slate-100 dark:bg-[#333333] text-slate-600 dark:text-slate-300'
                  }`}>
                    {item.subject.name}
                  </span>
                )}
                {item.isClassTeacher && (
                  <span className="text-[10px] font-bold text-amber-300">★</span>
                )}
              </button>
            );
          })}

          {uniqueClassSections.length === 0 && (
            <div className="text-xs text-slate-400 py-2">
              No classes allotted yet. Contact your School Principal or Office Admin.
            </div>
          )}
        </div>
      </div>

      {/* Attendance Metrics Bar */}
      <Card className="p-4 flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#252525] border-slate-200 dark:border-[#383838]">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
            {currentSelection?.class?.name || 'Class'} &middot; {currentSelection?.section?.name || 'Section A'}
          </span>
          <span className="text-[11px] text-slate-500">
            ({rosterState.length} Students Total)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-600 dark:text-slate-400">
            Present: <strong className="text-emerald-500 font-bold">{presentCount}</strong> &middot; Absent:{' '}
            <strong className="text-rose-500 font-bold">{absentCount}</strong>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={markAllPresent}
            disabled={rosterState.length === 0}
            className="text-xs h-8 border-slate-200 dark:border-[#383838]"
          >
            <Check className="w-3.5 h-3.5 mr-1" /> Mark All Present
          </Button>
        </div>
      </Card>

      {/* Student Roster Table */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="overflow-hidden bg-white dark:bg-[#252525] border-slate-200 dark:border-[#383838]">
          {isRosterLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          ) : rosterState.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-[#1f1f1f] border-b border-slate-200 dark:border-[#333333] text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Student Code</th>
                    <th className="py-3 px-4 font-semibold">Student Full Name</th>
                    <th className="py-3 px-4 font-semibold">Attendance Status</th>
                    <th className="py-3 px-4 font-semibold">Remarks (Optional)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#333333]">
                  {rosterState.map((stu) => (
                    <tr key={stu.studentId} className="hover:bg-slate-50/50 dark:hover:bg-[#2c2c2c]/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                        {stu.studentCode}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                        {stu.firstName} {stu.lastName}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          {['PRESENT', 'ABSENT', 'LATE'].map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => handleStatusChange(stu.studentId, st)}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                                stu.status === st
                                  ? st === 'PRESENT'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : st === 'ABSENT'
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'bg-amber-600 text-white shadow-xs'
                                  : 'bg-slate-100 dark:bg-[#333333] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#3a3a3a]'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <input
                          type="text"
                          value={stu.remarks}
                          onChange={(e) => handleRemarksChange(stu.studentId, e.target.value)}
                          placeholder="Optional remark (e.g. excused, sick)"
                          className="w-full max-w-sm p-1.5 rounded-lg border border-slate-200 dark:border-[#383838] bg-transparent text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-[#eb4438]"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 dark:text-slate-500 text-xs">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                No students enrolled in this class yet.
              </p>
              <p className="text-[11px] mt-1 text-slate-500">
                Once the Office Admin creates and assigns student profiles to this class, they will appear here automatically for morning attendance roll call.
              </p>
            </div>
          )}
        </Card>

        {rosterState.length > 0 && (
          <div className="flex justify-end">
            <Button
              type="submit"
              isLoading={markMutation.isPending}
              className="bg-[#eb4438] hover:bg-[#d9382d] text-white flex items-center gap-2 shadow-md text-xs font-semibold h-10 px-5"
            >
              <Save className="w-4 h-4" /> Save &amp; Submit Attendance Register
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};

export default TakeAttendancePage;
