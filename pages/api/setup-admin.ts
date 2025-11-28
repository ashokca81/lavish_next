import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'solar_naresh');

    // Check if admin already exists
    const existingAdmin = await db.collection('lavish_admin').findOne({ 
      email: 'lavishstarsoft@gmail.com' 
    });

    if (existingAdmin) {
      return res.status(200).json({ 
        success: true, 
        message: 'Admin user already exists',
        admin: {
          email: existingAdmin.email,
          name: existingAdmin.name,
          role: existingAdmin.role,
          createdAt: existingAdmin.createdAt
        }
      });
    }

    // Create the admin user
    const adminUser = {
      email: 'lavishstarsoft@gmail.com',
      password: 'Lavish@AS', // In production, this should be hashed
      name: 'Lavishstar Admin',
      role: 'admin',
      status: 'active',
      isActive: true,
      createdAt: new Date(),
      lastLogin: null,
      lastLoginIP: null
    };

    const result = await db.collection('lavish_admin').insertOne(adminUser);

    res.status(200).json({ 
      success: true, 
      message: 'Admin user created successfully',
      admin: {
        id: result.insertedId,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
        createdAt: adminUser.createdAt
      }
    });

  } catch (error) {
    console.error('Setup admin error:', error);
    
    // More detailed error information for debugging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error name:', error.name);
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      mongoUri: process.env.MONGODB_URI ? 'URI is set' : 'URI is missing',
      mongoDB: process.env.MONGODB_DB || 'solar_naresh'
    });
  }
}