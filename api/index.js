import dbConnect from './lib/db';
import { handleCrud } from './lib/handler';
import * as Schemas from './models/Schemas';
import { mockDb } from '../src/data/mockDb';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  const { url, method } = req;
  const path = url.split('?')[0];

  try {
    await dbConnect();

    // ─── ADMIN SEED ───
    if (path === '/api/admin/seed') {
      const results = {};
      const collections = [
        { name: 'User', data: mockDb.users },
        { name: 'Course', data: mockDb.courses },
        { name: 'Student', data: mockDb.students },
        { name: 'CoursePlan', data: mockDb.coursePlans },
        { name: 'Lesson', data: mockDb.lessons },
        { name: 'Evaluation', data: mockDb.evaluations },
        { name: 'CalendarEvent', data: mockDb.manualEvents }
      ];
      for (const { name, data } of collections) {
        const Model = Schemas[name];
        if (Model) {
          await Model.deleteMany({});
          await Model.insertMany(data.map(item => ({ ...item, userId: item.userId || item.user_id || 'usr-demo-1' })));
          results[name] = 'seeded';
        }
      }
      return res.status(200).json({ success: true, results });
    }

    // ─── AUTH ───
    if (path.startsWith('/api/auth/')) {
      const action = path.replace('/api/auth/', '');
      const { User } = Schemas;

      if (action === 'register' && method === 'POST') {
        const { username, email, password } = req.body;
        const passwordHash = await bcrypt.hash(password, 10);
        const user = await User.create({ username, email, passwordHash });
        return res.status(201).json({ success: true, user: { id: user._id, username, email, role: user.role } });
      }

      if (action === 'login' && method === 'POST') {
        const { identifier, password } = req.body;
        const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] });
        if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ error: 'Invalid credentials' });
        return res.status(200).json({ success: true, user: { id: user._id, username: user.username, email: user.email, role: user.role } });
      }

      if (action === 'me' && method === 'GET') {
        const user = await User.findById(req.query.userId);
        if (!user) return res.status(404).json({ error: 'Not found' });
        return res.status(200).json({ success: true, user: { id: user._id, username: user.username, email: user.email, role: user.role } });
      }
    }

    // ─── CRUD ───
    if (path.startsWith('/api/crud/')) {
      const resource = path.replace('/api/crud/', '');
      const modelMap = {
        'users': Schemas.User,
        'courses': Schemas.Course,
        'students': Schemas.Student,
        'lessons': Schemas.Lesson,
        'evaluations': Schemas.Evaluation,
        'course_plans': Schemas.CoursePlan,
        'calendar_events': Schemas.CalendarEvent,
        'marketplace': Schemas.MarketplaceItem
      };
      const Model = modelMap[resource];
      if (Model) return await handleCrud(req, res, Model);
    }

    // Default legacy support for /api/[resource] if needed
    const legacyResource = path.replace('/api/', '');
    const modelMap = {
      'users': Schemas.User,
      'courses': Schemas.Course,
      'students': Schemas.Student,
      'lessons': Schemas.Lesson,
      'evaluations': Schemas.Evaluation,
      'course_plans': Schemas.CoursePlan,
      'calendar_events': Schemas.CalendarEvent,
      'marketplace': Schemas.MarketplaceItem
    };
    const Model = modelMap[legacyResource];
    if (Model) return await handleCrud(req, res, Model);

    res.status(404).json({ error: 'Route not found' });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
}
