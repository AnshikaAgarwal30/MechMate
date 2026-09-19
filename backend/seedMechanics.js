const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const sampleMechanics = [
  {
    name: 'Rajesh Kumar (Auto Electrician)',
    email: 'rajesh.battery@mechmate.com',
    password: 'Password@123',
    phone: '+91 98765 43210',
    role: 'mechanic',
    address: {
      street: 'Shop 14, Sector 18 Market',
      city: 'Noida',
      state: 'Uttar Pradesh',
      zipCode: '201301',
      location: {
        type: 'Point',
        coordinates: [77.3245, 28.5708] // Longitude, Latitude near Noida / Delhi NCR
      }
    },
    mechanicDetails: {
      specialization: ['battery', 'electrical', 'starter', 'alternator', 'diagnostics'],
      experience: 9,
      licenseNumber: 'DL-MECH-2015-8821',
      isVerified: true,
      isAvailable: true,
      rating: 4.9,
      totalReviews: 38,
      hourlyRate: 500
    }
  },
  {
    name: 'Amit Sharma (Engine Master)',
    email: 'amit.engine@mechmate.com',
    password: 'Password@123',
    phone: '+91 98111 22334',
    role: 'mechanic',
    address: {
      street: 'Plot 45, Industrial Area Phase 1',
      city: 'New Delhi',
      state: 'Delhi',
      zipCode: '110020',
      location: {
        type: 'Point',
        coordinates: [77.2750, 28.5355] // Longitude, Latitude near Okhla / South Delhi
      }
    },
    mechanicDetails: {
      specialization: ['engine', 'engine repair', 'overhaul', 'cooling system', 'mechanical'],
      experience: 12,
      licenseNumber: 'DL-MECH-2012-4019',
      isVerified: true,
      isAvailable: true,
      rating: 4.8,
      totalReviews: 54,
      hourlyRate: 650
    }
  },
  {
    name: 'Vikram Singh (Tire & Suspension Hub)',
    email: 'vikram.tires@mechmate.com',
    password: 'Password@123',
    phone: '+91 98222 33445',
    role: 'mechanic',
    address: {
      street: 'Service Lane, NH-24 Bypass',
      city: 'Ghaziabad',
      state: 'Uttar Pradesh',
      zipCode: '201009',
      location: {
        type: 'Point',
        coordinates: [77.3620, 28.6280] // Longitude, Latitude near Indirapuram
      }
    },
    mechanicDetails: {
      specialization: ['tire', 'tyre', 'flat tire', 'wheel alignment', 'suspension', 'brakes'],
      experience: 7,
      licenseNumber: 'UP-MECH-2017-9102',
      isVerified: true,
      isAvailable: true,
      rating: 4.7,
      totalReviews: 29,
      hourlyRate: 400
    }
  },
  {
    name: 'Suresh Patel (Express Roadside Rescue)',
    email: 'suresh.rescue@mechmate.com',
    password: 'Password@123',
    phone: '+91 98333 44556',
    role: 'mechanic',
    address: {
      street: 'Main Road, Sector 62',
      city: 'Noida',
      state: 'Uttar Pradesh',
      zipCode: '201309',
      location: {
        type: 'Point',
        coordinates: [77.3655, 28.6255]
      }
    },
    mechanicDetails: {
      specialization: ['fuel', 'fuel delivery', 'towing', 'general', 'battery', 'jump start'],
      experience: 5,
      licenseNumber: 'UP-MECH-2019-3382',
      isVerified: true,
      isAvailable: true,
      rating: 4.6,
      totalReviews: 22,
      hourlyRate: 450
    }
  }
];

async function seedMechanics() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    for (const mechData of sampleMechanics) {
      const existing = await User.findOne({ email: mechData.email });
      if (!existing) {
        await User.create(mechData);
        console.log(`Created mechanic: ${mechData.name} (${mechData.email})`);
      } else {
        // Update details and verified status
        existing.mechanicDetails = mechData.mechanicDetails;
        existing.address = mechData.address;
        await existing.save();
        console.log(`Updated mechanic: ${mechData.name}`);
      }
    }

    console.log('Mechanic seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding mechanics:', err);
    process.exit(1);
  }
}

seedMechanics();
