import dbConnect from '../_lib/mongodb';
import User from '../_models/User';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  if (method === 'POST') {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ success: false, error: 'Faltan campos obligatorios' });
      }

      // Check if user already exists
      const userExists = await User.findOne({
        $or: [{ email }, { username }]
      });

      if (userExists) {
        return res.status(400).json({ 
          success: false, 
          error: userExists.email === email ? 'El email ya está en uso' : 'El nombre de usuario ya está en uso' 
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = await User.create({
        username,
        email,
        passwordHash,
      });

      const userData = {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      };

      return res.status(201).json({ success: true, user: userData });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, error: 'Error al registrar usuario' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
