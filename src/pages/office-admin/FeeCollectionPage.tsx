import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schoolPortalService } from '../../services/school-portal.service';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { CreditCard, Search, DollarSign, Receipt, Printer, CheckCircle2, AlertCircle } from 'lucide-react';

export const FeeCollectionPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isDefaulterFilter, setIsDefaulterFilter] = useState(false);
  const [selectedFee, setSelectedFee] = useState<any>(null);
  const [activeReceipt, setActiveReceipt] = useState<any>(null);

  const [collectForm, setCollectForm] = useState({
    amountPaid: '',
    paymentMethod: 'CASH',
    transactionRef: '',
    remarks: 'Counter payment received',
  });

  const { data: studentFees, isLoading } = useQuery({
    queryKey: ['office-student-fees', search, isDefaulterFilter],
    queryFn: () =>
      schoolPortalService.getStudentFees({
        search,
        isDefaulter: isDefaulterFilter,
      }),
  });

  const collectMutation = useMutation({
    mutationFn: (data: any) => schoolPortalService.collectFee(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['office-student-fees'] });
      queryClient.invalidateQueries({ queryKey: ['office-dashboard'] });
      setSelectedFee(null);
      // Open receipt viewer
      setActiveReceipt(result);
    },
  });

  const handleCollectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFee) return;

    collectMutation.mutate({
      studentFeeId: selectedFee.id,
      amountPaid: Number(collectForm.amountPaid),
      paymentMethod: collectForm.paymentMethod,
      transactionRef: collectForm.transactionRef || undefined,
      remarks: collectForm.remarks,
    });
  };

  const openCollectModal = (fee: any) => {
    setSelectedFee(fee);
    setCollectForm({
      amountPaid: fee.balanceAmount ? String(fee.balanceAmount) : '',
      paymentMethod: 'CASH',
      transactionRef: '',
      remarks: 'Counter fee collection',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" /> Student Fee Counter &amp; Collection
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Collect school fees, issue official numbered receipts, and manage outstanding dues &amp; defaulters
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, student code (STU-...), or admission #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <button
          onClick={() => setIsDefaulterFilter(!isDefaulterFilter)}
          className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
            isDefaulterFilter
              ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-sm'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          {isDefaulterFilter ? 'Showing Defaulters Only' : 'Show All Accounts'}
        </button>
      </Card>

      {/* Fees List Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : studentFees && studentFees.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-3 px-4 font-semibold">Student Code</th>
                  <th className="py-3 px-4 font-semibold">Student Name</th>
                  <th className="py-3 px-4 font-semibold">Class</th>
                  <th className="py-3 px-4 font-semibold">Fee Category</th>
                  <th className="py-3 px-4 font-semibold">Total Fee</th>
                  <th className="py-3 px-4 font-semibold">Amount Paid</th>
                  <th className="py-3 px-4 font-semibold">Remaining Balance</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Counter Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentFees.map((fee: any) => (
                  <tr key={fee.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-medium text-emerald-700">
                      {fee.student?.studentCode}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {fee.student?.firstName} {fee.student?.lastName}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {fee.student?.class?.name} ({fee.student?.section?.name})
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {fee.feeStructure?.category?.name || 'Tuition Fee'}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      ₹{fee.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-semibold text-emerald-600">
                      ₹{fee.paidAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-rose-600">
                      ₹{fee.balanceAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        fee.status === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800'
                          : fee.status === 'PARTIAL'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {fee.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {fee.balanceAmount > 0 ? (
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 px-2.5 text-xs"
                          onClick={() => openCollectModal(fee)}
                        >
                          <DollarSign className="w-3.5 h-3.5 mr-0.5" /> Collect Fee
                        </Button>
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-medium">Cleared</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs">No student fee records found.</div>
        )}
      </Card>

      {/* Collect Fee Modal */}
      {selectedFee && (
        <Modal
          isOpen={!!selectedFee}
          onClose={() => setSelectedFee(null)}
          title={`Collect Fee: ${selectedFee.student?.firstName} ${selectedFee.student?.lastName}`}
        >
          <form onSubmit={handleCollectSubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center text-xs text-slate-600">
                <span>Fee Category:</span>
                <strong className="text-slate-900">{selectedFee.feeStructure?.category?.name}</strong>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-600 mt-1">
                <span>Total Fee Obligation:</span>
                <span>₹{selectedFee.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-600 mt-1">
                <span>Already Paid:</span>
                <span className="text-emerald-600 font-semibold">₹{selectedFee.paidAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold text-rose-600 mt-2 pt-2 border-t border-slate-200">
                <span>Outstanding Balance:</span>
                <span>₹{selectedFee.balanceAmount.toLocaleString()}</span>
              </div>
            </div>

            <Input
              label="Amount Paid at Counter (₹)"
              type="number"
              required
              value={collectForm.amountPaid}
              onChange={(e) => setCollectForm({ ...collectForm, amountPaid: e.target.value })}
              placeholder="e.g. 15000"
            />

            <div>
              <label className="block text-slate-700 font-medium mb-1">Payment Method</label>
              <select
                value={collectForm.paymentMethod}
                onChange={(e) => setCollectForm({ ...collectForm, paymentMethod: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
              >
                <option value="CASH">Cash Payment</option>
                <option value="UPI">UPI / Digital QR</option>
                <option value="CARD">Debit / Credit Card</option>
                <option value="CHEQUE">Cheque</option>
                <option value="BANK_TRANSFER">Direct Bank Transfer</option>
              </select>
            </div>

            <Input
              label="Transaction Reference / Cheque #"
              value={collectForm.transactionRef}
              onChange={(e) => setCollectForm({ ...collectForm, transactionRef: e.target.value })}
              placeholder="Optional reference number"
            />

            <Input
              label="Receipt Notes / Remarks"
              value={collectForm.remarks}
              onChange={(e) => setCollectForm({ ...collectForm, remarks: e.target.value })}
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setSelectedFee(null)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={collectMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700">
                Process Payment &amp; Issue Receipt
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Official Receipt Viewer Modal */}
      {activeReceipt && (
        <Modal
          isOpen={!!activeReceipt}
          onClose={() => setActiveReceipt(null)}
          title="Official Fee Receipt Generated"
          maxWidth="md"
        >
          <div className="p-5 border border-slate-200 rounded-2xl bg-white shadow-sm space-y-4 text-xs font-sans">
            {/* School Header */}
            <div className="text-center pb-4 border-b border-slate-200">
              <div className="text-base font-bold text-slate-900 uppercase tracking-wide">
                Oakridge International Academy
              </div>
              <div className="text-[11px] text-slate-500">
                42 Academic Boulevard, Knowledge Park, Mumbai &middot; CBSE Affiliated
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-1 font-semibold text-emerald-700">
                OFFICIAL PAYMENT RECEIPT
              </div>
            </div>

            <div className="flex justify-between items-center font-mono text-[11px] text-slate-600">
              <div>Receipt No: <strong className="text-slate-900">{activeReceipt.receiptNumber}</strong></div>
              <div>Date: {new Date().toLocaleDateString()}</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-slate-700">
              <div className="flex justify-between">
                <span>Student Name:</span>
                <strong className="text-slate-900">{activeReceipt.student?.firstName} {activeReceipt.student?.lastName}</strong>
              </div>
              <div className="flex justify-between">
                <span>Student Code:</span>
                <span className="font-mono">{activeReceipt.student?.studentCode}</span>
              </div>
              <div className="flex justify-between">
                <span>Fee Category:</span>
                <span>{activeReceipt.feeCategory}</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80 flex justify-between items-center text-sm">
              <span className="font-bold text-emerald-950">Amount Received:</span>
              <span className="font-bold text-emerald-700 text-base">₹{activeReceipt.amountPaid?.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>Remaining Account Balance:</span>
              <span className="font-semibold text-rose-600">₹{activeReceipt.remainingBalance?.toLocaleString()}</span>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-between items-end text-[10px] text-slate-400">
              <div>Authorized Institutional Counter Seal</div>
              <div className="text-right">Cashier Signature Verified</div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => window.print()} className="flex items-center gap-1.5 text-xs">
              <Printer className="w-3.5 h-3.5" /> Print Receipt
            </Button>
            <Button onClick={() => setActiveReceipt(null)} className="text-xs">
              Done
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
