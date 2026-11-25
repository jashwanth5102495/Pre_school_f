import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { superAdminService } from '../../services/super-admin.service';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { ShieldCheck, Search, ChevronLeft, ChevronRight, Terminal } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState('');
  const [targetType, setTargetType] = useState('');
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const { data: auditResponse, isLoading } = useQuery({
    queryKey: ['auditLogsList', page, action, targetType],
    queryFn: () =>
      superAdminService.listAuditLogs({
        page,
        limit: 15,
        action: action || undefined,
        targetType: targetType || undefined,
      }),
  });

  const logs = auditResponse?.data || [];
  const meta = auditResponse?.meta || { total: 0, totalPages: 1 };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Platform Security & Audit Trail</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable, append-only security logs recording all critical platform events, tenant mutations, and administrative logins
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl border border-slate-200/80 bg-white flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setPage(1);
            }}
            placeholder="Search action (e.g. SCHOOL, LOGIN)..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={targetType}
            onChange={(e) => {
              setTargetType(e.target.value);
              setPage(1);
            }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="">All Target Types</option>
            <option value="SCHOOL">School</option>
            <option value="SUBSCRIPTION">Subscription</option>
            <option value="PLATFORM_USER">Platform User</option>
            <option value="NOTIFICATION">Notification</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-full rounded-md" />
            ))}
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Action</TableHead>
                  <TableHead>Actor Email</TableHead>
                  <TableHead>Actor Role</TableHead>
                  <TableHead>Target Entity</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Timestamp (Local)</TableHead>
                  <TableHead className="text-right">Payload</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log: any) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <span className="font-mono text-xs font-semibold text-slate-900">
                        {log.action}
                      </span>
                    </TableCell>

                    <TableCell className="text-xs text-slate-700">{log.actorEmail}</TableCell>

                    <TableCell>
                      <Badge variant="neutral">{log.actorType}</Badge>
                    </TableCell>

                    <TableCell className="text-xs text-slate-600">
                      <span className="font-semibold">{log.targetType}</span>
                      {log.targetId && (
                        <span className="text-[10px] text-slate-400 font-mono block">
                          {log.targetId.slice(0, 12)}...
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="font-mono text-[11px] text-slate-400">
                      {log.ipAddress || '127.0.0.1'}
                    </TableCell>

                    <TableCell className="text-xs text-slate-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </TableCell>

                    <TableCell className="text-right">
                      {log.metadata && Object.keys(log.metadata).length > 0 ? (
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="text-[11px] font-mono text-brand-600 hover:text-brand-800 underline"
                        >
                          View JSON
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div>
                Page <strong className="text-slate-800">{page}</strong> of{' '}
                <strong className="text-slate-800">{meta.totalPages}</strong> ({meta.total} Audit Entries)
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* JSON Viewer Dialog */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-brand-600" />
                Audit Metadata: {selectedLog.action}
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                Close
              </button>
            </div>
            <pre className="p-3 rounded-lg bg-slate-950 text-emerald-400 font-mono text-xs overflow-auto max-h-72">
              {JSON.stringify(selectedLog.metadata, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
