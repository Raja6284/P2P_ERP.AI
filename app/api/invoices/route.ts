import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Invoice from '@/models/Invoice';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    const invoices = await Invoice.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
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
    const { invoiceNumber, vendorName, amount, invoiceDate, dueDate, poId, poNumber, ocrExtracted, extractedData, notes } = body;

    if (!invoiceNumber || !vendorName || !amount || !invoiceDate || !dueDate) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
    }

    await connectToDatabase();

    const invoice = new Invoice({
      invoiceNumber,
      vendorName,
      amount: parseFloat(amount),
      invoiceDate: new Date(invoiceDate),
      dueDate: new Date(dueDate),
      poId,
      poNumber,
      uploadedBy: session.user.name,
      ocrExtracted: ocrExtracted || false,
      extractedData,
      notes,
    });

    await invoice.save();

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}