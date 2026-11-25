import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { superAdminService } from '../../services/super-admin.service';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { RenewSubscriptionModal } from './RenewSubscriptionModal';
import {
  Repeat,
  Search,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export const SubscriptionsListPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [renewSub, setRenewSub] = useState<any | null>(null);

  const {
    data: subResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['subscriptionsList', page, search, status],
    queryFn: () =>
      superAdminService.listSubscriptions({
        page,
        limit: 10,
        search: search || undefined,
        status: status || undefined,
      }),
  });

  const subscriptions = subResponse?.data || [];
  const meta = subResponse?.meta || { total: 0, totalPages: 1 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Institutional Subscriptions</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor school contracts, expiration dates, billing cycles, and renew terms
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-slate-200/80 bg-white flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search school name or ID..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="">All Subscription Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="TRIAL">Trial</option>
            <option value="PAST_DUE">Past Due</option>
            <option value="EXPIRED">Expired</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      {/* Table Data */}
      <div className="rounded-xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-md" />
            ))}
          </div>
        ) : subscriptions.length === 0 ? (
          <EmptyState
            icon={Repeat}
            title="No subscriptions found"
            description="No active or pending subscriptions match the selected criteria."
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>School Tenant</TableHead>
                  <TableHead>Plan Tier</TableHead>
                  <TableHead>Cycle</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Expiration Date</TableHead>
                  <TableHead>Days Remaining</TableHead>
                  <TableHead>Quota (Students / Staff)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((sub: any) => {
                  const daysRemaining = Math.max(
                    0,
                    Math.ceil((new Date(sub.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                  );
                  const isExpired = new Date(sub.endDate).getTime() < new Date().getTime();

                  return (
                    <TableRow key={sub.id}>
                      <TableCell>
                        <div className="font-semibold text-slate-900">{sub.school.name}</div>
                        <div className="text-[11px] font-mono text-brand-600">{sub.school.schoolId}</div>
                      </TableCell>

                      <TableCell>
                        <span className="font-medium text-slate-800">{sub.plan.name}</span>
                      </TableCell>

                      <TableCell>
                        <Badge variant="neutral">{sub.billingCycle}</Badge>
                      </TableCell>

                      <TableCell className="text-xs text-slate-500">
                        {new Date(sub.startDate).toLocaleDateString()}
                      </TableCell>

                      <TableCell className="text-xs font-semibold text-slate-800">
                        {new Date(sub.endDate).toLocaleDateString()}
                      </TableCell>

                      <TableCell>
                        {isExpired ? (
                          <Badge variant="danger">Expired</Badge>
                        ) : (
                          <Badge variant={daysRemaining <= 14 ? 'warning' : 'success'}>
                            {daysRemaining} Days
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-xs text-slate-700">
                        {sub.school._count?.students || 0} /{' '}
                        {sub.maxStudentsOverride || sub.plan.maxStudents} St
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            sub.status === 'ACTIVE'
                              ? 'success'
                              : sub.status === 'SUSPENDED'
                              ? 'danger'
                              : 'warning'
                          }
                        >
                          {sub.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setRenewSub(sub)}
                        >
                          <TrendingUp className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Renew
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div>
                Page <strong className="text-slate-800">{page}</strong> of{' '}
                <strong className="text-slate-800">{meta.totalPages}</strong> ({meta.total} Subscriptions)
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Renew / Extend Dialog */}
      <RenewSubscriptionModal
        subscription={renewSub}
        isOpen={!!renewSub}
        onClose={() => setRenewSub(null)}
        onSuccess={() => refetch()}
      />
    </div>
  );
};
