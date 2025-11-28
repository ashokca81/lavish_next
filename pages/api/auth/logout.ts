import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { sessionToken } = req.body;

    if (!sessionToken) {
      return res.status(400).json({ 
        success: false, 
        error: 'Session token is required' 
      });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'solar_naresh');

    // Remove session from database
    await db.collection('lavish_sessions').deleteOne({ sessionToken });

    res.status(200).json({ 
      success: true, 
      message: 'Logout successful' 
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}