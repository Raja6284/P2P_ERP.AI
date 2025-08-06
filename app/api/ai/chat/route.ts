import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { querySystemData } from '@/lib/utils/gemini';
import connectToDatabase from '@/lib/mongodb';
import Requisition from '@/models/Requisition';
import PurchaseOrder from '@/models/PurchaseOrder';
import Invoice from '@/models/Invoice';
import Payment from '@/models/Payment';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { message } = body;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ 
        response: 'AI assistant is currently unavailable. Please check the Gemini API configuration.' 
      });
    }

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get system data for context
    await connectToDatabase();
    
    const [requisitions, purchaseOrders, invoices, payments] = await Promise.all([
      Requisition.find({}).limit(50),
      PurchaseOrder.find({}).limit(50),
      Invoice.find({}).limit(50),
      Payment.find({}).limit(50)
    ]);

    const userRole = (session.user as any)?.role;

    const systemData = {
      requisitions: requisitions.map(r => ({
        id: r._id,
        number: r.requisitionNumber,
        status: r.status,
        amount: r.totalAmount,
        requester: r.requesterName,
        department: r.department,
        items: r.items?.length || 0,
        createdAt: r.createdAt
      })),
      purchaseOrders: purchaseOrders.map(po => ({
        id: po._id,
        number: po.poNumber,
        status: po.status,
        amount: po.totalAmount,
        vendor: po.vendorName,
        items: po.items?.length || 0,
        createdAt: po.createdAt
      })),
      invoices: invoices.map(inv => ({
        id: inv._id,
        number: inv.invoiceNumber,
        status: inv.status,
        amount: inv.amount,
        vendor: inv.vendorName,
        dueDate: inv.dueDate,
        overdue: new Date(inv.dueDate) < new Date() && inv.status !== 'paid',
        createdAt: inv.createdAt
      })),
      payments: payments.map(p => ({
        id: p._id,
        number: p.paymentNumber,
        amount: p.amount,
        status: p.status,
        method: p.paymentMethod,
        createdAt: p.createdAt
      })),
      userRole,
      currentDate: new Date().toISOString()
    };
    
    const response = await querySystemData(message, systemData);

    return NextResponse.json({ response });
  } catch (error) {
    console.error('AI Chat Error:', error);
    return NextResponse.json({ 
      response: 'I apologize, but I encountered an error processing your request. Please try again or contact support if the issue persists.' 
    });
  }
}