const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const existingAdmin = await User.findOne({
      email: 'admin@mechmate.com'
    });

    if (existingAdmin) {
      console.log('Admin already exists');
      process.exit(0);
    }

    const admin = await User.create({
      name: 'MechMate Admin',
      email: 'admin@mechmate.com',
      password: 'Admin@123',
      phone: '9999999999',
      role: 'admin'
    });

    console.log('Admin created successfully');
    console.log('Email: admin@mechmate.com');
    console.log('Password: Admin@123');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdmin();