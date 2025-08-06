import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Payment from '@/models/Payment';
import Invoice from '@/models/Invoice';
import { generatePaymentNumber } from '@/lib/utils/generators';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    const payments = await Payment.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (!['finance', 'admin'].includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { invoiceId, amount, paymentDate, paymentMethod, referenceNumber, notes } = body;

    if (!invoiceId || !amount || !paymentDate || !paymentMethod) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
    }

    await connectToDatabase();

    // Verify invoice exists
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const payment = new Payment({
      paymentNumber: generatePaymentNumber(),
      invoiceId,
      invoiceNumber: invoice.invoiceNumber,
      amount: parseFloat(amount),
      paymentDate: new Date(paymentDate),
      paymentMethod,
      referenceNumber,
      processedBy: session.user.name,
      notes,
    });

    await payment.save();

    // Update invoice status to paid
    await Invoice.findByIdAndUpdate(invoiceId, { status: 'paid' }, { new: true });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}