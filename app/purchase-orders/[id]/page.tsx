'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Package, Calendar, User, Building, Truck } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface POItem {
  itemName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  requisitionId?: string;
  requisitionNumber?: string;
}

interface PurchaseOrder {
  _id: string;
  poNumber: string;
  requisitionIds: string[];
  requisitionNumbers: string[];
  vendorName: string;
  vendorEmail?: string;
  items: POItem[];
  totalAmount: number;
  status: 'pending' | 'in-transit' | 'received' | 'completed';
  createdBy: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function PurchaseOrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const userRole = (session?.user as any)?.role;
  const poId = params.id as string;

  useEffect(() => {
    if (poId) {
      fetchPurchaseOrder();
    }
  }, [poId]);

  const fetchPurchaseOrder = async () => {
    try {
      const response = await fetch(`/api/purchase-orders/${poId}`);
      if (response.ok) {
        const data = await response.json();
        setPurchaseOrder(data);
      } else {
        toast.error('Purchase order not found');
        router.push('/purchase-orders');
      }
    } catch (error) {
      console.error('Error fetching purchase order:', error);
      toast.error('Failed to load purchase order details');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!purchaseOrder) return;

    setUpdating(true);
    try {
      const response = await fetch(`/api/purchase-orders/${purchaseOrder._id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success('Purchase order status updated');
        fetchPurchaseOrder();
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-transit': return 'bg-blue-100 text-blue-800';
      case 'received': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNextStatuses = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending': return ['in-transit'];
      case 'in-transit': return ['received'];
      case 'received': return ['completed'];
      default: return [];
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

  if (!purchaseOrder) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Purchase Order Not Found</h2>
          <Link href="/purchase-orders">
            <Button>Back to Purchase Orders</Button>
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
            <Link href="/purchase-orders">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{purchaseOrder.poNumber}</h1>
              <p className="text-gray-600">Purchase Order Details</p>
            </div>
          </div>
          <Badge className={getStatusColor(purchaseOrder.status)}>
            {purchaseOrder.status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="mr-2 h-5 w-5" />
                  Purchase Order Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Vendor</p>
                      <p className="font-medium">{purchaseOrder.vendorName}</p>
                      {purchaseOrder.vendorEmail && (
                        <p className="text-sm text-gray-500">{purchaseOrder.vendorEmail}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Created By</p>
                      <p className="font-medium">{purchaseOrder.createdBy}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Created</p>
                      <p className="font-medium">{new Date(purchaseOrder.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="text-2xl font-bold text-blue-600">${purchaseOrder.totalAmount.toFixed(2)}</p>
                  </div>
                </div>

                {purchaseOrder.expectedDeliveryDate && (
                  <div className="flex items-center space-x-2 pt-2 border-t">
                    <Truck className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Expected Delivery</p>
                      <p className="font-medium">{new Date(purchaseOrder.expectedDeliveryDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}

                {purchaseOrder.actualDeliveryDate && (
                  <div className="flex items-center space-x-2">
                    <Truck className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-500">Actual Delivery</p>
                      <p className="font-medium text-green-600">{new Date(purchaseOrder.actualDeliveryDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}

                {purchaseOrder.notes && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-500">Notes</p>
                    <p className="text-gray-700">{purchaseOrder.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Items Ordered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {purchaseOrder.items.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-lg">{item.itemName}</h4>
                        <span className="text-lg font-semibold text-blue-600">
                          ${item.totalPrice.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{item.description}</p>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Quantity: {item.quantity}</span>
                        <span>Unit Price: ${item.unitPrice.toFixed(2)}</span>
                      </div>
                      {item.requisitionNumber && (
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs">
                            From: {item.requisitionNumber}
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Related Requisitions */}
            <Card>
              <CardHeader>
                <CardTitle>Related Requisitions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {purchaseOrder.requisitionNumbers.map((reqNumber, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium">{reqNumber}</span>
                      <Link href={`/requisitions/${purchaseOrder.requisitionIds[index]}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Status Update for Store Role */}
            {userRole === 'store' && getNextStatuses(purchaseOrder.status).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Update Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Current Status: {purchaseOrder.status}</p>
                    <Select onValueChange={updateStatus} disabled={updating}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select new status" />
                      </SelectTrigger>
                      <SelectContent>
                        {getNextStatuses(purchaseOrder.status).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {updating && (
                    <p className="text-sm text-gray-500">Updating status...</p>
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
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-xs text-gray-500">
                      {new Date(purchaseOrder.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {purchaseOrder.status !== 'pending' && (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Status: {purchaseOrder.status}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(purchaseOrder.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {purchaseOrder.actualDeliveryDate && (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Delivered</p>
                      <p className="text-xs text-gray-500">
                        {new Date(purchaseOrder.actualDeliveryDate).toLocaleString()}
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