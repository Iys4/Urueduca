import { handleCrud } from './lib/handler';
import { Evaluation } from './models/Schemas';

export default async function handler(req, res) {
  await handleCrud(req, res, Evaluation);
}
