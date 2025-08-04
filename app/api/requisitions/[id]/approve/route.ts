import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Requisition from '@/models/Requisition';

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
    if (userRole !== 'manager' && userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { action, notes } = body;

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    await connectToDatabase();

    const requisition = await Requisition.findById(params.id);
    if (!requisition) {
      return NextResponse.json({ error: 'Requisition not found' }, { status: 404 });
    }

    if (requisition.status !== 'pending') {
      return NextResponse.json({ error: 'Requisition already processed' }, { status: 400 });
    }

    const updateData: any = {
      status: action === 'approve' ? 'approved' : 'rejected',
      managerNotes: notes,
    };

    if (action === 'approve') {
      updateData.approvedBy = session.user.name;
      updateData.approvedAt = new Date();
    } else {
      updateData.rejectedBy = session.user.name;
      updateData.rejectedAt = new Date();
    }

    const updatedRequisition = await Requisition.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    );

    return NextResponse.json(updatedRequisition);
  } catch (error) {
    console.error('Error updating requisition:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}