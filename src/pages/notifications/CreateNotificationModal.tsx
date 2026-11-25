import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { superAdminService } from '../../services/super-admin.service';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';

export interface CreateNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateNotificationModal: React.FC<CreateNotificationModalProps> = ({
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

  const { register, handleSubmit, watch, reset } = useForm({
    defaultValues: {
      targetType: 'ALL',
      targetSchoolId: '',
      title: '',
      message: '',
      severity: 'INFO',
      channels: 'IN_APP',
    },
  });

  const selectedTargetType = watch('targetType');

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await superAdminService.createNotification({
        ...data,
        targetSchoolId: data.targetType === 'SPECIFIC_SCHOOLS' ? data.targetSchoolId : undefined,
      });
      reset();
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || 'Broadcast failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Broadcast Platform Announcement"
      description="Deliver high-priority announcements and notices via real-time push and in-app banner"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
        {error && <div className="p-2.5 bg-rose-50 text-rose-700 rounded-md">{error}</div>}

        <Select
          label="Target Audience *"
          {...register('targetType')}
          options={[
            { label: 'All Onboarded Schools (Global Platform Broadcast)', value: 'ALL' },
            { label: 'Specific School Institution Only', value: 'SPECIFIC_SCHOOLS' },
            { label: 'Schools with Expiring Subscriptions', value: 'EXPIRING_SOON' },
          ]}
        />

        {selectedTargetType === 'SPECIFIC_SCHOOLS' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target School *</label>
            <select
              required
              {...register('targetSchoolId', { required: true })}
              className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">-- Choose School --</option>
              {schools.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.schoolId})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Severity Level *"
            {...register('severity')}
            options={[
              { label: 'Informational (Standard)', value: 'INFO' },
              { label: 'Warning (Important Alert)', value: 'WARNING' },
              { label: 'Urgent (Critical System Notice)', value: 'URGENT' },
              { label: 'Success Notification', value: 'SUCCESS' },
            ]}
          />

          <Select
            label="Delivery Channels"
            {...register('channels')}
            options={[
              { label: 'In-App Real-time Push', value: 'IN_APP' },
              { label: 'In-App + Email Dispatch', value: 'IN_APP,EMAIL' },
            ]}
          />
        </div>

        <Input
          label="Announcement Headline / Title *"
          placeholder="e.g. Scheduled Infrastructure Maintenance Window"
          required
          {...register('title', { required: true })}
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Message *</label>
          <textarea
            rows={4}
            required
            placeholder="Provide context, scheduled times, or actionable instructions..."
            {...register('message', { required: true })}
            className="w-full rounded-md border border-slate-300 p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={isSubmitting}>
            Send Live Broadcast
          </Button>
        </div>
      </form>
    </Modal>
  );
};
