import mongoose from 'mongoose';

export interface IInvoice {
  _id?: string;
  invoiceNumber: string;
  poId?: string;
  poNumber?: string;
  vendorName: string;
  amount: number;
  invoiceDate: Date;
  dueDate: Date;
  status: 'pending' | 'approved' | 'paid' | 'overdue';
  uploadedBy: string;
  filePath?: string;
  ocrExtracted: boolean;
  extractedData?: {
    confidence: number;
    rawText: string;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new mongoose.Schema<IInvoice>({
  invoiceNumber: { type: String, required: true },
  poId: { type: String },
  poNumber: { type: String },
  vendorName: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  invoiceDate: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'paid', 'overdue'],
    default: 'pending'
  },
  uploadedBy: { type: String, required: true },
  filePath: { type: String },
  ocrExtracted: { type: Boolean, default: false },
  extractedData: {
    confidence: { type: Number },
    rawText: { type: String },
  },
  notes: { type: String },
}, {
  timestamps: true,
});

export default mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);