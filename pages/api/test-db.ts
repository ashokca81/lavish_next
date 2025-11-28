import { NextApiRequest, NextApiResponse } from 'next';
import { connectToMongoDB } from '@/lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const db = await connectToMongoDB();
    
    // Test insert
    const testDoc = {
      test: true,
      timestamp: new Date(),
      message: 'Database connection test'
    };
    
    const result = await db.collection('test').insertOne(testDoc);
    
    // Test read
    const count = await db.collection('contactSubmissions').countDocuments();
    
    res.status(200).json({ 
      success: true,
      message: 'Database connection successful',
      testInsertId: result.insertedId,
      contactSubmissionsCount: count,
      database: db.databaseName
    });

  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Database connection failed',
      error: error.message 
    });
  }
}