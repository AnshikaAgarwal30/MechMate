// updateDemoDataAndTest.js
// This script updates demo mechanics with varied ratings, experience, specialization, and locations,
// then runs a read‑only recommendation test.

require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const User = require('./models/User');
const { rankMechanics } = require('./utils/recommendationEngine');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected');

    // Update mechanics
    const updates = [
      {
        email: 'rajesh.battery@mechmate.com',
        coords: [77.7060, 28.9850], // very close to customer
        rating: 2.8,
        totalReviews: 8,
        experience: 1,
        specialization: ['battery', 'electrical']
      },
      {
        email: 'amit.engine@mechmate.com',
        coords: [77.95, 28.56], // farther (Hapur area)
        rating: 4.9,
        totalReviews: 120,
        experience: 12,
        specialization: ['engine', 'diagnostics', 'overhaul']
      },
      {
        email: 'vikram.tires@mechmate.com',
        coords: [77.78, 28.80], // moderate distance, matches engine issue
        rating: 4.2,
        totalReviews: 45,
        experience: 5,
        specialization: ['engine', 'tire', 'suspension']
      }
    ];

    for (const u of updates) {
      const res = await User.updateOne({ email: u.email }, {
        $set: {
          'address.location': { type: 'Point', coordinates: u.coords },
          'mechanicDetails.rating': u.rating,
          'mechanicDetails.totalReviews': u.totalReviews,
          'mechanicDetails.experience': u.experience,
          'mechanicDetails.specialization': u.specialization
        }
      });
      console.log(`✅ Updated ${u.email} (${res.modifiedCount} doc)`);
    }

    // Ensure customer location
    const customer = await User.findOne({ role: 'customer' });
    if (customer) {
      customer.address = customer.address || {};
      customer.address.location = { type: 'Point', coordinates: [77.7047, 28.9845] };
      await customer.save();
      console.log('✅ Customer location set');
    }

    // Run recommendation test for an "engine" issue
    const custCoords = customer.address.location.coordinates;
    const mechanics = await User.find({
      role: 'mechanic',
      'mechanicDetails.isVerified': true,
      'mechanicDetails.isAvailable': true
    });
    const ranked = rankMechanics(mechanics, custCoords, 'engine', [], 40);
    const out = ranked.map(r => ({
      name: r.name,
      distanceKm: r.distanceKm,
      matchScore: r.matchScore,
      rating: r.mechanicDetails?.rating,
      experience: r.mechanicDetails?.experience,
      specialization: r.mechanicDetails?.specialization,
      why: r.recommendationReasons
    }));

    console.log('\n=== Recommendation Snapshot ===');
    console.log(JSON.stringify({ customerId: customer._id, customerCoords: custCoords, recommendations: out }, null, 2));

    await mongoose.disconnect();
    console.log('✅ Disconnected');
  } catch (e) {
    console.error('❌ Error', e);
    process.exit(1);
  }
})();
