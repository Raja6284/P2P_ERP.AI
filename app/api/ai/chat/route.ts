import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getChatCompletion } from '@/lib/utils/openai';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const systemPrompt = `You are a helpful ERP system assistant. You help users with:
    - Creating requisitions
    - Understanding the procurement process
    - Purchase order management
    - Invoice and payment processes
    - General ERP workflow questions
    
    Keep responses concise and professional. If asked about specific data, remind users to check the relevant sections in the system.`;

    const response = await getChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ]);

    return NextResponse.json({ response });
  } catch (error) {
    console.error('AI Chat Error:', error);
    return NextResponse.json({ error: 'Failed to get AI response' }, { status: 500 });
  }
}