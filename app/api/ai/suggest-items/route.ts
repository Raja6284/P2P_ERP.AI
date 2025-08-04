import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { suggestItemsFromDescription } from '@/lib/utils/openai';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { description } = body;

    if (!description) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }

    const suggestions = await suggestItemsFromDescription(description);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Item suggestion error:', error);
    return NextResponse.json({ error: 'Failed to get suggestions' }, { status: 500 });
  }
}