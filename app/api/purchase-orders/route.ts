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
    const { requisitionIds, vendorName, vendorEmail, expectedDeliveryDate, notes } = body;

    if (!requisitionIds || !Array.isArray(requisitionIds) || requisitionIds.length === 0 || !vendorName) {
      return NextResponse.json({ error: 'Requisition IDs and vendor name are required' }, { status: 400 });
    }

    await connectToDatabase();

    // Verify all requisitions exist and are approved
    const requisitions = await Requisition.find({ 
      _id: { $in: requisitionIds },
      status: 'approved'
    });
    
    if (requisitions.length !== requisitionIds.length) {
      return NextResponse.json({ error: 'Some requisitions not found or not approved' }, { status: 400 });
    }

    // Combine all items from selected requisitions
    const items: any[] = [];
    let totalAmount = 0;
    
    requisitions.forEach(requisition => {
      requisition.items.forEach((item: any) => {
        items.push({
          itemName: item.itemName,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.estimatedPrice,
          totalPrice: item.totalPrice,
          requisitionId: requisition._id,
          requisitionNumber: requisition.requisitionNumber,
        });
      });
      totalAmount += requisition.totalAmount;
    });

    const purchaseOrder = new PurchaseOrder({
      poNumber: generatePONumber(),
      requisitionIds: requisitionIds,
      requisitionNumbers: requisitions.map(r => r.requisitionNumber),
      vendorName,
      vendorEmail,
      items,
      totalAmount,
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