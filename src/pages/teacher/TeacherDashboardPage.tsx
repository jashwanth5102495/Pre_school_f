import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { schoolPortalService } from '../../services/school-portal.service';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  BookOpen,
  CalendarCheck,
  Clock,
  BookMarked,
  CalendarDays,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Users,
} from 'lucide-react';

export const TeacherDashboardPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['teacher-dashboard'],
    queryFn: () => schoolPortalService.getTeacherDashboard(),
  });

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const { teacher, allocations, todaySchedule, leaveBalances, metrics, classTeacherAttendance } = data;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#eb4438] to-[#99221b] rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">Welcome, {teacher?.firstName} {teacher?.lastName}</h2>
            <span className="font-mono text-xs bg-white/20 px-2.5 py-0.5 rounded-full">{teacher?.teacherCode}</span>
          </div>
          <p className="text-xs text-rose-100 mt-1">
            {teacher?.designation || 'Faculty Member'} &middot; Specialization: {teacher?.specialization || 'Curriculum Specialist'}
          </p>
        </div>
        <Link to="/teacher/attendance">
          <Button className="bg-white text-[#eb4438] hover:bg-rose-50 font-semibold text-xs flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-[#eb4438]" /> Take Daily Attendance <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>

      {/* Class Teacher Alert Card */}
      {classTeacherAttendance && classTeacherAttendance.length > 0 && (
        <Card className="p-5 border-[#eb4438]/20 bg-[#eb4438]/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#eb4438] text-white flex items-center justify-center shrink-0">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Class Teacher Role: {classTeacherAttendance.map((c: any) => `${c.className} (${c.sectionName})`).join(', ')}
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  {classTeacherAttendance.some((c: any) => !c.isMarked)
                    ? 'Morning attendance is pending submission for your assigned class.'
                    : 'Today\'s attendance is logged and submitted.'}
                </div>
              </div>
            </div>

            <Link to="/teacher/attendance">
              <Button size="sm" className="bg-[#eb4438] hover:bg-[#d9382d] text-white text-xs">
                Open Attendance Roster
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* MY ALLOTTED CLASSES & BATCHES (TEACHER'S ASSIGNED CLASSES)               */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#eb4438]" /> My Allotted Classes &amp; Teaching Batches
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Click any class to view enrolled students, conduct daily roll call, and record evaluation grades
            </p>
          </div>
          <Link
            to="/teacher/attendance"
            className="text-xs text-[#eb4438] hover:underline font-semibold flex items-center gap-1"
          >
            Attendance Register &rarr;
          </Link>
        </div>

        {allocations && allocations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allocations.map((alloc: any) => {
              const studentCount = alloc.section?._count?.students ?? alloc.class?._count?.students ?? 0;
              return (
                <div
                  key={alloc.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#252525] border border-slate-200 dark:border-[#383838] shadow-xs hover:border-[#eb4438]/50 hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-[#eb4438]/10 text-[#eb4438] border border-[#eb4438]/20">
                        {alloc.subject?.name || 'General Subject'}
                      </span>
                      {alloc.isClassTeacher && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          Class Teacher
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-[#eb4438] transition-colors">
                      {alloc.class?.name || 'Class'}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {alloc.section?.name ? `${alloc.section.name}` : 'Section A'} &middot; Code: {alloc.class?.code || 'G-1'}
                    </p>

                    <div className="flex items-center gap-2 mt-4 text-xs font-medium text-slate-600 dark:text-slate-300">
                      <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center">
                        <Users className="w-3.5 h-3.5" />
                      </div>
                      <span>{studentCount} Enrolled Students</span>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-[#333333] flex items-center gap-2">
                    <Link
                      to={`/teacher/attendance?classId=${alloc.classId}&sectionId=${alloc.sectionId || ''}`}
                      className="flex-1"
                    >
                      <Button
                        size="sm"
                        className="w-full bg-[#eb4438] hover:bg-[#d9382d] text-white text-xs font-semibold flex items-center justify-center gap-1.5 h-8"
                      >
                        <CalendarCheck className="w-3.5 h-3.5" /> Take Attendance
                      </Button>
                    </Link>
                    <Link to="/teacher/marks">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs font-medium border-slate-200 dark:border-[#383838] h-8 px-2.5"
                        title="Enter internal examination marks"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-[#383838] bg-slate-50/50 dark:bg-[#1a1a1a]/50">
            <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">No Teaching Allocations Found</h4>
            <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
              Once the Office Admin or Principal allots classes to your profile, your teaching batches will appear here ready for attendance and grading.
            </p>
          </div>
        )}
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Assigned Classes</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">{metrics.totalAllocations}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Subject Sections</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Today's Periods</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">{metrics.todayPeriodsCount}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Classes Scheduled</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <BookMarked className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Active Homework</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">{metrics.activeHomeworkCount}</div>
            <div className="text-[11px] text-emerald-700 font-medium mt-0.5">Pending Submissions</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Marks Moderation</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">{metrics.pendingMarksReviewsCount}</div>
            <div className="text-[11px] text-purple-700 font-medium mt-0.5">In Review with HM</div>
          </div>
        </Card>
      </div>

      {/* Two Column Layout: Today's Schedule & Leave Balances */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" /> Today's Teaching Schedule
            </h3>
            <Link to="/teacher/timetable" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
              View Weekly &rarr;
            </Link>
          </div>

          {todaySchedule && todaySchedule.length > 0 ? (
            <div className="space-y-2.5">
              {todaySchedule.map((p: any) => (
                <div
                  key={p.id}
                  className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-xs text-slate-900">
                      Period {p.periodNumber}: {p.subject?.name}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {p.class?.name} ({p.section?.name}) &middot; {p.classroom || 'Room 101'}
                    </div>
                  </div>
                  <div className="font-mono text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
                    {p.startTime} - {p.endTime}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-400 p-6 bg-slate-50 rounded-xl text-center">
              No classes scheduled for today. Check your weekly timetable.
            </div>
          )}
        </Card>

        {/* Leave Balances */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-amber-600" /> Leave Balances &amp; Entitlements
            </h3>
            <Link to="/teacher/leaves" className="text-xs text-[#eb4438] hover:underline font-medium">
              Apply Leave &rarr;
            </Link>
          </div>

          {leaveBalances && leaveBalances.length > 0 ? (
            <div className="space-y-3">
              {leaveBalances.map((lb: any) => {
                const remaining = lb.allocatedDays - lb.usedDays;
                return (
                  <div key={lb.id} className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{lb.leaveType?.name}</span>
                      <span className="text-xs font-bold text-[#eb4438]">
                        {remaining} Days Available
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-[#333333] rounded-full h-1.5 mt-2">
                      <div
                        className="bg-[#eb4438] h-1.5 rounded-full"
                        style={{ width: `${Math.min(100, (remaining / lb.allocatedDays) * 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>Used: {lb.usedDays} days</span>
                      <span>Total Allocated: {lb.allocatedDays} days</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
              No active leave entitlements allocated.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
