import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { hierarchyService } from '../../services/hierarchy.service';
import { HierarchyTreeGraph } from '../../components/hierarchy/HierarchyTreeGraph';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { useAuthStore } from '../../store/auth.store';
import {
  Network,
  RefreshCw,
  School,
  Users,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const OrganizationTreePage: React.FC = () => {
  const { user } = useAuthStore();
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | undefined>(undefined);

  const {
    data,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['hierarchyTree', selectedSchoolId],
    queryFn: () => hierarchyService.getTree(selectedSchoolId),
  });

  const school = data?.school;
  const isSuperAdmin = user?.userType === 'PLATFORM';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#eb4438]/10 text-[#eb4438] flex items-center justify-center font-bold">
              <Network className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Institutional Hierarchy Tree
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Visual organization flowchart connecting Institutional Leadership, Academic Director,
            Finance, Faculty, and Students in live sync.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isFetching ? 'animate-spin' : ''}`} />
            Sync Now
          </Button>
        </div>
      </div>

      {/* Overview Stat Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-[#383838] bg-white dark:bg-[#262626] flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center shrink-0">
            <School className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Leadership</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {data?.principals?.length || 0} Principal
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-[#383838] bg-white dark:bg-[#262626] flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Academic & Finance</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {(data?.academics?.length || 0) + (data?.finances?.length || 0)} Directors
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-[#383838] bg-white dark:bg-[#262626] flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Teaching Faculty</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {data?.teachers?.length || 0} Faculty
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-[#383838] bg-white dark:bg-[#262626] flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Enrolled Students</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {data?.students?.length || 0} Students
            </div>
          </div>
        </div>
      </div>

      {/* Main Graph Component */}
      {isLoading ? (
        <div className="p-8 space-y-4 rounded-2xl border border-slate-200 dark:border-[#383838] bg-white dark:bg-[#262626]">
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      ) : (
        <HierarchyTreeGraph
          data={data}
          onRefresh={refetch}
          selectedSchoolId={selectedSchoolId}
          onSelectSchool={(id) => setSelectedSchoolId(id)}
        />
      )}
    </div>
  );
};

export default OrganizationTreePage;
