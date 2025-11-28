import { NextApiRequest, NextApiResponse } from 'next';
import { signJWT } from '@/lib/security';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, password } = req.body;

  // Simple admin credentials (in production, use proper authentication)
  if (username === 'admin' && password === 'lavish2025') {
    const token = signJWT({
      id: 'admin',
      username: 'admin',
      role: 'admin',
      iat: Math.floor(Date.now() / 1000)
    });

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: 'admin',
        username: 'admin',
        role: 'admin'
      }
    });
  }

  return res.status(401).json({ message: 'Invalid credentials' });
}