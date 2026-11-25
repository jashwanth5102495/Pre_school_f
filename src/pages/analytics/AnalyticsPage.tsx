import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { superAdminService } from '../../services/super-admin.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  BarChart3,
  TrendingUp,
  Percent,
  Users,
  Building,
  DollarSign,
  PieChart as PieIcon,
  ShieldCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['superAdminDashboard'],
    queryFn: () => superAdminService.getDashboardMetrics(),
  });

  const { data: revenueData } = useQuery({
    queryKey: ['revenueGrowthChart'],
    queryFn: () => superAdminService.getRevenueChart(),
  });

  const kpis = dashboardData?.kpis || {};
  const activeSchools = kpis.activeSchools || 0;
  const totalSchools = kpis.totalSchools || 0;
  const totalRev = kpis.totalRevenue || 0;
  const totalStudents = kpis.totalStudents || 0;
  const totalTeachers = kpis.totalTeachers || 0;
  const activeSubs = kpis.activeSubscriptions || 0;
  const expiredSubs = kpis.expiredSubscriptions || 0;

  // Real database-calculated analytics
  const arpu = activeSchools > 0 ? Math.round(totalRev / activeSchools) : 0;
  const healthRatio = totalSchools > 0 ? Math.round((activeSchools / totalSchools) * 100) : 0;
  const totalContracts = activeSubs + expiredSubs;
  const activeContractRatio = totalContracts > 0 ? Math.round((activeSubs / totalContracts) * 100) : 100;
  const staffRatio = totalTeachers > 0 ? `1 : ${Math.round(totalStudents / totalTeachers)}` : `${totalStudents} Students`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Platform Analytics & Intelligence</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Live operational telemetry and institutional performance metrics across all onboarded schools
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="p-4 pb-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Average Rev / School</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">₹{arpu.toLocaleString()}</div>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <div className="text-[11px] text-slate-500">
                Total Collections (₹{totalRev.toLocaleString()}) ÷ {activeSchools} Active Schools
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 pb-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Tenant Health Ratio</span>
              <div className="text-2xl font-bold text-emerald-600 mt-1">{healthRatio}%</div>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <div className="text-[11px] text-slate-500">
                {activeSchools} Active of {totalSchools} Total Provisioned
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 pb-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Active Contract Ratio</span>
              <div className="text-2xl font-bold text-indigo-600 mt-1">{activeContractRatio}%</div>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <div className="text-[11px] text-slate-500">
                {activeSubs} Active of {totalContracts} Subscription Records
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 pb-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Staff-to-Student Ratio</span>
              <div className="text-2xl font-bold text-amber-600 mt-1">{staffRatio}</div>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <div className="text-[11px] text-slate-500">
                {totalTeachers} Teachers, {totalStudents} Students
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="p-5 pb-2">
            <CardTitle>Database Revenue Trajectory</CardTitle>
            <CardDescription>Monthly collections aggregated from confirmed transactions</CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="h-64 w-full">
              {revenueData && revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                    <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No revenue data recorded yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-5 pb-2">
            <CardTitle>Live Database Telemetry</CardTitle>
            <CardDescription>Live relational metrics verified across all active branches</CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex justify-between items-center">
                <span className="text-slate-600">Total Provisioned Schools</span>
                <span className="font-semibold text-slate-900">{kpis.totalSchools ?? 0}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex justify-between items-center">
                <span className="text-slate-600">Active School Tenants</span>
                <span className="font-semibold text-slate-900">{kpis.activeSchools ?? 0}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex justify-between items-center">
                <span className="text-slate-600">Enrolled Students Across Tenants</span>
                <span className="font-semibold text-slate-900">{kpis.totalStudents ?? 0}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex justify-between items-center">
                <span className="text-slate-600">Teaching Staff Across Tenants</span>
                <span className="font-semibold text-slate-900">{kpis.totalTeachers ?? 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
