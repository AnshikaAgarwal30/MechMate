// demoAccounts.js
// Script to upsert demo accounts: Customer, Test Mechanic, Admin.
// Run with: node backend/demoAccounts.js
require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const User = require('./models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const accounts = [
      {
        name: 'Demo Customer',
        email: 'demo.customer@mechmate.com',
        password: 'Demo@123',
        phone: '9999990000',
        role: 'customer'
      },
      {
        name: 'Demo Mechanic',
        email: 'testmechanic@mechmate.com',
        password: 'Demo@123',
        phone: '9999991111',
        role: 'mechanic',
        address: {
          street: 'Demo Street',
          city: 'Demo City',
          state: 'Demo State',
          zipCode: '000000',
          location: {
            type: 'Point',
            coordinates: [77.0, 28.0]
          }
        },
        mechanicDetails: {
          specialization: ['engine', 'electrical', 'battery'],
          experience: 7,
          isVerified: true,
          isAvailable: true,
          rating: 4.6,
          totalReviews: 18,
          hourlyRate: 800
        }
      },
      {
        name: 'MechMate Admin',
        email: 'admin@mechmate.com',
        password: 'Demo@123',
        phone: '9999999999',
        role: 'admin'
      }
    ];

    for (const acc of accounts) {
      const existing = await User.findOne({ email: acc.email });
      if (existing) {
        // Update existing fields
        existing.name = acc.name;
        existing.password = acc.password; // will be hashed by pre-save hook
        existing.phone = acc.phone;
        existing.role = acc.role;
        if (acc.role === 'mechanic') {
          existing.address = acc.address;
          existing.mechanicDetails = acc.mechanicDetails;
        }
        await existing.save();
        console.log(`✅ Updated ${acc.email}`);
      } else {
        await User.create(acc);
        console.log(`✅ Created ${acc.email}`);
      }
    }

    console.log('\nVerification results:');
    for (const acc of accounts) {
      const user = await User.findOne({ email: acc.email }).lean();
      console.log(`--- ${acc.email} ---`);
      console.log(JSON.stringify(user, null, 2));
    }

    await mongoose.disconnect();
    console.log('✅ Finished');
    process.exit(0);
  } catch (e) {
    console.error('❌ Error:', e);
    process.exit(1);
  }
})();
