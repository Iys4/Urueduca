import dbConnect from '../lib/db';
import * as Schemas from '../models/Schemas';
import { mockDb } from '../../src/data/mockDb';

export default async function handler(req, res) {
  if (req.method !== 'POST' && process.env.NODE_ENV === 'production') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();
    console.log('Admin Seed: Connected to DB');

    const results = {};

    // Seed Collections
    const collectionsToSeed = [
      { name: 'User', data: mockDb.users },
      { name: 'Course', data: mockDb.courses },
      { name: 'Student', data: mockDb.students },
      { name: 'CoursePlan', data: mockDb.coursePlans },
      { name: 'Lesson', data: mockDb.lessons },
      { name: 'Evaluation', data: mockDb.evaluations },
      { name: 'CalendarEvent', data: mockDb.manualEvents }
    ];

    for (const { name, data } of collectionsToSeed) {
      const Model = Schemas[name];
      if (Model) {
        await Model.deleteMany({});
        const seededData = data.map(item => ({
          ...item,
          userId: item.userId || item.user_id || 'usr-demo-1'
        }));
        await Model.insertMany(seededData);
        results[name] = `${data.length} items seeded`;
      }
    }

    res.status(200).json({ success: true, results });
  } catch (error) {
    console.error('Seed Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
