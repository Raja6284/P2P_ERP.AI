'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Upload } from 'lucide-react';
import Link from 'next/link';

interface Invoice {
  _id: string;
  invoiceNumber: string;
  vendorName: string;
  amount: number;
  status: 'pending' | 'approved' | 'paid' | 'overdue';
  invoiceDate: string;
  dueDate: string;
  poNumber?: string;
  ocrExtracted: boolean;
  uploadedBy: string;
  createdAt: string;
}

export default function FinanceInvoicesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const userRole = (session?.user as any)?.role;

  useEffect(() => {
    if (userRole !== 'finance' && userRole !== 'admin') {
      router.push('/dashboard');
      return;
    }
    fetchInvoices();
  }, [userRole, router]);

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/invoices');
      if (response.ok) {
        const data = await response.json();
        setInvoices(data);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = (dueDate: string, status: string) => {
    return status !== 'paid' && new Date(dueDate) < new Date();
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
            <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
            <p className="text-gray-600">Manage invoices and process payments</p>
          </div>
          <Link href="/finance/invoices/new">
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload Invoice
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-600">
                {invoices.filter(inv => inv.status === 'pending').length}
              </div>
              <p className="text-sm text-gray-600">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">
                {invoices.filter(inv => inv.status === 'approved').length}
              </div>
              <p className="text-sm text-gray-600">Approved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">
                {invoices.filter(inv => inv.status === 'paid').length}
              </div>
              <p className="text-sm text-gray-600">Paid</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">
                {invoices.filter(inv => isOverdue(inv.dueDate, inv.status)).length}
              </div>
              <p className="text-sm text-gray-600">Overdue</p>
            </CardContent>
          </Card>
        </div>

        {invoices.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
              <p className="text-gray-600 mb-4">Upload your first invoice to get started.</p>
              <Link href="/finance/invoices/new">
                <Button>Upload Invoice</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <Card key={invoice._id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{invoice.invoiceNumber}</CardTitle>
                      <p className="text-sm text-gray-600">
                        Vendor: {invoice.vendorName} • Uploaded by {invoice.uploadedBy}
                      </p>
                      {invoice.poNumber && (
                        <p className="text-sm text-gray-500">PO: {invoice.poNumber}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {invoice.ocrExtracted && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          OCR
                        </Badge>
                      )}
                      <Badge className={getStatusColor(
                        isOverdue(invoice.dueDate, invoice.status) ? 'overdue' : invoice.status
                      )}>
                        {isOverdue(invoice.dueDate, invoice.status) ? 'overdue' : invoice.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900">Amount</h4>
                      <p className="text-lg font-semibold text-blue-600">
                        ${invoice.amount.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Invoice Date</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(invoice.invoiceDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Due Date</h4>
                      <p className={`text-sm ${
                        isOverdue(invoice.dueDate, invoice.status) 
                          ? 'text-red-600 font-medium' 
                          : 'text-gray-600'
                      }`}>
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Uploaded</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(invoice.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                    {invoice.status === 'approved' && (
                      <Link href={`/finance/payments/new?invoiceId=${invoice._id}`}>
                        <Button size="sm">Record Payment</Button>
                      </Link>
                    )}
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