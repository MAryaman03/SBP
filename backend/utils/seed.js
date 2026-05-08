/**
 * Seed script — run with: npm run seed
 * Populates the database with initial services and an admin user.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User.model');
const Service = require('../models/Service.model');

const services = [
  { name: 'Signature Haircut & Style', category: 'Hair', description: 'Precision cut and style by our expert stylists tailored to your face shape and preferences.', price: 1200, duration: 60, isFeatured: true, isActive: true },
  { name: 'Balayage & Color', category: 'Hair', description: 'Sun-kissed balayage or full color treatment using premium, ammonia-free dyes.', price: 3500, duration: 120, isFeatured: true, isActive: true },
  { name: 'Keratin Treatment', category: 'Hair', description: 'Luxurious keratin smoothing treatment for frizz-free, silky hair for up to 6 months.', price: 4500, duration: 150, isFeatured: false, isActive: true },
  { name: 'Gold Facial', category: 'Skincare', description: 'Rejuvenating 24K gold facial that brightens, firms, and hydrates for a radiant glow.', price: 2800, duration: 75, isFeatured: true, isActive: true },
  { name: 'Hydrating Facial', category: 'Skincare', description: 'Deep hydration facial with hyaluronic acid and vitamin C serums for dewy skin.', price: 1800, duration: 60, isFeatured: false, isActive: true },
  { name: 'Bridal Makeup', category: 'Bridal', description: 'Complete bridal makeover using luxury brands — airbrush foundation, lashes, and full look.', price: 8000, duration: 180, isFeatured: true, isActive: true },
  { name: 'Bridal Package (Hair + Makeup)', category: 'Bridal', description: 'All-inclusive bridal preparation: hairdo, makeup, draping assistance, and touch-ups.', price: 15000, duration: 300, isFeatured: true, isActive: true },
  { name: 'Gel Nail Art', category: 'Nails', description: 'Long-lasting gel nail extensions with custom nail art designs by our nail artists.', price: 1500, duration: 90, isFeatured: false, isActive: true },
  { name: 'Swedish Massage', category: 'Massage', description: 'Full-body relaxation massage using warm aromatherapy oils for stress relief.', price: 2200, duration: 60, isFeatured: true, isActive: true },
  { name: 'Party Makeup', category: 'Makeup', description: 'Glamorous evening look with contouring, smoky eyes, and long-lasting finish.', price: 3000, duration: 90, isFeatured: false, isActive: true },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing
    await Service.deleteMany({});
    console.log('🗑️  Cleared existing services');

    // Insert services
    await Service.insertMany(services);
    console.log(`✅ Inserted ${services.length} services`);

    // Create admin user if not exists
    const adminExists = await User.findOne({ email: 'admin@snigdhabeautyparlour.com' });
    if (!adminExists) {
      await User.create({
        name: 'Admin',
        email: 'admin@snigdhabeautyparlour.com',
        password: 'Admin@1234',
        role: 'admin',
        phone: '+91-9999999999',
      });
      console.log('✅ Admin user created: admin@snigdhabeautyparlour.com / Admin@1234');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    console.log('\n🎉 Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
};

seed();
