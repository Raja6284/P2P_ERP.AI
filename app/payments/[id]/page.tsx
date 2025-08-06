'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CreditCard, Calendar, User, Receipt, Building } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface Payment {
  _id: string;
  paymentNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'bank_transfer' | 'check' | 'credit_card' | 'cash';
  status: 'pending' | 'completed' | 'failed';
  referenceNumber?: string;
  processedBy: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function PaymentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);

  const userRole = (session?.user as any)?.role;
  const paymentId = params.id as string;

  useEffect(() => {
    if (paymentId) {
      fetchPayment();
    }
  }, [paymentId]);

  const fetchPayment = async () => {
    try {
      const response = await fetch(`/api/payments/${paymentId}`);
      if (response.ok) {
        const data = await response.json();
        setPayment(data);
      } else {
        toast.error('Payment not found');
        router.push('/finance/payments');
      }
    } catch (error) {
      console.error('Error fetching payment:', error);
      toast.error('Failed to load payment details');
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatus = async (newStatus: string) => {
    if (!payment) return;

    try {
      const response = await fetch(`/api/payments/${payment._id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success('Payment status updated');
        fetchPayment();
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'bank_transfer': return 'bg-blue-100 text-blue-800';
      case 'check': return 'bg-purple-100 text-purple-800';
      case 'credit_card': return 'bg-orange-100 text-orange-800';
      case 'cash': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPaymentMethod = (method: string) => {
    return method.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
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

  if (!payment) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Not Found</h2>
          <Link href="/finance/payments">
            <Button>Back to Payments</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/finance/payments">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{payment.paymentNumber}</h1>
              <p className="text-gray-600">Payment Details</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getMethodColor(payment.paymentMethod)}>
              {formatPaymentMethod(payment.paymentMethod)}
            </Badge>
            <Badge className={getStatusColor(payment.status)}>
              {payment.status}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Receipt className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Invoice</p>
                      <Link href={`/invoices/${payment.invoiceId}`}>
                        <Button variant="outline" size="sm">
                          {payment.invoiceNumber}
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Processed By</p>
                      <p className="font-medium">{payment.processedBy}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Payment Date</p>
                      <p className="font-medium">{new Date(payment.paymentDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Payment Method</p>
                      <p className="font-medium">{formatPaymentMethod(payment.paymentMethod)}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500">Amount Paid</p>
                  <p className="text-3xl font-bold text-green-600">${payment.amount.toFixed(2)}</p>
                </div>

                {payment.referenceNumber && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-500">Reference Number</p>
                    <p className="font-medium font-mono">{payment.referenceNumber}</p>
                  </div>
                )}

                {payment.notes && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-500">Notes</p>
                    <p className="text-gray-700">{payment.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            {(userRole === 'finance' || userRole === 'admin') && payment.status === 'pending' && (
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    onClick={() => updatePaymentStatus('completed')}
                    className="w-full"
                  >
                    Mark as Completed
                  </Button>
                  <Button 
                    onClick={() => updatePaymentStatus('failed')}
                    variant="destructive"
                    className="w-full"
                  >
                    Mark as Failed
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Status History */}
            <Card>
              <CardHeader>
                <CardTitle>Status History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Payment Recorded</p>
                    <p className="text-xs text-gray-500">
                      {new Date(payment.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {payment.status !== 'pending' && (
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      payment.status === 'completed' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium">
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(payment.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Payment ID:</span>
                  <span className="font-mono text-xs">{payment._id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Created:</span>
                  <span>{new Date(payment.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Last Updated:</span>
                  <span>{new Date(payment.updatedAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}