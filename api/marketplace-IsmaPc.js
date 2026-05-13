import { handleCrud } from './lib/handler';
import { MarketplaceItem } from './models/Schemas';

export default async function handler(req, res) {
  await handleCrud(req, res, MarketplaceItem);
}
