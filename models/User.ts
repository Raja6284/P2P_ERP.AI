// import mongoose from 'mongoose';

// export interface IUser {
//   _id?: string;
//   name: string;
//   email: string;
//   password?: string;
//   role: 'requester' | 'manager' | 'store' | 'finance' | 'admin';
//   department?: string;
//   isActive: boolean;
//   createdAt: Date;
//   updatedAt: Date;
// }

// const UserSchema = new mongoose.Schema<IUser>({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String },
//   role: { 
//     type: String, 
//     enum: ['requester', 'manager', 'store', 'finance', 'admin'],
//     required: true,
//     default: 'requester'
//   },
//   department: { type: String },
//   isActive: { type: Boolean, default: true },
// }, {
//   timestamps: true,
// });

// export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);



import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['requester', 'manager', 'store', 'finance', 'admin'],
    required: true,
    default: 'requester',
  },
}, {
  timestamps: true,
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model('User', userSchema);