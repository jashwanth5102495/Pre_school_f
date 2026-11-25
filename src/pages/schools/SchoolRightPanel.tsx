import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { superAdminService } from '../../services/super-admin.service';
import { hierarchyService } from '../../services/hierarchy.service';
import { HierarchyTreeGraph } from '../../components/hierarchy/HierarchyTreeGraph';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  Building2,
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  Repeat,
  CheckCircle2,
  RefreshCw,
  Send,
  ShieldCheck,
  Network,
  Info,
  Trash2,
} from 'lucide-react';

interface SchoolRightPanelProps {
  schoolId: string;
  onClose: () => void;
  onUpdate: () => void;
}

export const SchoolRightPanel: React.FC<SchoolRightPanelProps> = ({
  schoolId,
  onClose,
  onUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<'TREE' | 'PROFILE'>('TREE');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch school details
  const {
    data: school,
    isLoading: isSchoolLoading,
    refetch: refetchSchool,
  } = useQuery({
    queryKey: ['schoolDetail', schoolId],
    queryFn: () => superAdminService.getSchoolById(schoolId),
    enabled: !!schoolId,
  });

  // Fetch school hierarchy tree
  const {
    data: treeData,
    isLoading: isTreeLoading,
    refetch: refetchTree,
  } = useQuery({
    queryKey: ['hierarchyTree', schoolId],
    queryFn: () => hierarchyService.getTree(schoolId),
    enabled: !!schoolId,
  });

  const queryClient = useQueryClient();

  const handleDeleteSchool = async () => {
    if (!confirm(`Are you sure you want to permanently delete "${school?.name || 'this school'}"? All students, teachers, classes, and records will be deleted.`)) return;
    setIsProcessing(true);
    try {
      await superAdminService.deleteSchool(schoolId);
      queryClient.invalidateQueries({ queryKey: ['schoolsList'] });
      onUpdate();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || err.message || 'Failed to delete school');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setIsProcessing(true);
    setActionFeedback(null);
    try {
      await superAdminService.updateSchoolStatus(schoolId, newStatus, 'Super Admin on-screen toggle');
      setActionFeedback(`Status updated to ${newStatus}`);
      refetchSchool();
      refetchTree();
      onUpdate();
    } catch (err: any) {
      setActionFeedback(err.message || 'Status change failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResendInvite = async () => {
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

  if (isSchoolLoading && !school) {
    return (
      <div className="w-full lg:w-[48%] xl:w-[50%] rounded-2xl border border-slate-200 dark:border-[#383838] bg-white dark:bg-[#262626] p-6 space-y-4">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="w-full lg:w-[48%] xl:w-[52%] rounded-2xl border border-slate-200 dark:border-[#383838] bg-white dark:bg-[#242424] shadow-sm flex flex-col shrink-0 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-200">
      {/* Top Header */}
      <div className="p-5 border-b border-slate-100 dark:border-[#383838] flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-[#202020]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#eb4438] to-[#b8281d] text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
            {school?.name?.charAt(0) || 'S'}
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">
              {school?.name}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-mono text-brand-600 font-semibold">{school?.schoolId}</span>
              <span>•</span>
              <span>{school?.code}</span>
              <span>•</span>
              <span>{school?.board}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={school?.status === 'ACTIVE' ? 'success' : 'neutral'}>
            {school?.status}
          </Badge>
          <button
            type="button"
            onClick={handleDeleteSchool}
            disabled={isProcessing}
            className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
            title="Permanently Delete School"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-[#333333] transition-colors"
            title="Close on-screen panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-1 px-5 pt-3 border-b border-slate-100 dark:border-[#383838]">
        <button
          type="button"
          onClick={() => setActiveTab('TREE')}
          className={`pb-2.5 px-3 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'TREE'
              ? 'border-[#eb4438] text-[#eb4438]'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <Network className="w-4 h-4" />
          <span>Hierarchy & Roles Tree</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('PROFILE')}
          className={`pb-2.5 px-3 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'PROFILE'
              ? 'border-[#eb4438] text-[#eb4438]'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>School Profile & Settings</span>
        </button>
      </div>

      {/* Feedback banner */}
      {actionFeedback && (
        <div className="m-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-700 dark:text-blue-300 flex items-center justify-between">
          <span>{actionFeedback}</span>
          <button
            type="button"
            onClick={() => setActionFeedback(null)}
            className="text-xs font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Body Content */}
      <div className="flex-1 p-5 overflow-y-auto">
        {activeTab === 'TREE' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Roles & Team Hierarchy
                </h3>
                <p className="text-[11px] text-slate-400">
                  Add and set profiles for Principal, Academic, Finance, Faculty & Students
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => refetchTree()}
                className="text-xs h-7.5 px-2"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh
              </Button>
            </div>

            {isTreeLoading ? (
              <div className="p-6 space-y-3">
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-40 w-full rounded-xl" />
              </div>
            ) : (
              <HierarchyTreeGraph
                data={treeData}
                onRefresh={() => {
                  refetchTree();
                  onUpdate();
                }}
                selectedSchoolId={schoolId}
              />
            )}
          </div>
        ) : (
          /* Profile & Settings Tab */
          <div className="space-y-5">
            {/* Contact Details */}
            <div className="p-4 rounded-xl border border-slate-100 dark:border-[#383838] bg-slate-50/60 dark:bg-[#1f1f1f] space-y-2.5">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Institutional Contact
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{school?.profile?.officialEmail || 'No official email'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{school?.profile?.primaryPhone || 'No phone'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 sm:col-span-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">
                    {school?.profile?.address || ''}, {school?.profile?.city || ''},{' '}
                    {school?.profile?.state || ''} {school?.profile?.postalCode || ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Subscription & Quota */}
            <div className="p-4 rounded-xl border border-slate-100 dark:border-[#383838] bg-slate-50/60 dark:bg-[#1f1f1f] space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  SaaS Subscription Tier
                </h4>
                <Badge variant="brand">{school?.subscription?.plan?.name || 'Standard'}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-slate-400 text-[11px]">Enrolled Students</div>
                  <div className="font-bold text-slate-800 dark:text-white">
                    {school?._count?.students || 0} / {school?.subscription?.maxStudents || 500}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-[11px]">Faculty Capacity</div>
                  <div className="font-bold text-slate-800 dark:text-white">
                    {school?._count?.teachers || 0} / {school?.subscription?.maxTeachers || 50}
                  </div>
                </div>
              </div>
            </div>

            {/* School Management Controls */}
            <div className="pt-2 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={isProcessing}
                onClick={handleResendInvite}
                className="text-xs"
              >
                <Send className="w-3.5 h-3.5 mr-1" /> Resend Activation Invite
              </Button>

              {school?.status === 'ACTIVE' ? (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isProcessing}
                  onClick={() => handleStatusChange('SUSPENDED')}
                  className="text-xs text-amber-600 border-amber-200 hover:bg-amber-50"
                >
                  Suspend School
                </Button>
              ) : (
                <Button
                  size="sm"
                  disabled={isProcessing}
                  onClick={() => handleStatusChange('ACTIVE')}
                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Activate School
                </Button>
              )}

              <Button
                size="sm"
                variant="outline"
                disabled={isProcessing}
                onClick={handleDeleteSchool}
                className="text-xs text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/40"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete School
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchoolRightPanel;
