import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { superAdminService } from '../../services/super-admin.service';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  School,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  Repeat,
  ShieldAlert,
  Send,
  Archive,
  CheckCircle2,
} from 'lucide-react';

export interface SchoolDetailsModalProps {
  schoolId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const SchoolDetailsModal: React.FC<SchoolDetailsModalProps> = ({
  schoolId,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: school, isLoading, error, refetch } = useQuery({
    queryKey: ['schoolDetail', schoolId],
    queryFn: () => superAdminService.getSchoolById(schoolId!),
    enabled: !!schoolId && isOpen,
  });

  const handleStatusChange = async (newStatus: string) => {
    if (!schoolId) return;
    setIsProcessing(true);
    setActionFeedback(null);
    try {
      await superAdminService.updateSchoolStatus(schoolId, newStatus, `Super Admin manual toggle`);
      setActionFeedback(`Status updated to ${newStatus}`);
      refetch();
      onUpdate();
    } catch (err: any) {
      setActionFeedback(err.message || 'Status change failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResendInvite = async () => {
    if (!schoolId) return;
    setIsProcessing(true);
    setActionFeedback(null);
    try {
      const res = await superAdminService.resendSchoolInvitation(schoolId);
      setActionFeedback(`Activation invite generated! Token: ${res.data.token}`);
      onUpdate();
    } catch (err: any) {
      setActionFeedback(err.message || 'Invitation failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleArchive = async () => {
    if (!schoolId || !confirm('Are you sure you want to archive this school tenant?')) return;
    setIsProcessing(true);
    try {
      await superAdminService.archiveSchool(schoolId);
      setActionFeedback('School archived successfully');
      refetch();
      onUpdate();
    } catch (err: any) {
      setActionFeedback(err.message || 'Archive failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={school?.name || 'School Tenant Details'}
      description={`Unique Identifier: ${school?.schoolId || ''}`}
      maxWidth="3xl"
    >
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-16 w-full rounded-xl" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
        </div>
      ) : error || !school ? (
        <div className="text-center py-6 text-rose-600 text-xs">Failed to load school tenant.</div>
      ) : (
        <div className="space-y-6 text-xs">
          {actionFeedback && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionFeedback}</span>
            </div>
          )}

          {/* Header Card */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-brand-600 text-white font-bold text-lg flex items-center justify-center shadow-sm">
                {school.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{school.name}</h3>
                <div className="text-slate-500 flex items-center gap-2 mt-0.5">
                  <span className="font-mono">{school.schoolId}</span>
                  <span>•</span>
                  <span>{school.type}</span>
                  <span>•</span>
                  <span>{school.board}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  school.status === 'ACTIVE'
                    ? 'success'
                    : school.status === 'SUSPENDED'
                    ? 'danger'
                    : 'neutral'
                }
              >
                {school.status}
              </Badge>
            </div>
          </div>

          {/* Details Tabs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Contact & Location Profile */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] text-slate-400">
                Contact & Campus Profile
              </h4>
              <div className="flex items-start gap-2 text-slate-600">
                <Mail className="w-3.5 h-3.5 mt-0.5 text-slate-400" />
                <span>{school.profile?.officialEmail || 'No email'}</span>
              </div>
              <div className="flex items-start gap-2 text-slate-600">
                <Phone className="w-3.5 h-3.5 mt-0.5 text-slate-400" />
                <span>{school.profile?.primaryPhone || 'No phone'}</span>
              </div>
              <div className="flex items-start gap-2 text-slate-600">
                <MapPin className="w-3.5 h-3.5 mt-0.5 text-slate-400" />
                <span>
                  {school.profile?.address}, {school.profile?.city}, {school.profile?.state} -{' '}
                  {school.profile?.postalCode}
                </span>
              </div>
              <div className="flex items-start gap-2 text-slate-600">
                <Calendar className="w-3.5 h-3.5 mt-0.5 text-slate-400" />
                <span>Days: {school.profile?.workingDays || 'Mon-Fri'}</span>
              </div>
            </div>

            {/* Subscription & Resource Quotas */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] text-slate-400">
                Active Subscription & Quotas
              </h4>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-500">Plan Tier:</span>
                <span className="font-semibold text-brand-700">
                  {school.subscription?.plan?.name || 'No active plan'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-500">Cycle / Status:</span>
                <span>
                  {school.subscription?.billingCycle} ({school.subscription?.status})
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-500">Active Students:</span>
                <span className="font-semibold text-slate-800">
                  {school._count?.students || 0} /{' '}
                  {school.subscription?.maxStudentsOverride ||
                    school.subscription?.plan?.maxStudents ||
                    0}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">Teaching Staff:</span>
                <span className="font-semibold text-slate-800">
                  {school._count?.teachers || 0} /{' '}
                  {school.subscription?.maxTeachersOverride ||
                    school.subscription?.plan?.maxTeachers ||
                    0}
                </span>
              </div>
            </div>
          </div>

          {/* School Admin Account */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] text-slate-400">
              Institutional Admin Users
            </h4>
            {school.users && school.users.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {school.users.map((u: any) => (
                  <div key={u.id} className="py-2 flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-slate-800">{u.fullName}</div>
                      <div className="text-slate-500">{u.email}</div>
                    </div>
                    <div className="text-right">
                      <Badge variant="neutral">{u.role}</Badge>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {u.lastLoginAt
                          ? `Last login: ${new Date(u.lastLoginAt).toLocaleDateString()}`
                          : 'Pending first login'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-400">No admin assigned.</div>
            )}
          </div>

          {/* Administrative Control Actions */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {school.status === 'ACTIVE' ? (
                <Button
                  size="sm"
                  variant="danger"
                  isLoading={isProcessing}
                  onClick={() => handleStatusChange('SUSPENDED')}
                >
                  <ShieldAlert className="w-3.5 h-3.5 mr-1" /> Suspend School
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="primary"
                  isLoading={isProcessing}
                  onClick={() => handleStatusChange('ACTIVE')}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Activate School
                </Button>
              )}

              <Button
                size="sm"
                variant="outline"
                isLoading={isProcessing}
                onClick={handleResendInvite}
              >
                <Send className="w-3.5 h-3.5 mr-1" /> Re-send Activation
              </Button>
            </div>

            <Button
              size="sm"
              variant="ghost"
              className="text-rose-600 hover:bg-rose-50"
              isLoading={isProcessing}
              onClick={handleArchive}
            >
              <Archive className="w-3.5 h-3.5 mr-1" /> Archive Tenant
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
