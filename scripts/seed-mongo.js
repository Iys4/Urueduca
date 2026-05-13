import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { mockDb } from '../src/data/mockDb.js';
import * as Schemas from '../api/models/Schemas.js';

// Read .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = Object.fromEntries(
  envContent.split('\n')
    .filter(line => line.includes('=') && !line.startsWith('#'))
    .map(line => {
      const [key, ...val] = line.trim().split('=');
      return [key, val.join('=')];
    })
);

const MONGODB_URI = envVars.MONGODB_URI;

if (!MONGODB_URI || MONGODB_URI.includes('cluster.mongodb.net')) {
  console.error('ERROR: MONGODB_URI is missing or contains the placeholder "cluster.mongodb.net".');
  console.error('Please update your .env.local with a valid MongoDB Atlas connection string.');
  process.exit(1);
}

async function seed() {
  console.log('Connecting to MongoDB...');
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!');

    // Helper to clear and seed a collection
    const seedCollection = async (modelName, data) => {
      const Model = Schemas[modelName];
      if (!Model) {
        console.warn(`Model ${modelName} not found in Schemas.js`);
        return;
      }
      console.log(`Seeding ${modelName}...`);
      await Model.deleteMany({});
      if (data && data.length > 0) {
        // Map data to match schema if necessary (e.g. adding userId)
        const seededData = data.map(item => ({
          ...item,
          userId: item.userId || item.user_id || 'usr-demo-1'
        }));
        await Model.insertMany(seededData);
        console.log(`Seeded ${data.length} items into ${modelName}.`);
      }
    };

    // 1. Seed Users
    await seedCollection('User', mockDb.users.map(u => ({
      ...u,
      username: u.username || u.name.toLowerCase().replace(/\s+/g, ''),
      passwordHash: '$2a$10$X7vQp1OQY8zP8Gz8Gz8GzO1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q', // "password" hashed
      isActive: true
    })));
    // 8. Seed Modules, Alerts, Teaching Groups
    await seedCollection('Module', mockDb.modules || []);
    await seedCollection('Alert', mockDb.alerts || []);
    await seedCollection('TeachingGroup', mockDb.teachingGroups || []);
    // 2. Seed Courses
    await seedCollection('Course', mockDb.courses);

    // 3. Seed Students
    await seedCollection('Student', mockDb.students);

    // 4. Seed Course Plans
    await seedCollection('CoursePlan', mockDb.coursePlans);

    // 5. Seed Lessons
    await seedCollection('Lesson', mockDb.lessons);

    // 6. Seed Evaluations
    await seedCollection('Evaluation', mockDb.evaluations);

    // 7. Seed Calendar Events
    await seedCollection('CalendarEvent', mockDb.manualEvents);

    console.log('\nSeeding completed successfully!');
  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
