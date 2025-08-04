import Tesseract from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
  invoiceNumber?: string;
  amount?: number;
  date?: string;
  vendor?: string;
}

export async function extractTextFromImage(imageFile: File): Promise<OCRResult> {
  try {
    const { data } = await Tesseract.recognize(imageFile, 'eng', {
      logger: m => console.log(m)
    });

    const text = data.text;
    const confidence = data.confidence;

    // Extract invoice number (looking for patterns like INV-123, Invoice #123, etc.)
    const invoiceNumberRegex = /(?:invoice|inv)[\s#-]*(\w+)/i;
    const invoiceNumberMatch = text.match(invoiceNumberRegex);
    const invoiceNumber = invoiceNumberMatch ? invoiceNumberMatch[1] : undefined;

    // Extract amount (looking for currency patterns)
    const amountRegex = /(?:\$|USD|€|EUR)\s*(\d+(?:\.\d{2})?)/i;
    const amountMatch = text.match(amountRegex);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : undefined;

    // Extract date (looking for date patterns)
    const dateRegex = /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/;
    const dateMatch = text.match(dateRegex);
    const date = dateMatch ? dateMatch[1] : undefined;

    // Extract vendor name (first line that looks like a company name)
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const vendor = lines.find(line => 
      line.length > 3 && 
      line.length < 50 && 
      !/^\d+$/.test(line) &&
      !line.includes('$') &&
      !line.includes('Invoice')
    );

    return {
      text,
      confidence,
      invoiceNumber,
      amount,
      date,
      vendor: vendor?.trim(),
    };
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Failed to extract text from image');
  }
}