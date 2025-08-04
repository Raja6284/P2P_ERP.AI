import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import PurchaseOrder from '@/models/PurchaseOrder';
import Requisition from '@/models/Requisition';
import { generatePONumber } from '@/lib/utils/generators';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    const purchaseOrders = await PurchaseOrder.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json(purchaseOrders);
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
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
    if (!['manager', 'store', 'admin'].includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { requisitionId, vendorName, vendorEmail, expectedDeliveryDate, notes } = body;

    if (!requisitionId || !vendorName) {
      return NextResponse.json({ error: 'Requisition ID and vendor name are required' }, { status: 400 });
    }

    await connectToDatabase();

    // Verify requisition exists and is approved
    const requisition = await Requisition.findById(requisitionId);
    if (!requisition) {
      return NextResponse.json({ error: 'Requisition not found' }, { status: 404 });
    }

    if (requisition.status !== 'approved') {
      return NextResponse.json({ error: 'Requisition must be approved' }, { status: 400 });
    }

    // Convert requisition items to PO items
    const items = requisition.items.map((item: any) => ({
      itemName: item.itemName,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.estimatedPrice,
      totalPrice: item.totalPrice,
    }));

    const purchaseOrder = new PurchaseOrder({
      poNumber: generatePONumber(),
      requisitionId: requisition._id,
      requisitionNumber: requisition.requisitionNumber,
      vendorName,
      vendorEmail,
      items,
      totalAmount: requisition.totalAmount,
      createdBy: session.user.name,
      expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : undefined,
      notes,
    });

    await purchaseOrder.save();

    return NextResponse.json(purchaseOrder, { status: 201 });
  } catch (error) {
    console.error('Error creating purchase order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}