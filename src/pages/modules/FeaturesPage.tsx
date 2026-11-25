import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { superAdminService } from '../../services/super-admin.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { FeatureOverrideModal } from './FeatureOverrideModal';
import { Grid, Sliders, CheckCircle2, Shield, Settings2 } from 'lucide-react';

export const FeaturesPage: React.FC = () => {
  const [selectedFeature, setSelectedFeature] = useState<any | null>(null);

  const { data: features = [], isLoading, refetch } = useQuery({
    queryKey: ['featuresCatalog'],
    queryFn: () => superAdminService.listFeatures(),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Platform Modules & Features</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Granular capability matrix, subscription plan assignments, and school-specific exception rules
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feat: any) => (
            <Card key={feat.id} className="flex flex-col justify-between">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant="neutral">{feat.category}</Badge>
                  <span className="font-mono text-[10px] text-slate-400">{feat.code}</span>
                </div>
                <CardTitle className="text-sm mt-1.5">{feat.name}</CardTitle>
                <CardDescription className="text-xs">{feat.description}</CardDescription>
              </CardHeader>

              <CardContent className="p-4 pt-2">
                {/* Active overrides list */}
                {feat.schoolOverrides && feat.schoolOverrides.length > 0 ? (
                  <div className="my-2 p-2 rounded-lg bg-amber-50/60 border border-amber-200/60 text-[11px] text-amber-900">
                    <span className="font-semibold">Active Exceptions ({feat.schoolOverrides.length}):</span>
                    <div className="truncate text-slate-600 mt-0.5">
                      {feat.schoolOverrides.map((o: any) => o.school.name).join(', ')}
                    </div>
                  </div>
                ) : (
                  <div className="my-2 text-[11px] text-slate-400">Default plan entitlements apply</div>
                )}

                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedFeature(feat)}
                    className="text-xs"
                  >
                    <Sliders className="w-3.5 h-3.5 mr-1 text-brand-600" /> Configure Exception
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Feature Override Modal */}
      <FeatureOverrideModal
        feature={selectedFeature}
        isOpen={!!selectedFeature}
        onClose={() => setSelectedFeature(null)}
        onSuccess={() => refetch()}
      />
    </div>
  );
};
