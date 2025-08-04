const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI , {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User Schema (simplified for seeding)
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  department: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

async function seedUsers() {
  try {
    // Clear existing users
    await User.deleteMany({});

    // Create demo users
    const users = [
      {
        name: 'Admin User',
        email: 'admin@demo.com',
        password: await bcrypt.hash('admin123', 12),
        role: 'admin',
        department: 'IT',
      },
      {
        name: 'Manager User',
        email: 'manager@demo.com',
        password: await bcrypt.hash('manager123', 12),
        role: 'manager',
        department: 'Operations',
      },
      {
        name: 'Finance User',
        email: 'finance@demo.com',
        password: await bcrypt.hash('finance123', 12),
        role: 'finance',
        department: 'Finance',
      },
      {
        name: 'Store User',
        email: 'store@demo.com',
        password: await bcrypt.hash('store123', 12),
        role: 'store',
        department: 'Procurement',
      },
      {
        name: 'Requester User',
        email: 'requester@demo.com',
        password: await bcrypt.hash('requester123', 12),
        role: 'requester',
        department: 'Marketing',
      },
    ];

    await User.insertMany(users);
    console.log('✅ Demo users created successfully!');
    console.log('Login credentials:');
    users.forEach(user => {
      console.log(`${user.role}: ${user.email} / ${user.email.split('@')[0]}123`);
    });

  } catch (error) {
    console.error('❌ Error seeding users:', error);
  } finally {
    mongoose.connection.close();
  }
}

seedUsers();
