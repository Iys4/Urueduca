import dbConnect from './lib/db.js';
import { handleCrud } from './lib/handler.js';
import * as Schemas from './models/Schemas.js';
import { mockDb } from '../src/data/mockDb.js';
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
        { name: 'CalendarEvent', data: mockDb.manualEvents },
        { name: 'Module', data: mockDb.modules || [] },
        { name: 'Alert', data: mockDb.alerts || [] },
        { name: 'TeachingGroup', data: mockDb.teachingGroups || [] },
        { name: 'MarketplaceItem', data: mockDb.marketplace || [] }
      ];
      const DEFAULT_HASH = await bcrypt.hash('urueduca', 10);
      for (const { name, data } of collections) {
        const Model = Schemas[name];
        if (Model) {
          await Model.deleteMany({});
          const preparedData = data.map(item => ({ 
            ...item, 
            userId: item.userId || item.user_id || 'usr-demo-1',
            passwordHash: name === 'User' ? (item.passwordHash || DEFAULT_HASH) : undefined
          }));
          await Model.insertMany(preparedData);
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
    const modelMap = {
      'users': Schemas.User,
      'courses': Schemas.Course,
      'students': Schemas.Student,
      'lessons': Schemas.Lesson,
      'evaluations': Schemas.Evaluation,
      'course_plans': Schemas.CoursePlan,
      'calendar_events': Schemas.CalendarEvent,
      'marketplace': Schemas.MarketplaceItem,
      'modules': Schemas.Module,
      'alerts': Schemas.Alert,
      'teaching_groups': Schemas.TeachingGroup
    };

    if (path.startsWith('/api/crud/')) {
      const parts = path.replace('/api/crud/', '').split('/');
      const resource = parts[0];
      const id = parts[1]; // Extract ID if present in path
      const Model = modelMap[resource];
      if (Model) {
        if (id) req.query.id = id; // Inject into req.query for handleCrud
        return await handleCrud(req, res, Model);
      }
    }

    // Default legacy support for /api/[resource]
    const legacyResource = path.replace('/api/', '');
    const Model = modelMap[legacyResource];
    if (Model) return await handleCrud(req, res, Model);

    res.status(404).json({ error: 'Route not found' });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
}
