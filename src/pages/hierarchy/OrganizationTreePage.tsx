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
  Layers,
  BarChart2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const OrganizationTreePage: React.FC = () => {
  const { user } = useAuthStore();
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | undefined>(undefined);
  const [showStats, setShowStats] = useState(false);

  const {
    data,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['hierarchyTree', selectedSchoolId],
    queryFn: () => hierarchyService.getTree(selectedSchoolId),
  });

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-[#141414]">
      {/* ========================================================================= */}
      {/* SLIM TOP HEADER (EXACTLY MATCHING ATTACHED REFERENCE IMAGE)               */}
      {/* ========================================================================= */}
      <div className="h-14 bg-[#1a1a1a] border-b border-[#2e2e2e] px-4 sm:px-6 flex items-center justify-between shrink-0 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#eb4438]/15 text-[#eb4438] border border-[#eb4438]/30 flex items-center justify-center font-bold shrink-0">
            <Network className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-2 min-w-0">
            <h1 className="text-sm font-bold tracking-tight text-white whitespace-nowrap">
              Institutional Hierarchy Tree
            </h1>
            <span className="text-slate-600 hidden md:inline">|</span>
            <p className="text-xs text-slate-400 truncate hidden md:inline">
              Visual organization flowchart connecting Institutional Leadership, Academic, Director,
              Finance, Faculty, and Students in live sync.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowStats((v) => !v)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#383838] bg-[#222222] text-slate-300 hover:text-white hover:bg-[#2c2c2c] text-xs transition-colors cursor-pointer"
            title="Toggle summary statistics"
          >
            <BarChart2 className="w-3.5 h-3.5 text-[#eb4438]" />
            <span className="hidden sm:inline">Stats</span>
            {showStats ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-xs border-[#383838] bg-[#222222] text-slate-200 hover:text-white hover:bg-[#2c2c2c] h-8"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isFetching ? 'animate-spin' : ''}`} />
            Sync Now
          </Button>
        </div>
      </div>

      {/* Optional Collapsible Stats Drawer */}
      {showStats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 p-3 bg-[#181818] border-b border-[#2e2e2e] shrink-0 animate-in slide-in-from-top-2 duration-150">
          <div className="p-2.5 rounded-xl border border-[#333333] bg-[#202020] flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-950/60 text-blue-400 flex items-center justify-center shrink-0">
              <School className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-slate-400 font-medium">Leadership</div>
              <div className="text-xs font-bold text-white truncate">
                {data?.principals?.length || 0} Principal
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl border border-[#333333] bg-[#202020] flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/60 text-emerald-400 flex items-center justify-center shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-slate-400 font-medium">Academic & Finance</div>
              <div className="text-xs font-bold text-white truncate">
                {(data?.academics?.length || 0) + (data?.finances?.length || 0)} Directors
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl border border-[#333333] bg-[#202020] flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/60 text-cyan-400 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-slate-400 font-medium">Classes</div>
              <div className="text-xs font-bold text-white truncate">
                {data?.classes?.length || 0} Classes
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl border border-[#333333] bg-[#202020] flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-950/60 text-rose-400 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-slate-400 font-medium">Faculty</div>
              <div className="text-xs font-bold text-white truncate">
                {data?.teachers?.length || 0} Faculty
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl border border-[#333333] bg-[#202020] flex items-center gap-2.5 col-span-2 sm:col-span-1">
            <div className="w-8 h-8 rounded-lg bg-indigo-950/60 text-indigo-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-slate-400 font-medium">Students</div>
              <div className="text-xs font-bold text-white truncate">
                {data?.students?.length || 0} Students
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EXPANSIVE FULLSCREEN VIEWPORT CANVAS (Fills 100% remaining screen space)  */}
      {/* ========================================================================= */}
      <div className="flex-1 w-full h-full min-h-0 relative overflow-hidden">
        {isLoading ? (
          <div className="w-full h-full p-8 space-y-4 bg-[#141414] flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-[#eb4438]/20 text-[#eb4438] flex items-center justify-center animate-pulse">
              <Network className="w-6 h-6 animate-spin" />
            </div>
            <p className="text-xs text-slate-400 font-medium">Loading institutional hierarchy map...</p>
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
    </div>
  );
};

export default OrganizationTreePage;
