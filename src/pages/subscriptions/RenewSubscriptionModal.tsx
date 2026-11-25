import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { superAdminService } from '../../services/super-admin.service';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { CheckCircle2 } from 'lucide-react';

export interface RenewSubscriptionModalProps {
  subscription: any | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RenewSubscriptionModal: React.FC<RenewSubscriptionModalProps> = ({
  subscription,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<any | null>(null);

  const { data: plans = [] } = useQuery({
    queryKey: ['availablePlans'],
    queryFn: () => superAdminService.listPlans(),
    enabled: isOpen,
  });

  const { register, handleSubmit } = useForm({
    defaultValues: {
      planId: subscription?.planId || '',
      billingCycle: 'ANNUAL',
      extensionMonths: 12,
    },
  });

  const onSubmit = async (data: any) => {
    if (!subscription) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await superAdminService.renewSubscription(subscription.id, {
        planId: data.planId || undefined,
        billingCycle: data.billingCycle,
        extensionMonths: Number(data.extensionMonths),
      });
      setSuccessInfo(res.data);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || 'Renewal failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setSuccessInfo(null);
        setError(null);
        onClose();
      }}
      title={`Renew / Extend Subscription: ${subscription?.school?.name || ''}`}
      description="Extends institutional term, applies plan changes, issues paid invoice and records transaction"
      maxWidth="lg"
    >
      {successInfo ? (
        <div className="text-center py-6">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Subscription Extended Successfully!</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Invoice <strong>{successInfo.invoice?.invoiceNumber}</strong> was generated and marked as PAID.
          </p>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-left text-xs space-y-1.5 max-w-sm mx-auto">
            <div className="flex justify-between">
              <span className="text-slate-500">Transaction ID:</span>
              <span className="font-mono">{successInfo.payment?.transactionId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Paid:</span>
              <span className="font-bold">₹{successInfo.invoice?.totalAmount.toLocaleString()}</span>
            </div>
          </div>
          <div className="mt-6">
            <Button
              size="sm"
              onClick={() => {
                setSuccessInfo(null);
                onClose();
              }}
            >
              Close Window
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
          {error && <div className="p-2.5 bg-rose-50 text-rose-700 rounded-md">{error}</div>}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subscription Plan</label>
            <select
              {...register('planId')}
              defaultValue={subscription?.planId}
              className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              {plans.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.name} - ₹{p.annualPrice}/yr (₹{p.monthlyPrice}/mo)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Billing Cycle"
              {...register('billingCycle')}
              options={[
                { label: 'Annual (12 Months)', value: 'ANNUAL' },
                { label: 'Quarterly (3 Months)', value: 'QUARTERLY' },
                { label: 'Monthly (1 Month)', value: 'MONTHLY' },
              ]}
            />

            <Select
              label="Extension Duration"
              {...register('extensionMonths')}
              options={[
                { label: '12 Months (1 Year)', value: '12' },
                { label: '6 Months', value: '6' },
                { label: '3 Months (1 Quarter)', value: '3' },
                { label: '1 Month', value: '1' },
              ]}
            />
          </div>

          <div className="p-3 bg-brand-50 border border-brand-100 rounded-lg text-brand-800 text-[11px]">
            Renewal will automatically recalculate new expiration date and update the institutional tenant
            status to <strong>ACTIVE</strong>.
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              Confirm Extension & Process Payment
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
