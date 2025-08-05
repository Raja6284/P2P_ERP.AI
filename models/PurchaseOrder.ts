import mongoose from 'mongoose';

export interface IPurchaseOrder {
  _id?: string;
  poNumber: string;
  requisitionIds: string[];
  requisitionNumbers: string[];
  vendorName: string;
  vendorEmail?: string;
  items: Array<{
    itemName: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    requisitionId?: string;
    requisitionNumber?: string;
  }>;
  totalAmount: number;
  status: 'pending' | 'in-transit' | 'received' | 'completed';
  createdBy: string;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseOrderSchema = new mongoose.Schema<IPurchaseOrder>({
  poNumber: { type: String, required: true, unique: true },
  requisitionIds: [{ type: String, required: true }],
  requisitionNumbers: [{ type: String, required: true }],
  vendorName: { type: String, required: true },
  vendorEmail: { type: String },
  items: [{
    itemName: { type: String, required: true },
    description: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    requisitionId: { type: String },
    requisitionNumber: { type: String },
  }],
  totalAmount: { type: Number, required: true, min: 0 },
  status: { 
    type: String, 
    enum: ['pending', 'in-transit', 'received', 'completed'],
    default: 'pending'
  },
  createdBy: { type: String, required: true },
  expectedDeliveryDate: { type: Date },
  actualDeliveryDate: { type: Date },
  notes: { type: String },
}, {
  timestamps: true,
});

export default mongoose.models.PurchaseOrder || mongoose.model<IPurchaseOrder>('PurchaseOrder', PurchaseOrderSchema);