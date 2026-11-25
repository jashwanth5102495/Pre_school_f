import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { superAdminService } from '../../services/super-admin.service';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';

export interface FeatureOverrideModalProps {
  feature: any | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const FeatureOverrideModal: React.FC<FeatureOverrideModalProps> = ({
  feature,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: schoolsRes } = useQuery({
    queryKey: ['schoolsDropdown'],
    queryFn: () => superAdminService.listSchools({ limit: 100 }),
    enabled: isOpen,
  });

  const schools = schoolsRes?.data || [];

  const { register, handleSubmit } = useForm({
    defaultValues: {
      schoolId: '',
      isEnabled: true,
      reason: 'Special institutional pilot approval',
      validUntil: '',
    },
  });

  const onSubmit = async (data: any) => {
    if (!feature) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await superAdminService.overrideSchoolFeature({
        schoolId: data.schoolId,
        featureCode: feature.code,
        isEnabled: data.isEnabled === 'true' || data.isEnabled === true,
        reason: data.reason,
        validUntil: data.validUntil || undefined,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || 'Override configuration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Configure School Exception: ${feature?.name || ''}`}
      description="Grant or restrict this module for a specific school regardless of their plan"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
        {error && <div className="p-2.5 bg-rose-50 text-rose-700 rounded-md">{error}</div>}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Target School *</label>
          <select
            required
            {...register('schoolId', { required: true })}
            className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="">-- Select School Tenant --</option>
            {schools.map((s: any) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.schoolId})
              </option>
            ))}
          </select>
        </div>

        <Select
          label="Feature Access State *"
          {...register('isEnabled')}
          options={[
            { label: 'Explicitly Enabled (Grant Access)', value: 'true' },
            { label: 'Explicitly Disabled (Block Access)', value: 'false' },
          ]}
        />

        <Input
          label="Administrative Reason / Ticket Reference *"
          placeholder="e.g. Paid add-on module or pilot program"
          required
          {...register('reason', { required: true })}
        />

        <Input
          label="Valid Until (Optional Expiration)"
          type="date"
          {...register('validUntil')}
          helperText="Leave blank for indefinite duration"
        />

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={isSubmitting}>
            Save Override
          </Button>
        </div>
      </form>
    </Modal>
  );
};
