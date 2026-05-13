import { handleCrud } from './lib/handler';
import { Course } from './models/Schemas';

export default async function handler(req, res) {
  await handleCrud(req, res, Course);
}
