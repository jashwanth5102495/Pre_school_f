import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { superAdminService } from '../../services/super-admin.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { CreatePlanModal } from './CreatePlanModal';
import {
  CreditCard,
  Plus,
  Check,
  Users,
  HardDrive,
  GitBranch,
  ShieldCheck,
} from 'lucide-react';

export const PlansPage: React.FC = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const {
    data: plans = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['plansCatalog'],
    queryFn: () => superAdminService.listPlans(),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Subscription Plans & Quotas</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure multi-tenant SaaS tiers, resource thresholds, and billing intervals
          </p>
        </div>
        <Button size="sm" onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> Create Plan Tier
        </Button>
      </div>

      {/* Plan Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-96 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan: any) => (
            <Card key={plan.id} className="flex flex-col justify-between hover:border-brand-300 transition-all">
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant={plan.code === 'enterprise' ? 'brand' : 'neutral'}>
                    {plan.code.toUpperCase()}
                  </Badge>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {plan._count?.subscriptions || 0} Subscribed
                  </span>
                </div>
                <CardTitle className="text-lg mt-2">{plan.name}</CardTitle>
                <CardDescription className="line-clamp-2 h-8">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="p-5 pt-0 flex-1 flex flex-col justify-between">
                <div>
                  {/* Pricing Box */}
                  <div className="my-4 p-3 rounded-lg bg-slate-50 border border-slate-100 text-center">
                    <div className="text-2xl font-bold text-slate-900">
                      ₹{plan.annualPrice.toLocaleString()}
                      <span className="text-xs font-normal text-slate-500"> /year</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      ₹{plan.monthlyPrice}/mo or ₹{plan.quarterlyPrice}/quarter
                    </div>
                  </div>

                  {/* Quota Limits */}
                  <div className="space-y-2 text-xs py-2 border-t border-b border-slate-100">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" /> Max Students:
                      </span>
                      <strong className="text-slate-800">{plan.maxStudents.toLocaleString()}</strong>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" /> Max Teachers:
                      </span>
                      <strong className="text-slate-800">{plan.maxTeachers}</strong>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <HardDrive className="w-3.5 h-3.5 text-slate-400" /> Storage Limit:
                      </span>
                      <strong className="text-slate-800">{Math.round(plan.maxStorageMb / 1024)} GB</strong>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <GitBranch className="w-3.5 h-3.5 text-slate-400" /> Campus Branches:
                      </span>
                      <strong className="text-slate-800">{plan.maxBranches}</strong>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> Support SLA:
                      </span>
                      <strong className="text-slate-800 truncate max-w-[120px]">{plan.supportLevel}</strong>
                    </div>
                  </div>

                  {/* Enabled Features Bullet List */}
                  <div className="mt-4 space-y-1.5 text-[11px] text-slate-600">
                    <div className="font-semibold text-slate-800 mb-1">Included Modules:</div>
                    {plan.features?.slice(0, 5).map((f: any) => (
                      <div key={f.featureCode} className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{f.feature?.name || f.featureCode}</span>
                      </div>
                    ))}
                    {plan.features?.length > 5 && (
                      <div className="text-[10px] text-brand-600 font-medium pl-5">
                        +{plan.features.length - 5} more capabilities
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <Button variant="outline" size="sm" className="w-full">
                    Configure Tier Limits
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Plan Dialog */}
      <CreatePlanModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => refetch()}
      />
    </div>
  );
};
