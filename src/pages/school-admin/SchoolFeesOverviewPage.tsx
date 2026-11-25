import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { schoolPortalService } from '../../services/school-portal.service';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { CreditCard, TrendingUp, AlertTriangle, CheckCircle2, Receipt } from 'lucide-react';

export const SchoolFeesOverviewPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['school-fees-overview'],
    queryFn: () => schoolPortalService.getFeesOverview(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-blue-600" /> School Fee Analytics &amp; Collections
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Fee collections, pending tuition dues, active fee structures, and recent receipts
        </p>
      </div>

      {isLoading || !data ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Total Fees Collected</div>
                <div className="text-2xl font-bold text-slate-900 mt-0.5">
                  ₹{data.totalCollected.toLocaleString()}
                </div>
                <div className="text-[11px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> {data.paymentCount} payments processed
                </div>
              </div>
            </Card>

            <Card className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Pending Dues &amp; Arrears</div>
                <div className="text-2xl font-bold text-rose-600 mt-0.5">
                  ₹{data.totalPending.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Awaiting parent remittance</div>
              </div>
            </Card>

            <Card className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Receipt className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Active Fee Structures</div>
                <div className="text-2xl font-bold text-slate-900 mt-0.5">
                  {data.structures?.length || 0}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Configured categories</div>
              </div>
            </Card>
          </div>

          {/* Active Structures Table */}
          <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Configured Fee Structures</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Category</th>
                    <th className="py-2.5 px-3 font-semibold">Class</th>
                    <th className="py-2.5 px-3 font-semibold">Frequency</th>
                    <th className="py-2.5 px-3 font-semibold">Due Date</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.structures?.map((s: any) => (
                    <tr key={s.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{s.category?.name}</td>
                      <td className="py-2.5 px-3 text-slate-600">{s.class?.name}</td>
                      <td className="py-2.5 px-3 text-slate-600">{s.frequency}</td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {new Date(s.dueDate).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        ₹{s.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Recent Payments History */}
          <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Recent Payment Transactions</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Receipt #</th>
                    <th className="py-2.5 px-3 font-semibold">Student Name</th>
                    <th className="py-2.5 px-3 font-semibold">Category</th>
                    <th className="py-2.5 px-3 font-semibold">Method</th>
                    <th className="py-2.5 px-3 font-semibold">Date</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.recentPayments?.map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-mono font-medium text-blue-600">{p.receiptNumber}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">
                        {p.studentFee?.student?.firstName} {p.studentFee?.student?.lastName}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {p.studentFee?.feeStructure?.category?.name || 'Tuition'}
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge variant="neutral" className="text-[10px]">
                          {p.paymentMethod}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">
                        {new Date(p.paymentDate).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-emerald-600">
                        ₹{p.amountPaid.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
