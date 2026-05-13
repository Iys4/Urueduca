import { handleCrud } from './lib/handler';
import { CalendarEvent } from './models/Schemas';

export default async function handler(req, res) {
  await handleCrud(req, res, CalendarEvent);
}
