import connectToDatabase from '../lib/db.js';
import { MarketplaceItem } from '../models/Schemas.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env.local') });

async function cleanup() {
  try {
    await connectToDatabase();
    console.log('--- Database Cleanup Started ---');

    // 1. Find all items missing a name/title or with the problematic prefix
    // Prefix: mp-cls-cls-
    const ghostPrefix = /^mp-cls-cls-/;
    
    const results = await MarketplaceItem.find({
      $or: [
        { nombre: { $exists: false } },
        { nombre: "" },
        { nombre: null },
        { id: { $regex: ghostPrefix } }
      ]
    });

    console.log(`Found ${results.length} potentially corrupted entries.`);

    if (results.length > 0) {
      const deleteResult = await MarketplaceItem.deleteMany({
        $or: [
          { nombre: { $exists: false } },
          { nombre: "" },
          { nombre: null },
          { id: { $regex: ghostPrefix } }
        ]
      });
      console.log(`Successfully deleted ${deleteResult.deletedCount} ghost entries.`);
    } else {
      console.log('No ghost entries found to delete.');
    }

    console.log('--- Cleanup Finished ---');
    process.exit(0);
  } catch (error) {
    console.error('Cleanup failed:', error);
    process.exit(1);
  }
}

cleanup();
