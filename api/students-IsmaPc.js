import { handleCrud } from './lib/handler';
import { Student } from './models/Schemas';

export default async function handler(req, res) {
  await handleCrud(req, res, Student);
}
