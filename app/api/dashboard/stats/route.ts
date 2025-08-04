import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Requisition from '@/models/Requisition';
import PurchaseOrder from '@/models/PurchaseOrder';
import Invoice from '@/models/Invoice';
import Payment from '@/models/Payment';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    const userRole = (session.user as any).role;
    const userId = session.user.id;

    let stats: any = {};

    if (userRole === 'requester') {
      const totalRequisitions = await Requisition.countDocuments({ requesterId: userId });
      const pendingRequisitions = await Requisition.countDocuments({ 
        requesterId: userId, 
        status: 'pending' 
      });
      const approvedRequisitions = await Requisition.countDocuments({ 
        requesterId: userId, 
        status: 'approved' 
      });

      stats = {
        totalRequisitions,
        pendingRequisitions,
        approvedRequisitions,
        rejectedRequisitions: totalRequisitions - pendingRequisitions - approvedRequisitions,
      };
    } else if (userRole === 'manager') {
      const pendingApprovals = await Requisition.countDocuments({ status: 'pending' });
      const totalRequisitions = await Requisition.countDocuments({});
      const totalPOs = await PurchaseOrder.countDocuments({});

      stats = {
        pendingApprovals,
        totalRequisitions,
        totalPOs,
        monthlySpend: 0, // Would need aggregation for actual calculation
      };
    } else if (userRole === 'finance') {
      const pendingInvoices = await Invoice.countDocuments({ status: 'pending' });
      const totalInvoices = await Invoice.countDocuments({});
      const totalPayments = await Payment.countDocuments({});
      const overdueInvoices = await Invoice.countDocuments({ status: 'overdue' });

      stats = {
        pendingInvoices,
        totalInvoices,
        totalPayments,
        overdueInvoices,
      };
    } else {
      // Admin or other roles get full stats
      const totalRequisitions = await Requisition.countDocuments({});
      const totalPOs = await PurchaseOrder.countDocuments({});
      const totalInvoices = await Invoice.countDocuments({});
      const totalPayments = await Payment.countDocuments({});

      stats = {
        totalRequisitions,
        totalPOs,
        totalInvoices,
        totalPayments,
      };
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}