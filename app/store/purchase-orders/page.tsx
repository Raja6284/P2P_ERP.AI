'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface PurchaseOrder {
  _id: string;
  poNumber: string;
  requisitionNumbers: string[];
  vendorName: string;
  totalAmount: number;
  status: 'pending' | 'in-transit' | 'received' | 'completed';
  createdBy: string;
  expectedDeliveryDate?: string;
  createdAt: string;
  items: Array<{
    itemName: string;
    quantity: number;
    totalPrice: number;
  }>;
}

export default function StorePurchaseOrdersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const userRole = (session?.user as any)?.role;

  useEffect(() => {
    if (userRole !== 'store' && userRole !== 'admin') {
      router.push('/dashboard');
      return;
    }
    fetchPurchaseOrders();
  }, [userRole, router]);

  const fetchPurchaseOrders = async () => {
    try {
      const response = await fetch('/api/purchase-orders');
      if (response.ok) {
        const data = await response.json();
        setPurchaseOrders(data);
      }
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePOStatus = async (poId: string, newStatus: string) => {
    setUpdating(poId);
    try {
      const response = await fetch(`/api/purchase-orders/${poId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success('Purchase order status updated');
        fetchPurchaseOrders();
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setUpdating(null);
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Purchase Orders - Store Management</h1>
          <p className="text-gray-600">Track and update purchase order delivery status</p>
        </div>

        {purchaseOrders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No purchase orders found</h3>
              <p className="text-gray-600">No purchase orders to track at this time.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {purchaseOrders.map((po) => (
              <Card key={po._id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{po.poNumber}</CardTitle>
                      <p className="text-sm text-gray-600">
                        Vendor: {po.vendorName} • Created by {po.createdBy}
                      </p>
                      <p className="text-sm text-gray-500">
                        Requisitions: {po.requisitionNumbers.join(', ')}
                      </p>
                    </div>
                    <Badge className={getStatusColor(po.status)}>
                      {po.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900">Items</h4>
                      <div className="text-sm text-gray-600">
                        {po.items.slice(0, 3).map((item, index) => (
                          <div key={index}>
                            {item.itemName} (Qty: {item.quantity})
                          </div>
                        ))}
                        {po.items.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{po.items.length - 3} more items
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Total Amount</h4>
                      <p className="text-lg font-semibold text-blue-600">
                        ${po.totalAmount.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Expected Delivery</h4>
                      <p className="text-sm text-gray-600">
                        {po.expectedDeliveryDate 
                          ? new Date(po.expectedDeliveryDate).toLocaleDateString()
                          : 'Not specified'
                        }
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Created</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(po.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {getNextStatuses(po.status).length > 0 && (
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-medium">Update Status:</span>
                      <Select
                        onValueChange={(value) => updatePOStatus(po._id, value)}
                        disabled={updating === po._id}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Select new status" />
                        </SelectTrigger>
                        <SelectContent>
                          {getNextStatuses(po.status).map((status) => (
                            <SelectItem key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {updating === po._id && (
                        <span className="text-sm text-gray-500">Updating...</span>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}