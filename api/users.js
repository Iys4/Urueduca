import { handleCrud } from './lib/handler';
import { User } from './models/Schemas';

export default async function handler(req, res) {
  await handleCrud(req, res, User);
}
