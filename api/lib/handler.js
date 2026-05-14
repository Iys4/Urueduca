import connectToDatabase from './db.js';

export async function handleCrud(req, res, Model) {
  const { method } = req;
  const { id, userId } = req.query;

  await connectToDatabase();

  switch (method) {
    case 'GET':
      try {
        if (id) {
          const item = await Model.findOne({ id, userId });
          return res.status(200).json(item);
        }
        
        // Build query from remaining query parameters
        const query = { ...req.query };
        delete query.id;
        // Keep userId in query if provided
        
        const items = await Model.find(query);
        res.status(200).json(items);
      } catch (error) {
        console.error(`Error in GET ${req.url}:`, error);
        res.status(500).json({ success: false, error: error.message, stack: error.stack });
      }
      break;

    case 'POST':
      try {
        const body = req.body;

        // Validation: Prevent "Ghost" entries with no content
        // We check for 'nombre' or 'title' (frontend sometimes uses 'title' before schema mapping)
        const nameField = body.nombre || body.title || body.name;
        const modelName = Model.modelName;

        if (!nameField && (modelName === 'MarketplaceItem' || modelName === 'Course' || modelName === 'CoursePlan')) {
          console.warn(`Blocking empty ${modelName} entry:`, body.id);
          return res.status(400).json({ success: false, error: 'Cannot create an entry without a name or title' });
        }

        // Check if exists for upsert behavior like IndexedDB put()
        const existing = await Model.findOne({ id: body.id });
        if (existing) {
          Object.assign(existing, body);
          await existing.save();
          return res.status(200).json(existing);
        }
        const newItem = await Model.create(body);
        res.status(201).json(newItem);
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'PUT':
        try {
            const doc = await Model.findOne(userId ? { id: id, userId: userId } : { id: id });
            if (!doc) {
                return res.status(404).json({ success: false, error: 'Document not found' });
            }
            const body = req.body;
            Object.keys(body).forEach(key => {
                doc[key] = body[key];
                // Mark Mixed/nested fields as modified so Mongoose persists them
                if (Array.isArray(body[key]) || (typeof body[key] === 'object' && body[key] !== null)) {
                    doc.markModified(key);
                }
            });
            await doc.save();
            res.status(200).json(doc);
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
        break;

    case 'DELETE':
      try {
        await Model.deleteOne({ id, userId });
        res.status(200).json({ success: true });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
