import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { schoolPortalService } from '../../services/school-portal.service';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { Layers, BookOpen, Users, Hash } from 'lucide-react';

export const SchoolClassesPage: React.FC = () => {
  const { data: classes, isLoading } = useQuery({
    queryKey: ['school-classes'],
    queryFn: () => schoolPortalService.getClasses(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-600" /> Academic Classes &amp; Sections
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Configured grade levels, class sections, capacity, student enrollment and linked curriculum subjects
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {classes?.map((cls: any) => (
            <Card key={cls.id} className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                      <Hash className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{cls.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Code: {cls.code}</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                    {cls._count?.students || 0} Students
                  </span>
                </div>

                {/* Sections list */}
                <div className="mt-4 space-y-2">
                  <div className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" /> Sections &amp; Capacity
                  </div>
                  <div className="space-y-1.5">
                    {cls.sections?.map((sec: any) => (
                      <div
                        key={sec.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200/60 text-xs"
                      >
                        <span className="font-semibold text-slate-800">{sec.name}</span>
                        <span className="text-[11px] text-slate-500">
                          {sec._count?.students || 0} / {sec.capacity} seats filled
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Linked Subjects */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5 mb-2">
                    <BookOpen className="w-3.5 h-3.5 text-blue-500" /> Curriculum Subjects:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {cls.classSubjects && cls.classSubjects.length > 0 ? (
                      cls.classSubjects.map((cs: any) => (
                        <span
                          key={cs.id}
                          className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium"
                        >
                          {cs.subject?.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-400">Core Curriculum</span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
