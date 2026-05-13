import dbConnect from '../lib/db';
import { User } from '../models/Schemas';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  const { action } = req.query;
  const { method } = req;

  try {
    await dbConnect();

    // ─── REGISTER ───
    if (action === 'register' && method === 'POST') {
      const { username, email, password } = req.body;
      if (!username || !email || !password) return res.status(400).json({ error: 'Faltan campos' });

      const userExists = await User.findOne({ $or: [{ email }, { username }] });
      if (userExists) return res.status(400).json({ error: 'Usuario ya existe' });

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      const user = await User.create({ username, email, passwordHash });

      return res.status(201).json({ success: true, user: { id: user._id, username, email, role: user.role } });
    }

    // ─── LOGIN ───
    if (action === 'login' && method === 'POST') {
      const { identifier, password } = req.body;
      const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] });
      if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }
      user.lastLoginAt = new Date();
      await user.save();
      return res.status(200).json({ success: true, user: { id: user._id, username: user.username, email: user.email, role: user.role } });
    }

    // ─── ME ───
    if (action === 'me' && method === 'GET') {
      const { userId } = req.query;
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: 'No encontrado' });
      return res.status(200).json({ success: true, user: { id: user._id, username: user.username, email: user.email, role: user.role } });
    }

    return res.status(404).json({ error: 'Acción no encontrada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
