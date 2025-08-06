import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export async function getChatCompletion(messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    // Convert messages to Gemini format
    const systemMessage = messages.find(m => m.role === 'system')?.content || '';
    const userMessages = messages.filter(m => m.role === 'user' || m.role === 'assistant');
    
    const prompt = systemMessage + '\n\n' + userMessages.map(m => 
      `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
    ).join('\n');

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    if (!response || !response.text) {
      throw new Error('No response from Gemini API');
    }
    return response.text();
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to get AI response');
  }
}

export async function suggestItemsFromDescription(description: string): Promise<string[]> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Based on this description: "${description}", suggest 3-5 specific item names that could be needed. Return only the item names, one per line.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text.split('\n').filter(item => item.trim().length > 0).slice(0, 5);
  } catch (error) {
    console.error('Item suggestion error:', error);
    return [];
  }
}

export async function extractInvoiceData(imageBase64: string): Promise<{
  invoiceNumber?: string;
  amount?: number;
  vendorName?: string;
  poReference?: string;
  confidence: number;
}> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `Analyze this invoice image and extract the following information in JSON format:
    {
      "invoiceNumber": "string",
      "amount": number,
      "vendorName": "string", 
      "poReference": "string",
      "confidence": number (0-100)
    }
    
    Look for:
    - Invoice number (may be labeled as Invoice #, Inv #, etc.)
    - Total amount (look for total, amount due, etc.)
    - Vendor/company name (usually at the top)
    - PO reference (may be labeled as PO #, Purchase Order, etc.)
    
    Return only valid JSON.`;

    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: 'image/jpeg'
      }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    
    // Try to parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return { confidence: 0 };
  } catch (error) {
    console.error('Invoice OCR Error:', error);
    throw new Error('Failed to extract invoice data');
  }
}

export async function validateInvoiceAgainstPO(invoiceData: any, purchaseOrders: any[]): Promise<{
  isValid: boolean;
  matchedPO?: any;
  anomalies: string[];
}> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `Analyze this invoice against available purchase orders and detect anomalies:
    
    Invoice Data:
    ${JSON.stringify(invoiceData, null, 2)}
    
    Available Purchase Orders:
    ${JSON.stringify(purchaseOrders, null, 2)}
    
    Check for:
    1. Does the invoice match any PO by vendor and approximate amount?
    2. Are there any pricing anomalies (overpriced items)?
    3. Are there duplicate line items?
    4. Does the total amount seem reasonable?
    
    Return JSON format:
    {
      "isValid": boolean,
      "matchedPOId": "string or null",
      "anomalies": ["list of anomaly descriptions"]
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      const matchedPO = analysis.matchedPOId ? 
        purchaseOrders.find(po => po._id === analysis.matchedPOId) : null;
      
      return {
        isValid: analysis.isValid,
        matchedPO,
        anomalies: analysis.anomalies || []
      };
    }
    
    return { isValid: false, anomalies: ['Unable to analyze invoice'] };
  } catch (error) {
    console.error('Invoice validation error:', error);
    return { isValid: false, anomalies: ['Validation failed due to system error'] };
  }
}

export async function querySystemData(question: string, systemData: any): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `You are an ERP system assistant. Answer the user's question based on the provided system data.
    
    System Data:
    ${JSON.stringify(systemData, null, 2)}
    
    User Question: ${question}
    
    Provide a helpful, concise answer based on the data. If you can't find relevant information, say so.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('System query error:', error);
    throw new Error('Failed to process query');
  }
}