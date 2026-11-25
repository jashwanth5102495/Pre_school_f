import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { superAdminService } from '../../services/super-admin.service';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import {
  Building2,
  Phone,
  BookOpen,
  CreditCard,
  UserCheck,
  CheckCircle2,
  Copy,
} from 'lucide-react';

export interface CreateSchoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateSchoolModal: React.FC<CreateSchoolModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('A');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provisionResult, setProvisionResult] = useState<any | null>(null);

  const { data: plans = [] } = useQuery({
    queryKey: ['availablePlans'],
    queryFn: () => superAdminService.listPlans(),
    enabled: isOpen,
  });

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      code: '',
      type: 'K-12 Day School',
      board: 'CBSE',
      registrationNumber: '',
      establishedYear: 2020,
      website: '',
      logoUrl: '',
      officialEmail: '',
      primaryPhone: '',
      alternatePhone: '',
      contactPerson: '',
      address: '',
      city: '',
      state: '',
      country: 'India',
      postalCode: '',
      academicYear: '2026-2027',
      mediumOfInstruction: 'English',
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      planId: '',
      billingCycle: 'ANNUAL',
      maxStudentsOverride: '',
      adminFullName: '',
      adminEmail: '',
      adminPhone: '',
      adminPassword: 'SchoolAdmin@2026!',
    },
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setError(null);
    try {
      // Ensure workingDays is array
      const payload = {
        ...data,
        establishedYear: Number(data.establishedYear),
        workingDays: Array.isArray(data.workingDays) ? data.workingDays : [data.workingDays],
      };
      const res = await superAdminService.provisionSchool(payload);
      setProvisionResult(res.data);
      onSuccess();
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
          err.response?.data?.message ||
          err.message ||
          'Failed to provision school'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setProvisionResult(null);
        setError(null);
        setActiveTab('A');
        onClose();
      }}
      title="Provision New Educational Institution"
      description="Multi-section school registration with atomic tenant provisioning and admin setup"
      maxWidth="3xl"
    >
      {provisionResult ? (
        <div className="text-center py-6">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">School Tenant Successfully Provisioned!</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6">
            The school environment, profile, initial subscription, and administrative credentials have been successfully provisioned.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left space-y-2.5 max-w-md mx-auto text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
              <span className="text-slate-500">School ID:</span>
              <span className="font-mono font-bold text-brand-700">{provisionResult.school.schoolId}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
              <span className="text-slate-500">School Name:</span>
              <span className="font-semibold text-slate-800">{provisionResult.school.name}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Admin Email:</span>
              <span className="font-semibold text-slate-800">{provisionResult.schoolAdmin.email}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">Activation Token:</span>
              <button
                type="button"
                onClick={() => copyToClipboard(provisionResult.activationToken)}
                className="flex items-center gap-1 font-mono text-[11px] text-brand-600 hover:text-brand-800"
              >
                <Copy className="w-3 h-3" /> Copy Token
              </button>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Button
              onClick={() => {
                setProvisionResult(null);
                onClose();
              }}
            >
              Done & View Schools
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          {/* Section Navigation Tabs */}
          <div className="flex border-b border-slate-200 gap-1 pb-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('A')}
              className={`px-3 py-2 rounded-t-lg font-medium flex items-center gap-1.5 transition-colors ${
                activeTab === 'A'
                  ? 'border-b-2 border-brand-600 text-brand-600 font-semibold bg-brand-50/50'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" /> A. Basic Info
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('B')}
              className={`px-3 py-2 rounded-t-lg font-medium flex items-center gap-1.5 transition-colors ${
                activeTab === 'B'
                  ? 'border-b-2 border-brand-600 text-brand-600 font-semibold bg-brand-50/50'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Phone className="w-3.5 h-3.5" /> B. Contact
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('C')}
              className={`px-3 py-2 rounded-t-lg font-medium flex items-center gap-1.5 transition-colors ${
                activeTab === 'C'
                  ? 'border-b-2 border-brand-600 text-brand-600 font-semibold bg-brand-50/50'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> C. Academic
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('D')}
              className={`px-3 py-2 rounded-t-lg font-medium flex items-center gap-1.5 transition-colors ${
                activeTab === 'D'
                  ? 'border-b-2 border-brand-600 text-brand-600 font-semibold bg-brand-50/50'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" /> D. Subscription
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('E')}
              className={`px-3 py-2 rounded-t-lg font-medium flex items-center gap-1.5 transition-colors ${
                activeTab === 'E'
                  ? 'border-b-2 border-brand-600 text-brand-600 font-semibold bg-brand-50/50'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" /> E. Admin Account
            </button>
          </div>

          {/* Section A: Basic Info */}
          {activeTab === 'A' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="School Full Name *"
                placeholder="e.g. Cambridge International School"
                required
                {...register('name', { required: true })}
              />
              <Input
                label="Unique School Code *"
                placeholder="e.g. CAMBRIDGE-01"
                required
                {...register('code', { required: true })}
              />
              <Input
                label="School Type *"
                placeholder="e.g. K-12 Day & Boarding"
                required
                {...register('type', { required: true })}
              />
              <Input
                label="Board Affiliation *"
                placeholder="e.g. CBSE, ICSE, IB"
                required
                {...register('board', { required: true })}
              />
              <Input
                label="Official Registration Number *"
                placeholder="e.g. REG-MH-2026-102"
                required
                {...register('registrationNumber', { required: true })}
              />
              <Input
                label="Established Year *"
                type="number"
                placeholder="2015"
                required
                {...register('establishedYear', { required: true, valueAsNumber: true })}
              />
              <div className="sm:col-span-2">
                <Input
                  label="Official Website URL"
                  placeholder="https://www.cambridge.edu"
                  {...register('website')}
                />
              </div>
            </div>
          )}

          {/* Section B: Contact Info */}
          {activeTab === 'B' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Official Email Address *"
                type="email"
                placeholder="info@cambridge.edu"
                required
                {...register('officialEmail', { required: true })}
              />
              <Input
                label="Primary Telephone / Mobile *"
                placeholder="+91 98200 12345"
                required
                {...register('primaryPhone', { required: true })}
              />
              <Input
                label="Alternate Phone Number"
                placeholder="+91 22 2456 7890"
                {...register('alternatePhone')}
              />
              <Input
                label="Designated Contact Person *"
                placeholder="Dr. Sarah Jenkins (Principal)"
                required
                {...register('contactPerson', { required: true })}
              />
              <div className="sm:col-span-2">
                <Input
                  label="Campus Physical Address *"
                  placeholder="Plot 45, Knowledge Boulevard"
                  required
                  {...register('address', { required: true })}
                />
              </div>
              <Input label="City *" placeholder="Mumbai" required {...register('city', { required: true })} />
              <Input label="State *" placeholder="Maharashtra" required {...register('state', { required: true })} />
              <Input label="Country *" placeholder="India" required {...register('country', { required: true })} />
              <Input label="Postal / ZIP Code *" placeholder="400001" required {...register('postalCode', { required: true })} />
            </div>
          )}

          {/* Section C: Academic Info */}
          {activeTab === 'C' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Current Academic Session *"
                placeholder="2026-2027"
                required
                {...register('academicYear', { required: true })}
              />
              <Input
                label="Primary Medium of Instruction *"
                placeholder="English"
                required
                {...register('mediumOfInstruction', { required: true })}
              />
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Operating School Working Days *
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                    <label
                      key={day}
                      className="flex items-center gap-1.5 p-2 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100"
                    >
                      <input
                        type="checkbox"
                        value={day}
                        defaultChecked={day !== 'Saturday'}
                        {...register('workingDays')}
                        className="rounded border-slate-300 text-brand-600"
                      />
                      <span>{day.slice(0, 3)}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Section D: Subscription */}
          {activeTab === 'D' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Subscription Plan Tier *
                </label>
                <select
                  required
                  {...register('planId', { required: true })}
                  className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="">-- Choose Plan Tier --</option>
                  {plans.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Max {p.maxStudents} Students, {p.maxTeachers} Teachers) - ₹{p.annualPrice}/yr
                    </option>
                  ))}
                </select>
              </div>

              <Select
                label="Billing Cycle *"
                {...register('billingCycle')}
                options={[
                  { label: 'Annual (12 Months)', value: 'ANNUAL' },
                  { label: 'Quarterly (3 Months)', value: 'QUARTERLY' },
                  { label: 'Monthly (1 Month)', value: 'MONTHLY' },
                ]}
              />

              <Input
                label="Custom Student Limit (Override)"
                type="number"
                placeholder="Leave blank to use plan default"
                {...register('maxStudentsOverride')}
              />
            </div>
          )}

          {/* Section E: School Admin Account */}
          {activeTab === 'E' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="School Admin Full Name *"
                placeholder="e.g. Dr. Arthur Pendelton"
                required
                {...register('adminFullName', { required: true })}
              />
              <Input
                label="School Admin Email (Username) *"
                type="email"
                placeholder="admin@cambridge.edu"
                required
                {...register('adminEmail', { required: true })}
              />
              <Input
                label="Admin Phone Number *"
                placeholder="+91 98200 12345"
                required
                {...register('adminPhone', { required: true })}
              />
              <Input
                label="Temporary Password *"
                type="text"
                placeholder="SchoolAdmin@2026!"
                required
                {...register('adminPassword', { required: true })}
                helperText="Password must be at least 8 characters"
              />
            </div>
          )}

          {/* Dialog Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div>
              {activeTab !== 'A' && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const tabs: ('A' | 'B' | 'C' | 'D' | 'E')[] = ['A', 'B', 'C', 'D', 'E'];
                    const currentIdx = tabs.indexOf(activeTab);
                    setActiveTab(tabs[currentIdx - 1]);
                  }}
                >
                  Previous Step
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {activeTab !== 'E' ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    const tabs: ('A' | 'B' | 'C' | 'D' | 'E')[] = ['A', 'B', 'C', 'D', 'E'];
                    const currentIdx = tabs.indexOf(activeTab);
                    setActiveTab(tabs[currentIdx + 1]);
                  }}
                >
                  Continue to Next Step
                </Button>
              ) : (
                <Button type="submit" size="sm" isLoading={isSubmitting}>
                  Provision & Launch School
                </Button>
              )}
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
};
