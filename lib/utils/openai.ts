import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getChatCompletion(messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to get AI response');
  }
}

export async function suggestItemsFromDescription(description: string): Promise<string[]> {
  try {
    const prompt = `Based on this description: "${description}", suggest 3-5 specific item names that could be needed. Return only the item names, one per line.`;
    
    const response = await getChatCompletion([
      { role: 'system', content: 'You are a helpful procurement assistant. Suggest specific item names based on descriptions.' },
      { role: 'user', content: prompt }
    ]);

    return response.split('\n').filter(item => item.trim().length > 0).slice(0, 5);
  } catch (error) {
    console.error('Item suggestion error:', error);
    return [];
  }
}