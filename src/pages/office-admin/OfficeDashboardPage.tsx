import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { schoolPortalService } from '../../services/school-portal.service';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  Briefcase,
  UserPlus,
  CreditCard,
  AlertTriangle,
  Files,
  GraduationCap,
  TrendingUp,
} from 'lucide-react';

export const OfficeDashboardPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['office-dashboard'],
    queryFn: () => schoolPortalService.getOfficeDashboard(),
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

  const { summary, recentAdmissions, recentPayments } = data;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#eb4438] to-[#99221b] rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold">Office Administration &amp; Admissions Desk</h2>
          <p className="text-xs text-rose-100 mt-1">
            Student Admissions Pipeline &middot; Fee Collections &middot; Document Verification &middot; Official Receipts
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Pending Admissions</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">{summary.pendingAdmissions}</div>
            <div className="text-[11px] text-emerald-700 font-medium mt-0.5">
              {summary.approvedAdmissions} approved ready to enroll
            </div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Collected This Month</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              ₹{summary.monthFeeCollected.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {summary.monthTransactions} receipts generated
            </div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Outstanding Dues</div>
            <div className="text-2xl font-bold text-rose-600 mt-0.5">
              ₹{summary.outstandingFeeAmount.toLocaleString()}
            </div>
            <div className="text-[11px] text-rose-700 font-medium mt-0.5">
              {summary.defaultersCount} pending accounts
            </div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Files className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Pending Documents</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">{summary.pendingDocuments}</div>
            <div className="text-[11px] text-purple-700 font-medium mt-0.5">Awaiting Verification</div>
          </div>
        </Card>
      </div>

      {/* Two Column Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Admissions */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-emerald-600" /> New Admission Applications
            </h3>
            <Badge variant="neutral" className="text-[10px]">Recent</Badge>
          </div>

          {recentAdmissions && recentAdmissions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-[#333333] text-slate-400">
                    <th className="pb-2 font-medium">App #</th>
                    <th className="pb-2 font-medium">Candidate</th>
                    <th className="pb-2 font-medium">Class</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#333333]">
                  {recentAdmissions.map((a: any) => (
                    <tr key={a.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 font-mono text-[11px] text-slate-600 dark:text-slate-400">{a.applicationNumber}</td>
                      <td className="py-2.5 font-medium text-slate-900 dark:text-white">{a.firstName} {a.lastName}</td>
                      <td className="py-2.5 text-slate-600 dark:text-slate-400">{a.applyingClass?.name || 'Class 10'}</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          a.status === 'ADMITTED'
                            ? 'bg-emerald-100 text-emerald-700'
                            : a.status === 'APPROVED'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
              No admission applications received yet.
            </div>
          )}
        </Card>

        {/* Recent Fee Payments */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#eb4438]" /> Recent Fee Receipts Generated
            </h3>
            <Badge variant="neutral" className="text-[10px]">Counter Collections</Badge>
          </div>

          {recentPayments && recentPayments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-[#333333] text-slate-400">
                    <th className="pb-2 font-medium">Receipt #</th>
                    <th className="pb-2 font-medium">Student</th>
                    <th className="pb-2 font-medium">Method</th>
                    <th className="pb-2 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#333333]">
                  {recentPayments.map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 font-mono text-[11px] font-medium text-[#eb4438]">{p.receiptNumber}</td>
                      <td className="py-2.5 font-medium text-slate-900 dark:text-white">
                        {p.studentFee?.student?.firstName} {p.studentFee?.student?.lastName}
                      </td>
                      <td className="py-2.5">
                        <Badge variant="neutral" className="text-[10px]">{p.paymentMethod}</Badge>
                      </td>
                      <td className="py-2.5 text-right font-semibold text-emerald-600">
                        ₹{p.amountPaid.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
              No counter receipts generated yet.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
