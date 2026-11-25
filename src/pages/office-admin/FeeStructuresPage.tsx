import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schoolPortalService } from '../../services/school-portal.service';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { FileSpreadsheet, Plus, CreditCard } from 'lucide-react';

export const FeeStructuresPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    categoryId: '',
    classId: '',
    amount: '',
    frequency: 'ANNUAL',
    dueDate: '2026-06-30',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['office-fee-structures'],
    queryFn: () => schoolPortalService.getFeeStructures(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => schoolPortalService.createFeeStructure(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['office-fee-structures'] });
      setIsModalOpen(false);
      setForm({
        categoryId: '',
        classId: '',
        amount: '',
        frequency: 'ANNUAL',
        dueDate: '2026-06-30',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  const structures = data?.structures || [];
  const categories = data?.categories || [];
  const classes = data?.classes || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" /> Fee Schedules &amp; Institutional Structures
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Define tuition, laboratory, library, and transportation fee amounts per grade level and academic term
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4" /> Create Fee Schedule
        </Button>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        ) : structures.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-3 px-4 font-semibold">Fee Category</th>
                  <th className="py-3 px-4 font-semibold">Academic Class</th>
                  <th className="py-3 px-4 font-semibold">Billing Frequency</th>
                  <th className="py-3 px-4 font-semibold">Due Date</th>
                  <th className="py-3 px-4 font-semibold">Enrolled Accounts</th>
                  <th className="py-3 px-4 font-semibold text-right">Scheduled Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {structures.map((s: any) => (
                  <tr key={s.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {s.category?.name}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {s.class?.name}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {s.frequency}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {new Date(s.dueDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {s._count?.studentFees || 0} students assigned
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      ₹{s.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs">No fee structures defined yet.</div>
        )}
      </Card>

      {/* Create Fee Structure Modal */}
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Configure New Fee Schedule">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Fee Category</label>
                <select
                  required
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Target Class</label>
                <select
                  required
                  value={form.classId}
                  onChange={(e) => setForm({ ...form, classId: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select Class</option>
                  {classes.map((cls: any) => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Fee Amount (₹)"
                type="number"
                required
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="e.g. 25000"
              />

              <div>
                <label className="block text-slate-700 font-medium mb-1">Billing Frequency</label>
                <select
                  value={form.frequency}
                  onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs"
                >
                  <option value="ANNUAL">Annual Fee</option>
                  <option value="TERMWISE">Term-wise (Bi-Annual)</option>
                  <option value="MONTHLY">Monthly Recurring</option>
                </select>
              </div>
            </div>

            <Input
              label="Payment Due Date"
              type="date"
              required
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={createMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700">
                Create Schedule
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
