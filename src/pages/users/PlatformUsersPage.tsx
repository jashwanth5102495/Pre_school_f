import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { superAdminService } from '../../services/super-admin.service';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { CreateUserModal } from './CreateUserModal';
import { Users, Plus, Shield, CheckCircle2, ShieldAlert } from 'lucide-react';

export const PlatformUsersPage: React.FC = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ['platformUsersList'],
    queryFn: () => superAdminService.listPlatformUsers(),
  });

  const toggleStatus = async (user: any) => {
    const nextStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await superAdminService.updatePlatformUserStatus(user.id, nextStatus);
      refetch();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Platform Users & RBAC</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Internal company staff management across Super Admin, Support, and Finance roles
          </p>
        </div>
        <Button size="sm" onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> Add Platform User
        </Button>
      </div>

      <div className="rounded-xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-md" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Member</TableHead>
                <TableHead>Platform Role</TableHead>
                <TableHead>Contact Phone</TableHead>
                <TableHead>Account Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u: any) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center">
                        {u.fullName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 text-xs">{u.fullName}</div>
                        <div className="text-[11px] text-slate-500">{u.email}</div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant={u.role === 'SUPER_ADMIN' ? 'brand' : 'neutral'}>
                      {u.role.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-xs text-slate-600">{u.phone || 'N/A'}</TableCell>

                  <TableCell>
                    <Badge variant={u.status === 'ACTIVE' ? 'success' : 'danger'}>{u.status}</Badge>
                  </TableCell>

                  <TableCell className="text-xs text-slate-500">
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Never'}
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleStatus(u)}
                      className={u.status === 'ACTIVE' ? 'text-rose-600' : 'text-emerald-600'}
                    >
                      {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <CreateUserModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => refetch()}
      />
    </div>
  );
};
