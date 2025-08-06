'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Receipt, Calendar, User, Building, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface Invoice {
  _id: string;
  invoiceNumber: string;
  poId?: string;
  poNumber?: string;
  vendorName: string;
  amount: number;
  invoiceDate: string;
  dueDate: string;
  status: 'pending' | 'approved' | 'paid' | 'overdue';
  uploadedBy: string;
  filePath?: string;
  ocrExtracted: boolean;
  extractedData?: {
    confidence: number;
    rawText: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
  anomalies?: string[];
  matchedPO?: boolean;
}

export default function InvoiceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  const userRole = (session?.user as any)?.role;
  const invoiceId = params.id as string;

  useEffect(() => {
    if (invoiceId) {
      fetchInvoice();
    }
  }, [invoiceId]);

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`);
      if (response.ok) {
        const data = await response.json();
        setInvoice(data);
      } else {
        toast.error('Invoice not found');
        router.push('/finance/invoices');
      }
    } catch (error) {
      console.error('Error fetching invoice:', error);
      toast.error('Failed to load invoice details');
    } finally {
      setLoading(false);
    }
  };

  const updateInvoiceStatus = async (newStatus: string) => {
    if (!invoice) return;

    try {
      const response = await fetch(`/api/invoices/${invoice._id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success('Invoice status updated');
        fetchInvoice();
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
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </Layout>
    );
  }

  if (!invoice) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Invoice Not Found</h2>
          <Link href="/finance/invoices">
            <Button>Back to Invoices</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const displayStatus = isOverdue(invoice.dueDate, invoice.status) ? 'overdue' : invoice.status;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/finance/invoices">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{invoice.invoiceNumber}</h1>
              <p className="text-gray-600">Invoice Details</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {invoice.ocrExtracted && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                AI Extracted
              </Badge>
            )}
            <Badge className={getStatusColor(displayStatus)}>
              {displayStatus}
            </Badge>
          </div>
        </div>

        {/* Anomaly Alerts */}
        {invoice.anomalies && invoice.anomalies.length > 0 && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Anomalies Detected:</strong>
              <ul className="mt-2 list-disc list-inside">
                {invoice.anomalies.map((anomaly, index) => (
                  <li key={index}>{anomaly}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* PO Matching Status */}
        {invoice.matchedPO !== undefined && (
          <Alert className={invoice.matchedPO ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            {invoice.matchedPO ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={invoice.matchedPO ? "text-green-800" : "text-red-800"}>
              {invoice.matchedPO 
                ? `Invoice successfully matched to PO: ${invoice.poNumber}`
                : "Warning: This invoice could not be matched to any existing purchase order."
              }
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Receipt className="mr-2 h-5 w-5" />
                  Invoice Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Vendor</p>
                      <p className="font-medium">{invoice.vendorName}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Uploaded By</p>
                      <p className="font-medium">{invoice.uploadedBy}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Invoice Date</p>
                      <p className="font-medium">{new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Due Date</p>
                      <p className={`font-medium ${isOverdue(invoice.dueDate, invoice.status) ? 'text-red-600' : ''}`}>
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="text-3xl font-bold text-blue-600">${invoice.amount.toFixed(2)}</p>
                </div>

                {invoice.poNumber && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-500">Related Purchase Order</p>
                    <Link href={`/purchase-orders/${invoice.poId}`}>
                      <Button variant="outline" size="sm" className="mt-1">
                        {invoice.poNumber}
                      </Button>
                    </Link>
                  </div>
                )}

                {invoice.notes && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-500">Notes</p>
                    <p className="text-gray-700">{invoice.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* OCR Information */}
            {invoice.ocrExtracted && invoice.extractedData && (
              <Card>
                <CardHeader>
                  <CardTitle>AI Extraction Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Confidence Score:</span>
                      <span className="font-medium">{invoice.extractedData.confidence}%</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Extracted Text Preview:</p>
                      <div className="bg-gray-50 p-3 rounded text-xs font-mono max-h-32 overflow-y-auto">
                        {invoice.extractedData.rawText?.substring(0, 500)}
                        {invoice.extractedData.rawText && invoice.extractedData.rawText.length > 500 && '...'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            {(userRole === 'finance' || userRole === 'admin') && (
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {invoice.status === 'pending' && (
                    <Button 
                      onClick={() => updateInvoiceStatus('approved')}
                      className="w-full"
                    >
                      Approve Invoice
                    </Button>
                  )}
                  {invoice.status === 'approved' && (
                    <Link href={`/finance/payments/new?invoiceId=${invoice._id}`}>
                      <Button className="w-full">Record Payment</Button>
                    </Link>
                  )}
                  {invoice.status === 'pending' && (
                    <Button 
                      onClick={() => updateInvoiceStatus('rejected')}
                      variant="destructive"
                      className="w-full"
                    >
                      Reject Invoice
                    </Button>
                  )}
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
                    <p className="text-sm font-medium">Uploaded</p>
                    <p className="text-xs text-gray-500">
                      {new Date(invoice.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {invoice.status !== 'pending' && (
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      invoice.status === 'approved' ? 'bg-blue-500' :
                      invoice.status === 'paid' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium">
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(invoice.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}