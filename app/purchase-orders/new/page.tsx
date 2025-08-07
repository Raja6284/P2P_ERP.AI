'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface Requisition {
  _id: string;
  requisitionNumber: string;
  requesterName: string;
  department: string;
  totalAmount: number;
  items: Array<{
    itemName: string;
    description: string;
    quantity: number;
    estimatedPrice: number;
    totalPrice: number;
  }>;
  createdAt: string;
  status?:string;
}

export default function NewPurchaseOrderPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [selectedRequisitions, setSelectedRequisitions] = useState<string[]>([]);
  const [vendorName, setVendorName] = useState('');
  const [vendorEmail, setVendorEmail] = useState('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const userRole = (session?.user as any)?.role;

  useEffect(() => {
    if (userRole !== 'manager' && userRole !== 'admin') {
      router.push('/dashboard');
      return;
    }
    fetchApprovedRequisitions();
  }, [userRole, router]);

  const fetchApprovedRequisitions = async () => {
    try {
      const response = await fetch('/api/requisitions');
      if (response.ok) {
        const data = await response.json();
        const approved = data.filter((req: Requisition) => req.status === 'approved');
        setRequisitions(approved);
      }
    } catch (error) {
      console.error('Error fetching requisitions:', error);
      toast.error('Failed to load requisitions');
    } finally {
      setLoading(false);
    }
  };

  const handleRequisitionToggle = (requisitionId: string) => {
    setSelectedRequisitions(prev => 
      prev.includes(requisitionId)
        ? prev.filter(id => id !== requisitionId)
        : [...prev, requisitionId]
    );
  };

  const calculateTotalAmount = () => {
    return requisitions
      .filter(req => selectedRequisitions.includes(req._id))
      .reduce((sum, req) => sum + req.totalAmount, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedRequisitions.length === 0) {
      toast.error('Please select at least one requisition');
      return;
    }

    if (!vendorName.trim()) {
      toast.error('Vendor name is required');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requisitionIds: selectedRequisitions,
          vendorName: vendorName.trim(),
          vendorEmail: vendorEmail.trim() || undefined,
          expectedDeliveryDate: expectedDeliveryDate || undefined,
          notes: notes.trim() || undefined,
        }),
      });

      if (response.ok) {
        toast.success('Purchase order created successfully');
        router.push('/purchase-orders');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create purchase order');
      }
    } catch (error) {
      toast.error('An error occurred while creating the purchase order');
    } finally {
      setSubmitting(false);
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
          <h1 className="text-3xl font-bold text-gray-900">Create Purchase Order</h1>
          <p className="text-gray-600">Select approved requisitions and create a purchase order</p>
        </div>

        {requisitions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Approved Requisitions</h3>
              <p className="text-gray-600">There are no approved requisitions available to create purchase orders.</p>
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Requisitions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {requisitions.map((requisition) => (
                  <div key={requisition._id} className="flex items-start space-x-3 p-4 border rounded-lg">
                    <Checkbox
                      id={requisition._id}
                      checked={selectedRequisitions.includes(requisition._id)}
                      onCheckedChange={() => handleRequisitionToggle(requisition._id)}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{requisition.requisitionNumber}</h4>
                          <p className="text-sm text-gray-600">
                            By {requisition.requesterName} • {requisition.department}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-blue-600">
                            ${requisition.totalAmount.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(requisition.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700">Items:</p>
                        <ul className="text-sm text-gray-600 ml-4">
                          {requisition.items.map((item, index) => (
                            <li key={index}>
                              {item.itemName} (Qty: {item.quantity}) - ${item.totalPrice.toFixed(2)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vendor Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="vendorName">Vendor Name *</Label>
                    <Input
                      id="vendorName"
                      value={vendorName}
                      onChange={(e) => setVendorName(e.target.value)}
                      placeholder="Enter vendor name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="vendorEmail">Vendor Email</Label>
                    <Input
                      id="vendorEmail"
                      type="email"
                      value={vendorEmail}
                      onChange={(e) => setVendorEmail(e.target.value)}
                      placeholder="Enter vendor email"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="expectedDeliveryDate">Expected Delivery Date</Label>
                  <Input
                    id="expectedDeliveryDate"
                    type="date"
                    value={expectedDeliveryDate}
                    onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter any additional notes"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {selectedRequisitions.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">Total Amount:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ${calculateTotalAmount().toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/purchase-orders')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting || selectedRequisitions.length === 0}
              >
                {submitting ? 'Creating...' : 'Create Purchase Order'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
}