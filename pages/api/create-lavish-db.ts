import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('lavish'); // Explicitly use 'lavish' database

    // Check if admin already exists
    const existingAdmin = await db.collection('admin_credentials').findOne({ 
      email: 'lavishstarsoft@gmail.com' 
    });

    if (existingAdmin) {
      return res.status(200).json({ 
        success: true, 
        message: 'Admin credentials already exist in lavish database',
        database: 'lavish',
        admin: {
          email: existingAdmin.email,
          name: existingAdmin.name,
          role: existingAdmin.role,
          createdAt: existingAdmin.createdAt
        }
      });
    }

    // Create admin credentials in lavish database
    const adminCredentials = {
      email: 'lavishstarsoft@gmail.com',
      password: 'Lavish@AS',
      name: 'Lavishstar Admin',
      role: 'admin',
      status: 'active',
      isActive: true,
      permissions: ['dashboard', 'content', 'projects', 'users'],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null,
      lastLoginIP: null,
      sessionToken: null
    };

    // Insert admin credentials
    const result = await db.collection('admin_credentials').insertOne(adminCredentials);

    // Also create collections structure for lavish database
    await db.collection('website_content').insertOne({
      type: 'setup',
      message: 'Lavish database initialized',
      createdAt: new Date()
    });

    await db.collection('projects').insertOne({
      name: 'Sample Project',
      description: 'Initial project for lavish database',
      status: 'setup',
      createdAt: new Date()
    });

    await db.collection('user_sessions').insertOne({
      sessionType: 'initialization',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    res.status(200).json({ 
      success: true, 
      message: 'Lavish database and admin credentials created successfully',
      database: 'lavish',
      collections_created: ['admin_credentials', 'website_content', 'projects', 'user_sessions'],
      admin: {
        id: result.insertedId,
        email: adminCredentials.email,
        name: adminCredentials.name,
        role: adminCredentials.role,
        permissions: adminCredentials.permissions,
        createdAt: adminCredentials.createdAt
      }
    });

  } catch (error) {
    console.error('Create lavish database error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create lavish database',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}