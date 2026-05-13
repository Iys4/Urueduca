import { handleCrud } from '../lib/handler';
import * as Schemas from '../models/Schemas';

export default async function handler(req, res) {
  const { resource } = req.query;
  
  // Map resource names to Models
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

  if (!Model) {
    return res.status(404).json({ error: `Resource ${resource} not found` });
  }

  await handleCrud(req, res, Model);
}
