import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { superAdminService } from '../../services/super-admin.service';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import {
  Receipt,
  CreditCard,
  Search,
  FileText,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Download,
} from 'lucide-react';

export const PaymentsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'payments' | 'invoices'>('payments');
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  const { data: paymentsRes, isLoading: isPaymentsLoading } = useQuery({
    queryKey: ['paymentsList'],
    queryFn: () => superAdminService.listPayments(),
  });

  const { data: invoicesRes, isLoading: isInvoicesLoading } = useQuery({
    queryKey: ['invoicesList'],
    queryFn: () => superAdminService.listInvoices(),
  });

  const payments = paymentsRes?.data || [];
  const invoices = invoicesRes?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Billing & Payment Transactions</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit gateway payment orders, webhooks, transaction settlement, and official GST tax invoices
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('payments')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'payments'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" /> Transactions & Gateway Logs ({payments.length})
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'invoices'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Receipt className="w-4 h-4" /> Generated Tax Invoices ({invoices.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'payments' ? (
        <div className="rounded-xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
          {isPaymentsLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-md" />
              ))}
            </div>
          ) : payments.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="No payment records found"
              description="Transactions recorded via Razorpay sandbox or manual settlement will appear here."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>School Tenant</TableHead>
                  <TableHead>Gateway Provider</TableHead>
                  <TableHead>Order ID / Payment ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Settled At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs font-bold text-slate-900">
                      {p.transactionId}
                    </TableCell>

                    <TableCell>
                      <div className="font-semibold text-slate-800 text-xs">{p.school.name}</div>
                      <div className="text-[11px] font-mono text-slate-400">{p.school.schoolId}</div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="brand">{p.paymentProvider}</Badge>
                    </TableCell>

                    <TableCell className="text-xs font-mono text-slate-500">
                      {p.razorpayPaymentId || p.orderId || 'N/A'}
                    </TableCell>

                    <TableCell className="text-xs font-bold text-slate-900">
                      ₹{p.amount.toLocaleString()}
                    </TableCell>

                    <TableCell className="text-xs text-slate-600">{p.paymentMethod || 'Online'}</TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          p.status === 'COMPLETED'
                            ? 'success'
                            : p.status === 'FAILED'
                            ? 'danger'
                            : 'warning'
                        }
                      >
                        {p.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-xs text-slate-500">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
          {isInvoicesLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-md" />
              ))}
            </div>
          ) : invoices.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No invoices generated yet"
              description="Official invoices issued upon subscription renewal or initial provisioning will appear here."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice Number</TableHead>
                  <TableHead>School Tenant</TableHead>
                  <TableHead>Base Subtotal</TableHead>
                  <TableHead>GST (18%)</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Receipt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv: any) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-mono text-xs font-bold text-brand-700">
                      {inv.invoiceNumber}
                    </TableCell>

                    <TableCell>
                      <div className="font-semibold text-slate-800 text-xs">{inv.school.name}</div>
                      <div className="text-[11px] font-mono text-slate-400">{inv.school.schoolId}</div>
                    </TableCell>

                    <TableCell className="text-xs text-slate-600">
                      ₹{inv.amount.toLocaleString()}
                    </TableCell>

                    <TableCell className="text-xs text-slate-500">
                      ₹{inv.tax.toLocaleString()}
                    </TableCell>

                    <TableCell className="text-xs font-bold text-slate-900">
                      ₹{inv.totalAmount.toLocaleString()}
                    </TableCell>

                    <TableCell className="text-xs text-slate-500">
                      {new Date(inv.dueDate).toLocaleDateString()}
                    </TableCell>

                    <TableCell>
                      <Badge variant={inv.status === 'PAID' ? 'success' : 'neutral'}>
                        {inv.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedInvoice(inv)}
                      >
                        <FileText className="w-3.5 h-3.5 mr-1" /> View Receipt
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          title={`Official Invoice: ${selectedInvoice.invoiceNumber}`}
          description={`Issued to ${selectedInvoice.school.name} (${selectedInvoice.school.schoolId})`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
              <div>
                <div className="font-bold text-slate-900 text-sm">BluNet IT Services Private Ltd. (Smart Edu)</div>
                <div className="text-slate-500">GSTIN: 27AABCE1234F1Z8</div>
              </div>
              <Badge variant="success">PAID</Badge>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Line Item Description</TableHead>
                    <TableHead className="text-right">Amount (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(selectedInvoice.lineItems) ? (
                    selectedInvoice.lineItems.map((item: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-right font-medium">
                          ₹{Number(item.total || item.amount).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell>Institutional Subscription Service</TableCell>
                      <TableCell className="text-right">₹{selectedInvoice.amount.toLocaleString()}</TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell className="font-semibold text-slate-700">Goods & Services Tax (18%)</TableCell>
                    <TableCell className="text-right font-semibold">₹{selectedInvoice.tax.toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow className="bg-slate-50/70 font-bold">
                    <TableCell className="text-slate-900">Total Settled Amount</TableCell>
                    <TableCell className="text-right text-brand-700">₹{selectedInvoice.totalAmount.toLocaleString()}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end pt-2">
              <Button size="sm" variant="outline" onClick={() => window.print()}>
                <Download className="w-3.5 h-3.5 mr-1" /> Print / Save PDF
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
