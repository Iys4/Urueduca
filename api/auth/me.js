import dbConnect from '../_lib/mongodb';
import User from '../_models/User';

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  if (method === 'GET') {
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID required' });
      }

      const user = await User.findById(userId);

      if (!user || !user.isActive) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      const userData = {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      };

      return res.status(200).json({ success: true, user: userData });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, error: 'Server error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
