import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { superAdminService } from '../../services/super-admin.service';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';

export interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      role: 'PLATFORM_SUPPORT',
      password: '',
    },
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await superAdminService.createPlatformUser(data);
      reset();
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || 'User creation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Platform Administrative User"
      description="Grant role-based credentials to platform company personnel"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
        {error && <div className="p-2.5 bg-rose-50 text-rose-700 rounded-md">{error}</div>}

        <Input
          label="Full Name *"
          placeholder="e.g. Alex Morgan"
          required
          {...register('fullName', { required: true })}
        />

        <Input
          label="Company Email Address *"
          type="email"
          placeholder="alex@edusaas.com"
          required
          {...register('email', { required: true })}
        />

        <Input
          label="Phone Number"
          placeholder="+1 555-019-9922"
          {...register('phone')}
        />

        <Select
          label="Platform Role *"
          {...register('role')}
          options={[
            { label: 'SUPER_ADMIN - Full Platform Authority', value: 'SUPER_ADMIN' },
            { label: 'PLATFORM_SUPPORT - School & Operations Support', value: 'PLATFORM_SUPPORT' },
            { label: 'PLATFORM_FINANCE - Payments, Invoices & Billing', value: 'PLATFORM_FINANCE' },
          ]}
        />

        <Input
          label="Initial Password *"
          type="password"
          placeholder="••••••••••••"
          required
          {...register('password', { required: true })}
          helperText="Minimum 8 characters"
        />

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={isSubmitting}>
            Create User Account
          </Button>
        </div>
      </form>
    </Modal>
  );
};
