import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { schoolPortalService } from '../../services/school-portal.service';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { CalendarCheck, Calendar, CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';

export const AttendanceSupervisionPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const { data, isLoading } = useQuery({
    queryKey: ['head-master-attendance-supervision', selectedDate],
    queryFn: () => schoolPortalService.getAttendanceSupervision(selectedDate),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-amber-600" /> Attendance Supervision &amp; Missing Log Tracker
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time verification of daily classroom logs across all school sections to spot unsubmitted rosters
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm text-xs">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="font-medium text-slate-700">Date:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs font-semibold text-slate-800 focus:outline-none bg-transparent"
          />
        </div>
      </div>

      {isLoading || !data ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Total School Sections</div>
                <div className="text-2xl font-bold text-slate-900 mt-0.5">{data.totalSections}</div>
              </div>
            </Card>

            <Card className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Sections Logged</div>
                <div className="text-2xl font-bold text-emerald-600 mt-0.5">{data.markedSections}</div>
                <div className="text-[10px] text-emerald-700 mt-0.5">Attendance taken</div>
              </div>
            </Card>

            <Card className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Missing Sections</div>
                <div className="text-2xl font-bold text-amber-600 mt-0.5">{data.missingSections}</div>
                <div className="text-[10px] text-amber-700 mt-0.5">Awaiting teacher entry</div>
              </div>
            </Card>
          </div>

          {/* Section Matrix */}
          <Card className="overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-3 px-4 font-semibold">Class &amp; Section</th>
                  <th className="py-3 px-4 font-semibold">Marking Status</th>
                  <th className="py-3 px-4 font-semibold">Roster Strength</th>
                  <th className="py-3 px-4 font-semibold">Students Present</th>
                  <th className="py-3 px-4 font-semibold">Students Absent</th>
                  <th className="py-3 px-4 font-semibold text-right">Attendance %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.report?.map((r: any) => (
                  <tr key={`${r.classId}_${r.sectionId}`} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {r.className} &middot; {r.sectionName}
                    </td>
                    <td className="py-3 px-4">
                      {r.isMarked ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-max">
                          <CheckCircle2 className="w-3 h-3" /> Logged
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 flex items-center gap-1 w-max">
                          <AlertCircle className="w-3 h-3" /> Not Marked Yet
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{r.totalStudents} Students</td>
                    <td className="py-3 px-4 text-emerald-600 font-medium">{r.present}</td>
                    <td className="py-3 px-4 text-rose-600 font-medium">{r.absent}</td>
                    <td className="py-3 px-4 text-right font-bold">
                      {r.isMarked ? (
                        <span className={r.attendancePct >= 80 ? 'text-emerald-600' : 'text-amber-600'}>
                          {r.attendancePct}%
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal">--</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}
    </div>
  );
};
