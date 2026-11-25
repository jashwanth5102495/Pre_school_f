import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schoolPortalService } from '../../services/school-portal.service';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Building2, Save, Sparkles, CheckCircle2 } from 'lucide-react';

export const SchoolProfilePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isSuccess, setIsSuccess] = useState(false);

  const { data: school, isLoading } = useQuery({
    queryKey: ['school-profile'],
    queryFn: () => schoolPortalService.getSchoolProfile(),
  });

  const [formData, setFormData] = useState<any>(null);

  React.useEffect(() => {
    if (school) {
      setFormData({
        name: school.name || '',
        website: school.website || '',
        officialEmail: school.profile?.officialEmail || '',
        primaryPhone: school.profile?.primaryPhone || '',
        contactPerson: school.profile?.contactPerson || '',
        address: school.profile?.address || '',
        city: school.profile?.city || '',
        state: school.profile?.state || '',
        country: school.profile?.country || '',
        postalCode: school.profile?.postalCode || '',
        workingDays: school.profile?.workingDays || '',
      });
    }
  }, [school]);

  const updateMutation = useMutation({
    mutationFn: (data: any) =>
      schoolPortalService.updateSchoolProfile({
        name: data.name,
        website: data.website,
        profile: {
          officialEmail: data.officialEmail,
          primaryPhone: data.primaryPhone,
          contactPerson: data.contactPerson,
          address: data.address,
          city: data.city,
          state: data.state,
          country: data.country,
          postalCode: data.postalCode,
          workingDays: data.workingDays,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-profile'] });
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 4000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      updateMutation.mutate(formData);
    }
  };

  if (isLoading || !formData) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600" /> School Institution Profile
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Official institutional information, contact coordinates, campus address, and active subscription details
        </p>
      </div>

      {isSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>School institution profile updated successfully.</span>
        </div>
      )}

      {/* Subscription Card */}
      <Card className="p-5 bg-gradient-to-r from-slate-900 to-blue-950 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs text-blue-300 font-semibold uppercase tracking-wider">Active Subscription</div>
            <div className="text-xl font-bold mt-0.5">
              {school.subscription?.plan?.name || 'Institutional Premium'}
            </div>
            <div className="text-xs text-slate-300 mt-1">
              Billing: {school.subscription?.billingCycle} &middot; Valid until:{' '}
              {school.subscription?.endDate ? new Date(school.subscription.endDate).toLocaleDateString() : 'Active'}
            </div>
          </div>
          <Badge className="bg-emerald-500 text-white border-0 text-xs py-1 px-3">
            {school.subscription?.status || 'ACTIVE'}
          </Badge>
        </div>
      </Card>

      {/* Profile Form */}
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="School Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              label="Official Website"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Official Email"
              type="email"
              required
              value={formData.officialEmail}
              onChange={(e) => setFormData({ ...formData, officialEmail: e.target.value })}
            />
            <Input
              label="Primary Phone"
              required
              value={formData.primaryPhone}
              onChange={(e) => setFormData({ ...formData, primaryPhone: e.target.value })}
            />
            <Input
              label="Principal / Contact Person"
              required
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
            />
          </div>

          <Input
            label="Street Address"
            required
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Input
              label="City"
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
            <Input
              label="State"
              required
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            />
            <Input
              label="Postal Code"
              required
              value={formData.postalCode}
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
            />
            <Input
              label="Country"
              required
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            />
          </div>

          <Input
            label="Working Days"
            value={formData.workingDays}
            onChange={(e) => setFormData({ ...formData, workingDays: e.target.value })}
            placeholder="Monday,Tuesday,Wednesday,Thursday,Friday,Saturday"
          />

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button type="submit" isLoading={updateMutation.isPending} className="flex items-center gap-2">
              <Save className="w-4 h-4" /> Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
