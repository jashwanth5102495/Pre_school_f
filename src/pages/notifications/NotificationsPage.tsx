import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { superAdminService } from '../../services/super-admin.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { CreateNotificationModal } from './CreateNotificationModal';
import { Bell, Send, Megaphone, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: notifications = [], isLoading, refetch } = useQuery({
    queryKey: ['notificationsHistory'],
    queryFn: () => superAdminService.listNotifications(),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Platform Announcements</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Broadcast emergency alerts, maintenance windows, and policy circulars to tenant portals
          </p>
        </div>
        <Button size="sm" onClick={() => setIsCreateOpen(true)}>
          <Megaphone className="w-4 h-4 mr-1.5" /> Broadcast Announcement
        </Button>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          [1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
        ) : notifications.length === 0 ? (
          <div className="p-10 rounded-xl border border-dashed border-slate-200 bg-white text-center">
            <Bell className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-800">No Announcements Dispatched</h3>
            <p className="text-xs text-slate-500 mt-1">Compose your first platform broadcast above.</p>
          </div>
        ) : (
          notifications.map((notif: any) => (
            <Card key={notif.id} className="overflow-hidden">
              <div className="p-4 flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    notif.severity === 'URGENT'
                      ? 'bg-rose-50 text-rose-600'
                      : notif.severity === 'WARNING'
                      ? 'bg-amber-50 text-amber-600'
                      : 'bg-indigo-50 text-indigo-600'
                  }`}
                >
                  {notif.severity === 'URGENT' || notif.severity === 'WARNING' ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : (
                    <Info className="w-4 h-4" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-slate-900">{notif.title}</h3>
                    <Badge
                      variant={
                        notif.severity === 'URGENT'
                          ? 'danger'
                          : notif.severity === 'WARNING'
                          ? 'warning'
                          : 'brand'
                      }
                    >
                      {notif.severity}
                    </Badge>
                    <Badge variant="neutral">{notif.targetType}</Badge>
                  </div>

                  <p className="text-xs text-slate-600 mt-1 whitespace-pre-wrap">{notif.message}</p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                    <span>Dispatched: {new Date(notif.createdAt).toLocaleString()}</span>
                    <span>•</span>
                    <span>Channels: {notif.channels}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <CreateNotificationModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => refetch()}
      />
    </div>
  );
};
