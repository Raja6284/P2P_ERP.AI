import mongoose from 'mongoose';

export interface IPayment {
  _id?: string;
  paymentNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: 'bank_transfer' | 'check' | 'credit_card' | 'cash';
  status: 'pending' | 'completed' | 'failed';
  referenceNumber?: string;
  processedBy: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new mongoose.Schema<IPayment>({
  paymentNumber: { type: String, required: true, unique: true },
  invoiceId: { type: String, required: true },
  invoiceNumber: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  paymentDate: { type: Date, required: true },
  paymentMethod: { 
    type: String, 
    enum: ['bank_transfer', 'check', 'credit_card', 'cash'],
    required: true
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  referenceNumber: { type: String },
  processedBy: { type: String, required: true },
  notes: { type: String },
}, {
  timestamps: true,
});

export default mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);