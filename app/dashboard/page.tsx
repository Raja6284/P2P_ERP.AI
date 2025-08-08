'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Layout from '@/components/layout/Layout';
import StatsCard from '@/components/dashboard/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, ShoppingCart, Receipt, CreditCard, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface DashboardStats {
  [key: string]: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats>({});
  const [loading, setLoading] = useState(true);
  const userRole = (session?.user as any)?.role;

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderRequesterDashboard = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatsCard
          title="Total Requisitions"
          value={stats.totalRequisitions || 0}
          icon={FileText}
        />
        <StatsCard
          title="Pending Approval"
          value={stats.pendingRequisitions || 0}
          icon={Clock}
        />
        <StatsCard
          title="Approved"
          value={stats.approvedRequisitions || 0}
          icon={CheckCircle}
        />
        <StatsCard
          title="Rejected"
          value={stats.rejectedRequisitions || 0}
          icon={AlertCircle}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3">
            <a
              href="/requisitions/new"
              className="block p-2 sm:p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-sm sm:text-base font-medium">Create New Requisition</div>
              <div className="text-xs sm:text-sm text-gray-600">Start a new purchase request</div>
            </a>
            <a
              href="/requisitions"
              className="block p-2 sm:p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-sm sm:text-base font-medium">View My Requisitions</div>
              <div className="text-xs sm:text-sm text-gray-600">Check status of your requests</div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs sm:text-sm text-gray-600">
              No recent activity to display.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderManagerDashboard = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatsCard
          title="Pending Approvals"
          value={stats.pendingApprovals || 0}
          icon={Clock}
        />
        <StatsCard
          title="Total Requisitions"
          value={stats.totalRequisitions || 0}
          icon={FileText}
        />
        <StatsCard
          title="Purchase Orders"
          value={stats.totalPOs || 0}
          icon={ShoppingCart}
        />
        <StatsCard
          title="Monthly Spend"
          value={`$${(stats.monthlySpend || 0).toFixed(0)}`}
          icon={CreditCard}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3">
            <a
              href="/requisitions"
              className="block p-2 sm:p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-sm sm:text-base font-medium">Review Requisitions</div>
              <div className="text-xs sm:text-sm text-gray-600">Approve or reject pending requests</div>
            </a>
            <a
              href="/purchase-orders/new"
              className="block p-2 sm:p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-sm sm:text-base font-medium">Create Purchase Order</div>
              <div className="text-xs sm:text-sm text-gray-600">Convert approved requisitions to POs</div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Approval Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs sm:text-sm text-gray-600">
              {stats.pendingApprovals ? 
                `${stats.pendingApprovals} requisitions awaiting your approval` :
                'No pending approvals'
              }
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderFinanceDashboard = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatsCard
          title="Pending Invoices"
          value={stats.pendingInvoices || 0}
          icon={Receipt}
        />
        <StatsCard
          title="Total Invoices"
          value={stats.totalInvoices || 0}
          icon={Receipt}
        />
        <StatsCard
          title="Total Payments"
          value={stats.totalPayments || 0}
          icon={CreditCard}
        />
        <StatsCard
          title="Overdue Invoices"
          value={stats.overdueInvoices || 0}
          icon={AlertCircle}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3">
            <a
              href="/invoices/new"
              className="block p-2 sm:p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-sm sm:text-base font-medium">Upload Invoice</div>
              <div className="text-xs sm:text-sm text-gray-600">Add new invoice with OCR support</div>
            </a>
            <a
              href="/payments/new"
              className="block p-2 sm:p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-sm sm:text-base font-medium">Record Payment</div>
              <div className="text-xs sm:text-sm text-gray-600">Process invoice payments</div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Payment Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span>Pending Invoices:</span>
                <span className="font-medium">{stats.pendingInvoices || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Overdue Invoices:</span>
                <span className="font-medium text-red-600">{stats.overdueInvoices || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderAdminDashboard = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatsCard
          title="Total Requisitions"
          value={stats.totalRequisitions || 0}
          icon={FileText}
        />
        <StatsCard
          title="Purchase Orders"
          value={stats.totalPOs || 0}
          icon={ShoppingCart}
        />
        <StatsCard
          title="Invoices"
          value={stats.totalInvoices || 0}
          icon={Receipt}
        />
        <StatsCard
          title="Payments"
          value={stats.totalPayments || 0}
          icon={CreditCard}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">System Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span>Active Users:</span>
                <span className="font-medium">15</span>
              </div>
              <div className="flex justify-between">
                <span>Total Transactions:</span>
                <span className="font-medium">
                  {(stats.totalRequisitions || 0) + (stats.totalPOs || 0) + (stats.totalInvoices || 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3">
            <a
              href="/users"
              className="block p-2 sm:p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-sm sm:text-base font-medium">Manage Users</div>
              <div className="text-xs sm:text-sm text-gray-600">Add or modify user accounts</div>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  if (loading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 sm:h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome back, {session?.user?.name}!
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Here's what's happening in your ERP system today.
          </p>
        </div>

        {userRole === 'requester' && renderRequesterDashboard()}
        {userRole === 'manager' && renderManagerDashboard()}
        {userRole === 'finance' && renderFinanceDashboard()}
        {userRole === 'admin' && renderAdminDashboard()}
      </div>
    </Layout>
  );
}