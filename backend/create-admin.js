require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User.model');

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const adminEmail = 'admin@sbp.com';
    const adminPassword = 'admin!@#$%';

    // Check if user exists
    let admin = await User.findOne({ email: adminEmail });

    if (admin) {
      // Update existing user to admin
      admin.role = 'admin';
      admin.password = adminPassword; // This will trigger the pre-save hook to hash the new password
      await admin.save();
      console.log('✅ Updated existing user to Admin.');
    } else {
      // Create new admin user
      admin = await User.create({
        name: 'Snigdha Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        isVerified: true,
      });
      console.log('✅ Created new Admin user.');
    }

    console.log('\n--- Admin Credentials ---');
    console.log(`Email:    ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('-------------------------\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createAdmin();
