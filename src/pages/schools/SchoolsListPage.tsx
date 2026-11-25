import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { superAdminService } from '../../services/super-admin.service';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { CreateSchoolModal } from './CreateSchoolModal';
import { SchoolRightPanel } from './SchoolRightPanel';
import {
  School,
  Plus,
  Search,
  Filter,
  Eye,
  MoreVertical,
  CheckCircle2,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Network,
  X,
} from 'lucide-react';

export const SchoolsListPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [planId, setPlanId] = useState<string>('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);

  const { data: plans = [] } = useQuery({
    queryKey: ['availablePlans'],
    queryFn: () => superAdminService.listPlans(),
  });

  const {
    data: schoolsResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['schoolsList', page, search, status, planId],
    queryFn: () =>
      superAdminService.listSchools({
        page,
        limit: 10,
        search: search || undefined,
        status: status || undefined,
        planId: planId || undefined,
      }),
  });

  const schools = schoolsResponse?.data || [];
  const meta = schoolsResponse?.meta || { total: 0, totalPages: 1 };

  return (
    <div className="space-y-6">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Schools Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage provisioned educational institutions, subscriptions, and tenant environments
          </p>
        </div>
        <Button size="sm" onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> Provision New School
        </Button>
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
            placeholder="Search school name, code, ID, or city..."
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
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="PENDING">Pending</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          <select
            value={planId}
            onChange={(e) => {
              setPlanId(e.target.value);
              setPage(1);
            }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="">All Plan Tiers</option>
            {plans.map((p: any) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {(search || status || planId) && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setSearch('');
                setStatus('');
                setPlanId('');
                setPage(1);
              }}
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Area: Normal On-Screen Split Layout */}
      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* Left Side: Schools Table */}
        <div
          className={`transition-all duration-200 rounded-xl border border-slate-200/80 dark:border-[#383838] bg-white dark:bg-[#242424] overflow-hidden shadow-xs ${
            selectedSchoolId ? 'w-full lg:w-[50%] xl:w-[48%]' : 'w-full'
          }`}
        >
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-md" />
              ))}
            </div>
          ) : schools.length === 0 ? (
            <EmptyState
              icon={School}
              title="No schools found"
              description="No institutions match your current search or filter criteria. Start by provisioning your first school."
              actionLabel="Onboard School"
              onAction={() => setIsCreateOpen(true)}
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>School & ID</TableHead>
                    {!selectedSchoolId && <TableHead>Contact Person</TableHead>}
                    {!selectedSchoolId && <TableHead>Location</TableHead>}
                    {!selectedSchoolId && <TableHead>Subscription Plan</TableHead>}
                    <TableHead>Quotas</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schools.map((school: any) => {
                    const isSelected = selectedSchoolId === school.id;
                    return (
                      <TableRow
                        key={school.id}
                        onClick={() => setSelectedSchoolId(school.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-rose-50/50 dark:bg-rose-950/20 border-l-4 border-l-[#eb4438]'
                            : 'hover:bg-slate-50/80 dark:hover:bg-[#282828]'
                        }`}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center shrink-0">
                              {school.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-900 dark:text-white leading-tight truncate">
                                {school.name}
                              </div>
                              <div className="text-[11px] font-mono text-brand-600 mt-0.5 truncate">
                                {school.schoolId} • {school.code}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        {!selectedSchoolId && (
                          <TableCell>
                            <div className="text-xs font-medium text-slate-800 dark:text-slate-200">
                              {school.profile?.contactPerson || 'N/A'}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">
                              {school.profile?.primaryPhone || school.profile?.officialEmail || 'No contact'}
                            </div>
                          </TableCell>
                        )}

                        {!selectedSchoolId && (
                          <TableCell>
                            <div className="text-xs text-slate-700 dark:text-slate-300">
                              {school.profile?.city}, {school.profile?.state}
                            </div>
                            <div className="text-[11px] text-slate-400">{school.profile?.country}</div>
                          </TableCell>
                        )}

                        {!selectedSchoolId && (
                          <TableCell>
                            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                              {school.subscription?.plan?.name || 'No Plan'}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {school.subscription?.billingCycle} ({school.subscription?.status})
                            </div>
                          </TableCell>
                        )}

                        <TableCell>
                          <div className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                            {school._count?.students || 0} st / {school._count?.teachers || 0} tch
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant={
                              school.status === 'ACTIVE'
                                ? 'success'
                                : school.status === 'SUSPENDED'
                                ? 'danger'
                                : 'neutral'
                            }
                          >
                            {school.status}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant={isSelected ? 'primary' : 'outline'}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSchoolId(school.id);
                            }}
                            className={isSelected ? 'bg-[#eb4438] text-white text-xs h-7.5 px-2' : 'text-xs h-7.5 px-2'}
                          >
                            <Network className="w-3.5 h-3.5 mr-1" />
                            {isSelected ? 'Selected' : 'Tree'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination Controls */}
              <div className="p-4 border-t border-slate-100 dark:border-[#383838] flex items-center justify-between text-xs text-slate-500">
                <div>
                  Page <strong className="text-slate-800 dark:text-white">{page}</strong> of{' '}
                  <strong className="text-slate-800 dark:text-white">{meta.totalPages}</strong> ({meta.total} Total)
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

        {/* Right Side: Normal On-Screen Profile & Hierarchy Tree Panel (NO POPUP!) */}
        {selectedSchoolId && (
          <SchoolRightPanel
            schoolId={selectedSchoolId}
            onClose={() => setSelectedSchoolId(null)}
            onUpdate={() => {
              refetch();
            }}
          />
        )}
      </div>

      {/* Provision School Modal (Only for provisioning a brand new school tenant) */}
      <CreateSchoolModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
          refetch();
        }}
      />
    </div>
  );
};
