import { handleCrud } from './lib/handler';
import { Lesson } from './models/Schemas';

export default async function handler(req, res) {
  await handleCrud(req, res, Lesson);
}
