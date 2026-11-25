import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { superAdminService } from '../../services/super-admin.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  School,
  Users,
  Repeat,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  CreditCard,
  Plus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const PIE_COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

export const DashboardPage: React.FC = () => {
  const {
    data: dashboardData,
    isLoading: isDashLoading,
    error: dashError,
    refetch,
  } = useQuery({
    queryKey: ['superAdminDashboard'],
    queryFn: () => superAdminService.getDashboardMetrics(),
  });

  const { data: revenueChartData } = useQuery({
    queryKey: ['revenueGrowthChart'],
    queryFn: () => superAdminService.getRevenueChart(),
  });

  const { data: schoolGrowthData } = useQuery({
    queryKey: ['schoolGrowthChart'],
    queryFn: () => superAdminService.getSchoolGrowthChart(),
  });

  if (isDashLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-7 w-48 mb-2" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  if (dashError) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-8 text-center max-w-lg mx-auto my-12">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-rose-900">Failed to load platform dashboard</h3>
        <p className="text-xs text-rose-600 mt-1 mb-4">
          {(dashError as any)?.response?.data?.error?.message || (dashError as any)?.message}
        </p>
        <Button size="sm" onClick={() => refetch()}>
          Retry Connection
        </Button>
      </div>
    );
  }

  const kpis = dashboardData?.kpis || {};
  const recentSchools = dashboardData?.recentSchools || [];
  const recentPayments = dashboardData?.recentPayments || [];
  const upcomingExpirations = dashboardData?.upcomingExpirations || [];
  const recentActivities = dashboardData?.recentActivities || [];
  const planDistribution = dashboardData?.planDistribution || [];

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Platform Command Center</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time multi-tenant operations, financial performance, and institutional subscriptions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/schools">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1" /> Onboard School
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Total Schools */}
        <Card>
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Schools</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <School className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{kpis.totalSchools ?? 0}</div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
              <span className="text-emerald-600 font-semibold">{kpis.activeSchools ?? 0} Active</span>
              <span>•</span>
              <span className="text-rose-600 font-medium">{kpis.suspendedSchools ?? 0} Suspended</span>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Recurring Revenue */}
        <Card>
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Monthly Recurring</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              ₹{(kpis.monthlyRecurringRevenue ?? 0).toLocaleString()}
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-[11px] text-slate-500 mt-1">Normalized active annualized MRR</div>
          </CardContent>
        </Card>

        {/* Total Platform Revenue */}
        <Card>
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Collected</span>
              <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              ₹{(kpis.totalRevenue ?? 0).toLocaleString()}
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-[11px] text-slate-500 mt-1">Processed completed payments</div>
          </CardContent>
        </Card>

        {/* Total Students Across Tenants */}
        <Card>
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Students</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{kpis.totalStudents ?? 0}</div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-[11px] text-slate-500 mt-1">Across all onboarded schools</div>
          </CardContent>
        </Card>

        {/* Subscriptions */}
        <Card>
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Active Subscriptions</span>
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Repeat className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{kpis.activeSubscriptions ?? 0}</div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-[11px] text-slate-500 mt-1">
              <span className="text-amber-600 font-medium">{kpis.expiredSubscriptions ?? 0} Expired</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visualizations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Subscription Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="p-5 pb-3">
            <CardTitle>Revenue Generation Trend</CardTitle>
            <CardDescription>Monthly collected revenue across institutional subscriptions</CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="h-64 w-full">
              {revenueChartData && revenueChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      formatter={(val: number) => [`₹${val.toLocaleString()}`, 'Revenue']}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No historical revenue periods found.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Plan Distribution Chart */}
        <Card>
          <CardHeader className="p-5 pb-3">
            <CardTitle>Subscription Plan Distribution</CardTitle>
            <CardDescription>Active schools segmented by plan tier</CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="h-64 w-full flex flex-col justify-center items-center">
              {planDistribution && planDistribution.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={170}>
                    <PieChart>
                      <Pie
                        data={planDistribution}
                        dataKey="count"
                        nameKey="planName"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={4}
                      >
                        {planDistribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-2 mt-2 w-full text-xs">
                    {planDistribution.map((entry: any, idx: number) => (
                      <div key={entry.planName} className="flex items-center gap-1.5 truncate">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                        <span className="text-slate-600 truncate">{entry.planName}</span>
                        <span className="font-semibold text-slate-800 ml-auto">{entry.count}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-xs text-slate-400">No active subscriptions registered yet.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* School Growth Bar Chart & Upcoming Expirations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* School Registration Growth */}
        <Card>
          <CardHeader className="p-5 pb-3">
            <CardTitle>School Registration Growth</CardTitle>
            <CardDescription>Monthly onboarded educational institutions</CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="h-60 w-full">
              {schoolGrowthData && schoolGrowthData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={schoolGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                    <Bar dataKey="total" name="Total Schools" fill="#818cf8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="active" name="Active Schools" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No registration growth recorded.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Subscription Expirations */}
        <Card>
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Upcoming Expirations (Next 30 Days)</CardTitle>
                <CardDescription>Schools requiring renewal or intervention</CardDescription>
              </div>
              <Link to="/subscriptions" className="text-xs text-brand-600 hover:text-brand-700 font-medium">
                View All
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            {upcomingExpirations && upcomingExpirations.length > 0 ? (
              <div className="space-y-3">
                {upcomingExpirations.map((sub: any) => {
                  const daysRemaining = Math.max(
                    0,
                    Math.ceil((new Date(sub.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                  );
                  return (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50"
                    >
                      <div>
                        <div className="text-xs font-semibold text-slate-800">{sub.school.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {sub.plan.name} • {sub.billingCycle}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={daysRemaining <= 7 ? 'danger' : 'warning'}>
                          {daysRemaining} days remaining
                        </Badge>
                        <div className="text-[10px] text-slate-400 mt-1">
                          Ends: {new Date(sub.endDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-44 flex flex-col items-center justify-center text-xs text-slate-400">
                <ShieldCheck className="w-8 h-8 text-emerald-500 mb-1" />
                No subscriptions expiring in the next 30 days.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Streams: Schools, Payments, Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Schools */}
        <Card>
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Recent School Registrations</CardTitle>
              <Link to="/schools" className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-0.5">
                Manage Schools <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            {recentSchools && recentSchools.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-[#333333]">
                {recentSchools.map((s: any) => (
                  <div key={s.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#eb4438]/10 border border-[#eb4438]/20 text-[#eb4438] font-bold text-xs flex items-center justify-center">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-900 dark:text-white">{s.name}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {s.schoolId} • {s.profile?.city || 'Location N/A'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={s.status === 'ACTIVE' ? 'success' : s.status === 'SUSPENDED' ? 'danger' : 'neutral'}>
                        {s.status}
                      </Badge>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(s.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                No onboarded schools registered yet.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Platform Audit Trail */}
        <Card>
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Platform Operations Audit</CardTitle>
              <Link to="/audit-logs" className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-0.5">
                Full Audit Trail <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            {recentActivities && recentActivities.length > 0 ? (
              <div className="space-y-3">
                {recentActivities.map((log: any) => (
                  <div key={log.id} className="flex items-start gap-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{log.action.replace(/_/g, ' ')}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        By {log.actorEmail} • Target: {log.targetType}
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                No recent platform activities recorded.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
