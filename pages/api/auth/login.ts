import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and password are required' 
      });
    }

    const client = await clientPromise;
    const db = client.db('lavish'); // Use lavish database

    // Check if admin user exists in admin_credentials collection
    let admin = await db.collection('admin_credentials').findOne({ email });

    // If admin doesn't exist, create the default admin in lavish database
    if (!admin && email === 'lavishstarsoft@gmail.com' && password === 'Lavish@AS') {
      const defaultAdmin = {
        email: 'lavishstarsoft@gmail.com',
        password: 'Lavish@AS',
        name: 'Lavishstar Admin',
        role: 'admin',
        status: 'active',
        isActive: true,
        permissions: ['dashboard', 'content', 'projects', 'users'],
        createdAt: new Date(),
        lastLogin: new Date()
      };
      
      await db.collection('admin_credentials').insertOne(defaultAdmin);
      admin = await db.collection('admin_credentials').findOne({ email: 'lavishstarsoft@gmail.com' });
    }

    // Verify credentials
    if (!admin || admin.email !== email || admin.password !== password) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid email or password' 
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(401).json({ 
        success: false, 
        error: 'Account is disabled' 
      });
    }

    // Update last login
    await db.collection('admin_credentials').updateOne(
      { email },
      { 
        $set: { 
          lastLogin: new Date(),
          lastLoginIP: req.headers['x-forwarded-for'] || req.connection.remoteAddress
        } 
      }
    );

    // Generate session token
    const sessionToken = `lavish_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store session in user_sessions collection
    await db.collection('user_sessions').insertOne({
      sessionToken,
      email,
      userId: admin._id,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });

    res.status(200).json({ 
      success: true, 
      message: 'Login successful to lavish database',
      database: 'lavish',
      user: {
        email: admin.email,
        name: admin.name,
        role: admin.role,
        permissions: admin.permissions || ['dashboard', 'content', 'projects']
      },
      sessionToken
    });

  } catch (error) {
    console.error('Login error:', error);
    
    // Provide more detailed error information for debugging
    let errorMessage = 'Internal server error';
    if (error instanceof Error) {
      if (error.message.includes('bad auth')) {
        errorMessage = 'Database authentication failed. Please check MongoDB credentials.';
      } else if (error.message.includes('connection')) {
        errorMessage = 'Database connection failed. Please check MongoDB URI.';
      }
    }
    
    res.status(500).json({ 
      success: false, 
      error: errorMessage,
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}