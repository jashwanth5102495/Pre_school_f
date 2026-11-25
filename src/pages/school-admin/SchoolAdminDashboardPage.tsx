import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { schoolPortalService } from '../../services/school-portal.service';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  Users,
  GraduationCap,
  Layers,
  CalendarCheck,
  CreditCard,
  AlertCircle,
  TrendingUp,
  Clock,
  Calendar,
} from 'lucide-react';

export const SchoolAdminDashboardPage: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['school-admin-dashboard'],
    queryFn: () => schoolPortalService.getSchoolAdminDashboard(),
    refetchInterval: 15000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 flex items-center gap-3">
        <AlertCircle className="w-5 h-5" />
        <span>Failed to load school dashboard metrics from database.</span>
      </div>
    );
  }

  const { summary, classDistribution, recentAdmissions, recentTransactions, upcomingEvents } = data;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#eb4438] to-[#99221b] rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold">School Operations Overview</h2>
          <p className="text-xs text-rose-100 mt-1">
            Academic Year: <span className="font-semibold text-white">{summary.activeAcademicYear}</span>
          </p>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#eb4438]/10 text-[#eb4438] flex items-center justify-center shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Total Students</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">{summary.totalStudents}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Enrolled Students</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#eb4438]/10 text-[#eb4438] flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Teaching Faculty</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">{summary.totalTeachers}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {summary.teachersPresentToday} present today
            </div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Today's Attendance</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              {summary.studentAttendancePercentage}%
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {summary.studentsPresentToday} present / {summary.studentsAbsentToday} absent
            </div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Fee Collection</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              ₹{summary.totalFeeCollection.toLocaleString()}
            </div>
            <div className="text-[11px] text-rose-600 font-medium mt-0.5">
              Pending: ₹{summary.pendingFeeAmount.toLocaleString()}
            </div>
          </div>
        </Card>
      </div>

      {/* Class-wise Distribution */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#eb4438]" /> Class-wise Student Distribution
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Breakdown of student strength across sections</p>
          </div>
          <div className="text-xs font-medium text-slate-500">
            Total Classes: {summary.totalClasses} &middot; Sections: {summary.totalSections}
          </div>
        </div>

        {classDistribution && classDistribution.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {classDistribution.map((c: any) => (
              <div key={c.classId} className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800">{c.className}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#eb4438]/10 text-[#eb4438]">
                    {c.totalStudents} Students
                  </span>
                </div>
                <div className="space-y-1">
                  {c.sections?.map((sec: any) => (
                    <div key={sec.sectionId} className="flex justify-between text-[11px] text-slate-600">
                      <span>{sec.sectionName}</span>
                      <span className="font-medium text-slate-700">{sec.studentsCount} students</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
            No classes or sections configured yet.
          </div>
        )}
      </Card>

      {/* Two-Column Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Admissions */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-emerald-600" /> Recent Admissions
            </h3>
            <Badge variant="neutral" className="text-[10px]">
              {recentAdmissions?.length || 0} applications
            </Badge>
          </div>

          {recentAdmissions && recentAdmissions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-[#333333] text-slate-400">
                    <th className="pb-2 font-medium">Application #</th>
                    <th className="pb-2 font-medium">Student Name</th>
                    <th className="pb-2 font-medium">Class</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#333333]">
                  {recentAdmissions.map((adm: any) => (
                    <tr key={adm.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 font-mono text-[11px] text-slate-600">{adm.applicationNumber}</td>
                      <td className="py-2.5 font-medium text-slate-900">{adm.firstName} {adm.lastName}</td>
                      <td className="py-2.5 text-slate-600">{adm.applyingClass?.name || 'Class 10'}</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          adm.status === 'ADMITTED'
                            ? 'bg-emerald-100 text-emerald-700'
                            : adm.status === 'APPROVED'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {adm.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
              No recent admission applications found.
            </div>
          )}
        </Card>

        {/* Recent Fee Transactions */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#eb4438]" /> Recent Fee Receipts
            </h3>
            <Badge variant="neutral" className="text-[10px]">Latest Receipts</Badge>
          </div>

          {recentTransactions && recentTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-[#333333] text-slate-400">
                    <th className="pb-2 font-medium">Receipt #</th>
                    <th className="pb-2 font-medium">Student</th>
                    <th className="pb-2 font-medium">Category</th>
                    <th className="pb-2 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#333333]">
                  {recentTransactions.map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 font-mono text-[11px] text-slate-600">{tx.receiptNumber}</td>
                      <td className="py-2.5 font-medium text-slate-900">
                        {tx.studentFee?.student?.firstName} {tx.studentFee?.student?.lastName}
                      </td>
                      <td className="py-2.5 text-slate-600">
                        {tx.studentFee?.feeStructure?.category?.name || 'Tuition Fee'}
                      </td>
                      <td className="py-2.5 text-right font-semibold text-emerald-600">
                        ₹{tx.amountPaid.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
              No recent fee receipts recorded.
            </div>
          )}
        </Card>
      </div>

      {/* Upcoming Events */}
      {upcomingEvents && upcomingEvents.length > 0 && (
        <Card className="p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-600" /> Upcoming School Events &amp; Calendar
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {upcomingEvents.map((ev: any) => (
              <div key={ev.id} className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">{ev.title}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{ev.description}</div>
                  <div className="text-[10px] text-purple-700 font-medium mt-1">
                    {new Date(ev.startDate).toLocaleDateString()} &middot; Audience: {ev.targetAudience}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
