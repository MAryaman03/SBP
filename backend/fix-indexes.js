// Drop stale bookingRef/bookingReference indexes that cause E11000 duplicate key errors
require('dotenv').config();
const mongoose = require('mongoose');

async function fixIndexes() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const indexes = await db.collection('appointments').indexes();
    
    console.log('\n📋 Current indexes:');
    indexes.forEach(idx => console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`));
    
    console.log('\n🔧 Removing problematic indexes...');
    
    // Drop stale bookingRef index (model uses bookingReference, not bookingRef)
    for (const idx of indexes) {
      if (idx.key && (idx.key.bookingRef !== undefined || (idx.key.bookingReference !== undefined && !idx.sparse))) {
        console.log(`  Dropping: ${idx.name}`);
        await db.collection('appointments').dropIndex(idx.name);
        console.log(`    ✓ Dropped`);
      }
    }
    
    console.log('\n✅ Index cleanup complete! Mongoose will recreate proper indexes on next save.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

fixIndexes();
