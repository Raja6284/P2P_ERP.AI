import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import PurchaseOrder from '@/models/PurchaseOrder';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (!['store', 'admin'].includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { status } = body;

    const validStatuses = ['pending', 'in-transit', 'received', 'completed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await connectToDatabase();

    const purchaseOrder = await PurchaseOrder.findById(params.id);
    if (!purchaseOrder) {
      return NextResponse.json({ error: 'Purchase order not found' }, { status: 404 });
    }

    const updateData: any = { status };
    
    if (status === 'received') {
      updateData.actualDeliveryDate = new Date();
    }

    const updatedPO = await PurchaseOrder.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    );

    return NextResponse.json(updatedPO);
  } catch (error) {
    console.error('Error updating purchase order status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}