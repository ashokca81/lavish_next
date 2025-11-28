import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // For now, just validate against hardcoded credentials
    // This bypasses MongoDB issues temporarily
    if (email === 'lavishstarsoft@gmail.com' && password === 'Lavish@AS') {
      
      // Generate a simple session token
      const sessionToken = `lavish_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return res.status(200).json({ 
        success: true, 
        message: 'Login successful',
        user: {
          email: 'lavishstarsoft@gmail.com',
          name: 'Lavishstar Admin',
          role: 'admin'
        },
        token: sessionToken
      });
    } else {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid email or password' 
      });
    }

  } catch (error) {
    console.error('Simple login error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}