import mongoose from 'mongoose';

export interface IRequisitionItem {
  itemName: string;
  description: string;
  quantity: number;
  estimatedPrice: number;
  totalPrice: number;
}

export interface IRequisition {
  _id?: string;
  requisitionNumber: string;
  requesterId: string;
  requesterName: string;
  department: string;
  items: IRequisitionItem[];
  totalAmount: number;
  status: 'pending' | 'approved' | 'rejected';
  managerNotes?: string;
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RequisitionItemSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  description: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  estimatedPrice: { type: Number, required: true, min: 0 },
  totalPrice: { type: Number, required: true, min: 0 },
});

const RequisitionSchema = new mongoose.Schema<IRequisition>({
  requisitionNumber: { type: String, required: true, unique: true },
  requesterId: { type: String, required: true },
  requesterName: { type: String, required: true },
  department: { type: String, required: true },
  items: [RequisitionItemSchema],
  totalAmount: { type: Number, required: true, min: 0 },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  managerNotes: { type: String },
  approvedBy: { type: String },
  approvedAt: { type: Date },
  rejectedBy: { type: String },
  rejectedAt: { type: Date },
}, {
  timestamps: true,
});

export default mongoose.models.Requisition || mongoose.model<IRequisition>('Requisition', RequisitionSchema);