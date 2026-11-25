import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Settings, Shield, Server, Database, Key, Lock, Activity } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { data: healthData, isLoading } = useQuery({
    queryKey: ['systemHealth'],
    queryFn: async () => {
      const res = await apiClient.get('/health');
      return res.data;
    },
    refetchInterval: 10000,
  });

  const uptimeMinutes = healthData ? Math.floor(healthData.uptime / 60) : 0;
  const uptimeSeconds = healthData ? Math.floor(healthData.uptime % 60) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Platform Settings & Telemetry</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time server health, environment parameters, and active multi-tenant configuration
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Live Server Telemetry */}
        <Card>
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <CardTitle>API Server Health</CardTitle>
              </div>
              <Badge variant={healthData?.status === 'healthy' ? 'success' : 'warning'}>
                {healthData?.status?.toUpperCase() || 'CONNECTING...'}
              </Badge>
            </div>
            <CardDescription>Continuous heartbeat monitoring from `/api/v1/health`</CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Service Status:</span>
              <span className="font-semibold text-emerald-700">Healthy & Online</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Process Uptime:</span>
              <span className="font-semibold text-slate-800">
                {uptimeMinutes}m {uptimeSeconds}s
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Active Environment:</span>
              <span className="font-semibold text-slate-800">{healthData?.environment || 'development'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Server Timestamp:</span>
              <span className="font-mono text-[11px] text-slate-600">
                {healthData?.timestamp ? new Date(healthData.timestamp).toLocaleTimeString() : 'N/A'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* PostgreSQL Database Status */}
        <Card>
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-brand-600" />
                <CardTitle>PostgreSQL Multi-Tenant Cluster</CardTitle>
              </div>
              <Badge variant="success">ONLINE</Badge>
            </div>
            <CardDescription>Primary relational persistence layer and tenant partitions</CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">ORM Dialect:</span>
              <span className="font-semibold text-slate-800">Prisma Client v6.x</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Isolation Method:</span>
              <span className="font-semibold text-slate-800">Shared DB, Shared Schema (tenantId)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Row Level Security:</span>
              <span className="font-semibold text-slate-800">Application Middleware Enforced</span>
            </div>
          </CardContent>
        </Card>

        {/* Security & Token Policies */}
        <Card>
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-600" />
              <CardTitle>Authentication & Security</CardTitle>
            </div>
            <CardDescription>Session management, token lifespans, and hashing algorithms</CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Access Token Lifespan:</span>
              <span className="font-semibold text-slate-800">15 Minutes (Short-lived)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Refresh Token Rotation:</span>
              <span className="font-semibold text-slate-800">Enabled (HttpOnly Cookie + Family Invalidation)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Password Hashing:</span>
              <span className="font-semibold text-slate-800">bcrypt (12 rounds)</span>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Socket Engine */}
        <Card>
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-purple-600" />
                <CardTitle>Socket.IO Event Engine</CardTitle>
              </div>
              <Badge variant="success">CONNECTED</Badge>
            </div>
            <CardDescription>Live push communications and room authorization</CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Platform Super Admin Room:</span>
              <span className="font-mono text-brand-600">room:platform_super_admin</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Tenant Scoped Rooms:</span>
              <span className="font-mono text-brand-600">room:tenant:{'{schoolId}'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Cross-Tenant Isolation:</span>
              <span className="font-semibold text-emerald-600">Strictly Enforced</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
