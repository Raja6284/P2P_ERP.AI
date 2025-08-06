'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface Requisition {
  _id: string;
  requisitionNumber: string;
  requesterName: string;
  department: string;
  totalAmount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  items: Array<{
    itemName: string;
    quantity: number;
    estimatedPrice: number;
  }>;
}

export default function RequisitionsPage() {
  const { data: session } = useSession();
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [loading, setLoading] = useState(true);
  const userRole = (session?.user as any)?.role;

  useEffect(() => {
    fetchRequisitions();
  }, []);

  const fetchRequisitions = async () => {
    try {
      const response = await fetch('/api/requisitions');
      if (response.ok) {
        const data = await response.json();
        setRequisitions(data);
      }
    } catch (error) {
      console.error('Error fetching requisitions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (id: string, action: 'approve' | 'reject', notes?: string) => {
    try {
      const response = await fetch(`/api/requisitions/${id}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes }),
      });

      if (response.ok) {
        toast.success(`Requisition ${action}d successfully`);
        fetchRequisitions();
      } else {
        toast.error(`Failed to ${action} requisition`);
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
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
            <h1 className="text-3xl font-bold text-gray-900">Requisitions</h1>
            <p className="text-gray-600">Manage purchase requisitions</p>
          </div>
          {userRole === 'requester' && (
            <Link href="/requisitions/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Requisition
              </Button>
            </Link>
          )}
        </div>

        {requisitions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No requisitions found</h3>
              <p className="text-gray-600 mb-4">
                {userRole === 'requester' 
                  ? "You haven't created any requisitions yet."
                  : "No requisitions to review at this time."
                }
              </p>
              {userRole === 'requester' && (
                <Link href="/requisitions/new">
                  <Button>Create Your First Requisition</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requisitions.map((requisition) => (
              <Card key={requisition._id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {requisition.requisitionNumber}
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        By {requisition.requesterName} • {requisition.department}
                      </p>
                    </div>
                    <Badge className={getStatusColor(requisition.status)}>
                      {requisition.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900">Items</h4>
                      <div className="text-sm text-gray-600">
                        {requisition.items.map((item, index) => (
                          <div key={index}>
                            {item.itemName} (Qty: {item.quantity})
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Total Amount</h4>
                      <p className="text-lg font-semibold text-blue-600">
                        ${requisition.totalAmount.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Created</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(requisition.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end space-x-2">
                    <Link href={`/requisitions/${requisition._id}`}>
                      <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                      </Button>
                    </Link>
                    
                    {userRole === 'manager' && requisition.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApproval(requisition._id, 'approve')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleApproval(requisition._id, 'reject')}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </>
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