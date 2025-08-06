'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Check, X, Eye, Calendar, User, Building } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface RequisitionItem {
  itemName: string;
  description: string;
  quantity: number;
  estimatedPrice: number;
  totalPrice: number;
}

interface Requisition {
  _id: string;
  requisitionNumber: string;
  requesterId: string;
  requesterName: string;
  department: string;
  items: RequisitionItem[];
  totalAmount: number;
  status: 'pending' | 'approved' | 'rejected';
  managerNotes?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function RequisitionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [requisition, setRequisition] = useState<Requisition | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [managerNotes, setManagerNotes] = useState('');

  const userRole = (session?.user as any)?.role;
  const requisitionId = params.id as string;

  useEffect(() => {
    if (requisitionId) {
      fetchRequisition();
    }
  }, [requisitionId]);

  const fetchRequisition = async () => {
    try {
      const response = await fetch(`/api/requisitions/${requisitionId}`);
      if (response.ok) {
        const data = await response.json();
        setRequisition(data);
        setManagerNotes(data.managerNotes || '');
      } else {
        toast.error('Requisition not found');
        router.push('/requisitions');
      }
    } catch (error) {
      console.error('Error fetching requisition:', error);
      toast.error('Failed to load requisition details');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (action: 'approve' | 'reject') => {
    if (!requisition) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/requisitions/${requisition._id}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes: managerNotes }),
      });

      if (response.ok) {
        toast.success(`Requisition ${action}d successfully`);
        fetchRequisition();
      } else {
        toast.error(`Failed to ${action} requisition`);
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setActionLoading(false);
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
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </Layout>
    );
  }

  if (!requisition) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Requisition Not Found</h2>
          <Link href="/requisitions">
            <Button>Back to Requisitions</Button>
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
            <Link href="/requisitions">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{requisition.requisitionNumber}</h1>
              <p className="text-gray-600">Requisition Details</p>
            </div>
          </div>
          <Badge className={getStatusColor(requisition.status)}>
            {requisition.status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="mr-2 h-5 w-5" />
                  Requisition Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Requested By</p>
                      <p className="font-medium">{requisition.requesterName}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Department</p>
                      <p className="font-medium">{requisition.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Created</p>
                      <p className="font-medium">{new Date(requisition.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="text-2xl font-bold text-blue-600">${requisition.totalAmount.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Items Requested</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {requisition.items.map((item, index) => (
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
                        <span>Unit Price: ${item.estimatedPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
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
                      {new Date(requisition.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {requisition.approvedAt && (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Approved by {requisition.approvedBy}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(requisition.approvedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {requisition.rejectedAt && (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Rejected by {requisition.rejectedBy}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(requisition.rejectedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Manager Actions */}
            {userRole === 'manager' && requisition.status === 'pending' && (
              <Card>
                <CardHeader>
                  <CardTitle>Manager Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="managerNotes">Notes (Optional)</Label>
                    <Textarea
                      id="managerNotes"
                      value={managerNotes}
                      onChange={(e) => setManagerNotes(e.target.value)}
                      placeholder="Add notes for this decision..."
                      rows={3}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleApproval('approve')}
                      disabled={actionLoading}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleApproval('reject')}
                      disabled={actionLoading}
                      variant="destructive"
                      className="flex-1"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Manager Notes Display */}
            {requisition.managerNotes && (
              <Card>
                <CardHeader>
                  <CardTitle>Manager Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{requisition.managerNotes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}