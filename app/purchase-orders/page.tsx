'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye } from 'lucide-react';
import Link from 'next/link';

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

export default function PurchaseOrdersPage() {
  const { data: session } = useSession();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const userRole = (session?.user as any)?.role;

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-transit': return 'bg-blue-100 text-blue-800';
      case 'received': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Purchase Orders</h1>
            <p className="text-gray-600">Manage purchase orders and track deliveries</p>
          </div>
          {(userRole === 'manager' || userRole === 'admin') && (
            <Link href="/purchase-orders/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Purchase Order
              </Button>
            </Link>
          )}
        </div>

        {purchaseOrders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No purchase orders found</h3>
              <p className="text-gray-600 mb-4">
                {userRole === 'manager' || userRole === 'admin'
                  ? "You haven't created any purchase orders yet."
                  : "No purchase orders to display at this time."
                }
              </p>
              {(userRole === 'manager' || userRole === 'admin') && (
                <Link href="/purchase-orders/new">
                  <Button>Create Your First Purchase Order</Button>
                </Link>
              )}
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
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

                  <div className="mt-4 flex justify-end space-x-2">
                    <Link href={`/purchase-orders/${po._id}`}>
                      <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                      </Button>
                    </Link>
                    {userRole === 'store' && po.status !== 'completed' && (
                      <Link href={`/store/purchase-orders/${po._id}`}>
                        <Button size="sm">Update Status</Button>
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