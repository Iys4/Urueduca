import { handleCrud } from './lib/handler';
import { CoursePlan } from './models/Schemas';

export default async function handler(req, res) {
  await handleCrud(req, res, CoursePlan);
}
