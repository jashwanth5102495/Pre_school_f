import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { schoolPortalService } from '../../services/school-portal.service';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { CalendarCheck, Calendar, Users, CheckCircle2, XCircle } from 'lucide-react';

export const SchoolAttendanceOverviewPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const { data, isLoading } = useQuery({
    queryKey: ['school-attendance-overview', selectedDate],
    queryFn: () => schoolPortalService.getAttendanceOverview(selectedDate),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-blue-600" /> School-Wide Attendance Overview
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Section-by-section daily attendance logging, present/absent ratios and daily attendance percentage
          </p>
        </div>

        {/* Date Selector */}
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
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Showing sessions logged for: <strong className="text-slate-800">{new Date(data.date).toDateString()}</strong>
            </span>
            <span>Total Marked Sessions: {data.sessionsCount}</span>
          </div>

          {data.breakdown && data.breakdown.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.breakdown.map((item: any) => (
                <Card key={item.sessionId} className="p-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        {item.className} &middot; {item.sectionName}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {item.total} Students on roster
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      item.percentage >= 85
                        ? 'bg-emerald-100 text-emerald-700'
                        : item.percentage >= 70
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}>
                      {item.percentage}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 text-emerald-700">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <div>
                        <div className="font-bold text-sm leading-tight">{item.present}</div>
                        <div className="text-[10px]">Present Today</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2 rounded-lg bg-rose-50 text-rose-700">
                      <XCircle className="w-4 h-4 shrink-0" />
                      <div>
                        <div className="font-bold text-sm leading-tight">{item.absent}</div>
                        <div className="text-[10px]">Absent Today</div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center text-slate-500">
              <CalendarCheck className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <div className="text-sm font-medium">No attendance recorded on this date.</div>
              <div className="text-xs text-slate-400 mt-1">Teachers mark attendance daily via the Teacher Portal.</div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
