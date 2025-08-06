import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Requisition from '@/models/Requisition';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    const requisition = await Requisition.findById(params.id);
    
    if (!requisition) {
      return NextResponse.json({ error: 'Requisition not found' }, { status: 404 });
    }

    // Role-based access control
    const userRole = (session.user as any).role;
    const userId = session.user.id;

    if (userRole === 'requester' && requisition.requesterId !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json(requisition);
  } catch (error) {
    console.error('Error fetching requisition:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}