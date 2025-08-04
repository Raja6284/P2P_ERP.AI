import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Requisition from '@/models/Requisition';
import { generateRequisitionNumber } from '@/lib/utils/generators';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    const userRole = (session.user as any).role;
    const userId = session.user.id;

    let query = {};
    
    // Role-based filtering
    if (userRole === 'requester') {
      query = { requesterId: userId };
    }
    // Managers and admins can see all requisitions

    const requisitions = await Requisition.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json(requisitions);
  } catch (error) {
    console.error('Error fetching requisitions:', error);
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
    if (userRole !== 'requester' && userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { items, department } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Items are required' }, { status: 400 });
    }

    await connectToDatabase();

    // Calculate total amount
    const totalAmount = items.reduce((sum: number, item: any) => {
      return sum + (item.quantity * item.estimatedPrice);
    }, 0);

    // Calculate individual item totals
    const processedItems = items.map((item: any) => ({
      ...item,
      totalPrice: item.quantity * item.estimatedPrice
    }));

    const requisition = new Requisition({
      requisitionNumber: generateRequisitionNumber(),
      requesterId: session.user.id,
      requesterName: session.user.name,
      department: department || 'General',
      items: processedItems,
      totalAmount,
    });

    await requisition.save();

    return NextResponse.json(requisition, { status: 201 });
  } catch (error) {
    console.error('Error creating requisition:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}