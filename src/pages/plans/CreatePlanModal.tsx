import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { superAdminService } from '../../services/super-admin.service';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';

export interface CreatePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreatePlanModal: React.FC<CreatePlanModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: '',
      code: '',
      description: '',
      monthlyPrice: 99,
      quarterlyPrice: 269,
      annualPrice: 999,
      maxStudents: 500,
      maxTeachers: 50,
      maxStorageMb: 20480,
      maxBranches: 1,
      supportLevel: 'Standard',
      trialDays: 14,
      isTrialAvailable: true,
      status: 'ACTIVE',
    },
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await superAdminService.createPlan({
        ...data,
        monthlyPrice: Number(data.monthlyPrice),
        quarterlyPrice: Number(data.quarterlyPrice),
        annualPrice: Number(data.annualPrice),
        maxStudents: Number(data.maxStudents),
        maxTeachers: Number(data.maxTeachers),
        maxStorageMb: Number(data.maxStorageMb),
        maxBranches: Number(data.maxBranches),
        trialDays: Number(data.trialDays),
      });
      reset();
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to create plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Subscription Plan Tier"
      description="Define quota limits, pricing intervals, and SLA parameters"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && <div className="p-2.5 bg-rose-50 text-rose-700 text-xs rounded-lg">{error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Plan Name *" placeholder="e.g. Ultra Campus" required {...register('name', { required: true })} />
          <Input label="Plan Code *" placeholder="e.g. ultra_campus" required {...register('code', { required: true })} />
        </div>

        <Input
          label="Plan Description *"
          placeholder="e.g. Best suited for regional school groups with over 5,000 students"
          required
          {...register('description', { required: true })}
        />

        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Monthly Price (₹) *"
            type="number"
            required
            {...register('monthlyPrice', { required: true, valueAsNumber: true })}
          />
          <Input
            label="Quarterly Price (₹) *"
            type="number"
            required
            {...register('quarterlyPrice', { required: true, valueAsNumber: true })}
          />
          <Input
            label="Annual Price (₹) *"
            type="number"
            required
            {...register('annualPrice', { required: true, valueAsNumber: true })}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Input
            label="Max Students *"
            type="number"
            required
            {...register('maxStudents', { required: true, valueAsNumber: true })}
          />
          <Input
            label="Max Teachers *"
            type="number"
            required
            {...register('maxTeachers', { required: true, valueAsNumber: true })}
          />
          <Input
            label="Storage (MB) *"
            type="number"
            required
            {...register('maxStorageMb', { required: true, valueAsNumber: true })}
          />
          <Input
            label="Max Branches *"
            type="number"
            required
            {...register('maxBranches', { required: true, valueAsNumber: true })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Support SLA Level"
            {...register('supportLevel')}
            options={[
              { label: 'Standard Email', value: 'Standard' },
              { label: 'Priority Email & Chat', value: 'Priority' },
              { label: '24/7 Dedicated Manager', value: 'Dedicated' },
            ]}
          />
          <Input
            label="Free Trial Period (Days)"
            type="number"
            {...register('trialDays', { valueAsNumber: true })}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={isSubmitting}>
            Publish Plan
          </Button>
        </div>
      </form>
    </Modal>
  );
};
