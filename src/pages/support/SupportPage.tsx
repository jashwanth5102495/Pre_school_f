import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LifeBuoy, FileText, Mail, Phone, ExternalLink } from 'lucide-react';

export const SupportPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Platform Support & Escalation</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Dedicated assistance channel for platform operations, bug tracking, and school provisioning emergencies
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="p-5 pb-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
              <Mail className="w-4 h-4" />
            </div>
            <CardTitle>Super Admin Hotline</CardTitle>
            <CardDescription>Direct line to principal engineering team</CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 text-xs text-slate-600">
            <p className="font-semibold text-slate-800">ops@edusaas.com</p>
            <p className="mt-1">Response within 15 minutes for critical P1 incidents.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-5 pb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
              <FileText className="w-4 h-4" />
            </div>
            <CardTitle>Architecture Documentation</CardTitle>
            <CardDescription>Review system blueprints and API specs</CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 text-xs text-slate-600">
            <p className="font-semibold text-slate-800">docs/ARCHITECTURE.md</p>
            <p className="mt-1">Comprehensive multi-tenant isolation documentation.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-5 pb-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
              <LifeBuoy className="w-4 h-4" />
            </div>
            <CardTitle>OpenAPI / Swagger</CardTitle>
            <CardDescription>Live interactive REST documentation</CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 text-xs text-slate-600">
            <p className="font-semibold text-slate-800">http://localhost:5000/api-docs</p>
            <p className="mt-1">Inspect and test all 25+ versioned API endpoints.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
