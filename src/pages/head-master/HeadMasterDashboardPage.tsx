import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { schoolPortalService } from '../../services/school-portal.service';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  GraduationCap,
  CalendarDays,
  FileCheck2,
  CalendarCheck,
  Layers,
  Clock,
  Calendar,
  AlertCircle,
} from 'lucide-react';

export const HeadMasterDashboardPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['head-master-dashboard'],
    queryFn: () => schoolPortalService.getHeadMasterDashboard(),
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

  const { summary, todaySessions, upcomingExams, upcomingEvents } = data;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#eb4438] to-[#99221b] rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold">Academic Supervision &amp; Moderation</h2>
          <p className="text-xs text-rose-100 mt-1">
            Supervising {summary.classesCount} Classes &middot; {summary.sectionsCount} Sections &middot; {summary.teachersCount} Teaching Faculty Members
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Pending Teacher Leaves</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">{summary.pendingLeavesCount}</div>
            <div className="text-[11px] text-amber-700 font-medium mt-0.5">Awaiting HM Approval</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Marks Moderation</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">{summary.pendingMarksCount}</div>
            <div className="text-[11px] text-purple-700 font-medium mt-0.5">Submitted by Faculty</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Student Attendance</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">{summary.overallAttendancePct}%</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{summary.sessionsMarkedToday} class sessions logged</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Teaching Faculty</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">{summary.teachersCount}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Active Instructors</div>
          </div>
        </Card>
      </div>

      {/* Today's Classroom Attendance Logs */}
      <Card className="p-6">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <CalendarCheck className="w-4 h-4 text-emerald-600" /> Today's Attendance Sessions
        </h3>
        {todaySessions && todaySessions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {todaySessions.map((s: any) => (
              <div key={s.sessionId} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{s.className} ({s.sectionName})</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700">
                    Logged
                  </span>
                </div>
                <div className="mt-2 text-xs text-slate-600">
                  Present: <strong className="text-emerald-700">{s.present}</strong> / {s.total} students
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-400 p-4 bg-slate-50 rounded-xl text-center">
            Attendance sessions are marked by class teachers during morning periods.
          </div>
        )}
      </Card>

      {/* Examinations & Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-amber-600" /> Scheduled Examinations
          </h3>
          {upcomingExams && upcomingExams.length > 0 ? (
            <div className="space-y-3">
              {upcomingExams.map((ex: any) => (
                <div key={ex.id} className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{ex.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {new Date(ex.startDate).toLocaleDateString()} to {new Date(ex.endDate).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge variant="neutral" className="text-[10px] font-semibold">
                    {ex.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
              No upcoming examinations scheduled.
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#eb4438]" /> Academic Events &amp; Notices
          </h3>
          {upcomingEvents && upcomingEvents.length > 0 ? (
            <div className="space-y-3">
              {upcomingEvents.map((ev: any) => (
                <div key={ev.id} className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{ev.title}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{ev.description}</div>
                  <div className="text-[10px] text-[#eb4438] font-medium mt-1">
                    {new Date(ev.startDate).toLocaleDateString()} &middot; Audience: {ev.targetAudience}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
              No academic events or notices published.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
