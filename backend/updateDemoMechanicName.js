// updateDemoMechanicName.js
// Updates the display name of the existing demo mechanic account.
// Usage: node backend/updateDemoMechanicName.js
require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const User = require('./models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const email = 'testmechanic@mechmate.com';
    const newName = 'Demo Mechanic';

    const user = await User.findOne({ email });
    if (!user) {
      console.error('❌ User not found:', email);
      process.exit(1);
    }

    // Only update the name field
    user.name = newName;
    await user.save();
    console.log('✅ Updated name for', email);
    console.log('New user doc:', user);

    await mongoose.disconnect();
    console.log('✅ Disconnected');
    process.exit(0);
  } catch (e) {
    console.error('❌ Error:', e);
    process.exit(1);
  }
})();
