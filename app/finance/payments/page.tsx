'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye } from 'lucide-react';
import Link from 'next/link';

interface Payment {
  _id: string;
  paymentNumber: string;
  invoiceNumber: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'bank_transfer' | 'check' | 'credit_card' | 'cash';
  status: 'pending' | 'completed' | 'failed';
  referenceNumber?: string;
  processedBy: string;
  createdAt: string;
}

export default function FinancePaymentsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const userRole = (session?.user as any)?.role;

  useEffect(() => {
    if (userRole !== 'finance' && userRole !== 'admin') {
      router.push('/dashboard');
      return;
    }
    fetchPayments();
  }, [userRole, router]);

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/payments');
      if (response.ok) {
        const data = await response.json();
        setPayments(data);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
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
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
            <p className="text-gray-600">Track and manage payment records</p>
          </div>
          <Link href="/finance/payments/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Record Payment
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-600">
                {payments.filter(p => p.status === 'pending').length}
              </div>
              <p className="text-sm text-gray-600">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">
                {payments.filter(p => p.status === 'completed').length}
              </div>
              <p className="text-sm text-gray-600">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">
                {payments.filter(p => p.status === 'failed').length}
              </div>
              <p className="text-sm text-gray-600">Failed</p>
            </CardContent>
          </Card>
        </div>

        {payments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
              <p className="text-gray-600 mb-4">Record your first payment to get started.</p>
              <Link href="/finance/payments/new">
                <Button>Record Payment</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <Card key={payment._id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{payment.paymentNumber}</CardTitle>
                      <p className="text-sm text-gray-600">
                        Invoice: {payment.invoiceNumber} • Processed by {payment.processedBy}
                      </p>
                      {payment.referenceNumber && (
                        <p className="text-sm text-gray-500">Ref: {payment.referenceNumber}</p>
                      )}
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
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900">Amount</h4>
                      <p className="text-lg font-semibold text-green-600">
                        ${payment.amount.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Payment Date</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Method</h4>
                      <p className="text-sm text-gray-600">
                        {formatPaymentMethod(payment.paymentMethod)}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Recorded</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Link href={`/payments/${payment._id}`}>
                      <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}