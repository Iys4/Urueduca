import dbConnect from '../_lib/mongodb';
import User from '../_models/User';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  if (method === 'POST') {
    try {
      const { identifier, password } = req.body;

      if (!identifier || !password) {
        return res.status(400).json({ success: false, error: 'Faltan credenciales' });
      }

      // Find user by email or username
      const user = await User.findOne({
        $or: [{ email: identifier }, { username: identifier }]
      });

      if (!user) {
        return res.status(401).json({ success: false, error: 'Credenciales inválidas' });
      }

      if (!user.isActive) {
        return res.status(403).json({ success: false, error: 'Cuenta desactivada' });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);

      if (!isMatch) {
        return res.status(401).json({ success: false, error: 'Credenciales inválidas' });
      }

      // Update last login
      user.lastLoginAt = new Date();
      await user.save();

      // Return user data (omit passwordHash)
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
      return res.status(500).json({ success: false, error: 'Error del servidor' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
