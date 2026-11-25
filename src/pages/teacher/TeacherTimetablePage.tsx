import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { schoolPortalService } from '../../services/school-portal.service';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { Clock } from 'lucide-react';

export const TeacherTimetablePage: React.FC = () => {
  const { data: periods, isLoading } = useQuery({
    queryKey: ['teacher-timetable'],
    queryFn: () => schoolPortalService.getTeacherTimetable(),
  });

  const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  const periodNumbers = [1, 2, 3, 4, 5, 6];

  const getPeriodCell = (day: string, pNum: number) => {
    return periods?.find((p: any) => p.dayOfWeek === day && p.periodNumber === pNum);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-600" /> My Teaching Timetable &amp; Schedule
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Weekly classroom periods, subject allocations, timing, and lab rooms assigned by Head Master
        </p>
      </div>

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
                <th className="p-3 font-semibold text-left w-24">Day</th>
                {periodNumbers.map((pNum) => (
                  <th key={pNum} className="p-3 font-semibold border-l border-slate-200 min-w-[130px]">
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
                          <div className="p-2.5 rounded-lg text-left bg-indigo-50/80 border border-indigo-200 text-indigo-950">
                            <div className="font-bold text-xs truncate">{period.subject?.name}</div>
                            <div className="text-[11px] text-slate-600 truncate mt-0.5">
                              {period.class?.name} ({period.section?.name})
                            </div>
                            <div className="text-[10px] text-indigo-700 font-mono mt-1 font-semibold">
                              {period.startTime} - {period.endTime}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{period.classroom || 'Room 101'}</div>
                          </div>
                        ) : (
                          <div className="h-full border border-dashed border-slate-200 rounded-lg flex items-center justify-center text-[10px] text-slate-300">
                            Free Period
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
    </div>
  );
};
