'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const paymentSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  paymentDate: z.string().min(1, 'Payment date is required'),
  paymentMethod: z.enum(['bank_transfer', 'check', 'credit_card', 'cash']),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface Invoice {
  _id: string;
  invoiceNumber: string;
  vendorName: string;
  amount: number;
  status: string;
}

export default function NewPaymentPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const userRole = (session?.user as any)?.role;
  const preselectedInvoiceId = searchParams.get('invoiceId');

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentDate: new Date().toISOString().split('T')[0],
    },
  });

  const watchedInvoiceId = watch('invoiceId');

  useEffect(() => {
    if (userRole !== 'finance' && userRole !== 'admin') {
      router.push('/dashboard');
      return;
    }
    fetchInvoices();
  }, [userRole, router]);

  useEffect(() => {
    if (preselectedInvoiceId && invoices.length > 0) {
      setValue('invoiceId', preselectedInvoiceId);
      const invoice = invoices.find(inv => inv._id === preselectedInvoiceId);
      if (invoice) {
        setSelectedInvoice(invoice);
        setValue('amount', invoice.amount);
      }
    }
  }, [preselectedInvoiceId, invoices, setValue]);

  useEffect(() => {
    if (watchedInvoiceId && invoices.length > 0) {
      const invoice = invoices.find(inv => inv._id === watchedInvoiceId);
      setSelectedInvoice(invoice || null);
      if (invoice) {
        setValue('amount', invoice.amount);
      }
    }
  }, [watchedInvoiceId, invoices, setValue]);

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/invoices');
      if (response.ok) {
        const data = await response.json();
        // Only show approved invoices that haven't been paid
        const approvedInvoices = data.filter((inv: Invoice) => 
          inv.status === 'approved' || inv.status === 'pending'
        );
        setInvoices(approvedInvoices);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: PaymentFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success('Payment recorded successfully');
        router.push('/finance/payments');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to record payment');
      }
    } catch (error) {
      toast.error('An error occurred while recording the payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Record Payment</h1>
          <p className="text-gray-600">Record a payment for an approved invoice</p>
        </div>

        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="invoiceId">Select Invoice</Label>
                <Select
                  onValueChange={(value) => setValue('invoiceId', value)}
                  defaultValue={preselectedInvoiceId || ''}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an invoice" />
                  </SelectTrigger>
                  <SelectContent>
                    {invoices.map((invoice) => (
                      <SelectItem key={invoice._id} value={invoice._id}>
                        {invoice.invoiceNumber} - {invoice.vendorName} (${invoice.amount.toFixed(2)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.invoiceId && (
                  <p className="text-sm text-red-600 mt-1">{errors.invoiceId.message}</p>
                )}
              </div>

              {selectedInvoice && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-4">
                    <h4 className="font-medium text-blue-900 mb-2">Selected Invoice</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-blue-700">Invoice:</span> {selectedInvoice.invoiceNumber}
                      </div>
                      <div>
                        <span className="text-blue-700">Vendor:</span> {selectedInvoice.vendorName}
                      </div>
                      <div>
                        <span className="text-blue-700">Amount:</span> ${selectedInvoice.amount.toFixed(2)}
                      </div>
                      <div>
                        <span className="text-blue-700">Status:</span> {selectedInvoice.status}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Payment Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    {...register('amount', { valueAsNumber: true })}
                    placeholder="Enter payment amount"
                  />
                  {errors.amount && (
                    <p className="text-sm text-red-600 mt-1">{errors.amount.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="paymentDate">Payment Date</Label>
                  <Input
                    id="paymentDate"
                    type="date"
                    {...register('paymentDate')}
                  />
                  {errors.paymentDate && (
                    <p className="text-sm text-red-600 mt-1">{errors.paymentDate.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select onValueChange={(value) => setValue('paymentMethod', value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.paymentMethod && (
                    <p className="text-sm text-red-600 mt-1">{errors.paymentMethod.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="referenceNumber">Reference Number (Optional)</Label>
                  <Input
                    id="referenceNumber"
                    {...register('referenceNumber')}
                    placeholder="Enter reference number"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  {...register('notes')}
                  placeholder="Enter any additional notes"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/finance/payments')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Recording...' : 'Record Payment'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}