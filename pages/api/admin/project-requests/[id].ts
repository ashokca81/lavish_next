import { NextApiRequest, NextApiResponse } from 'next';
import { connectToMongoDB } from '@/lib/mongodb';
import { verifyJWT } from '@/lib/security';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Verify admin authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = verifyJWT(token);
    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { id } = req.query;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({ message: 'Project request ID is required' });
    }

    // Remove _id and other immutable fields from updateData
    const { _id, createdAt, submittedAt, ...sanitizedUpdateData } = updateData;

    const db = await connectToMongoDB();
    
    // Update the project request
    const result = await db.collection('projectRequests').updateOne(
      { _id: new ObjectId(id as string) },
      { 
        $set: {
          ...sanitizedUpdateData,
          updatedAt: new Date(),
          lastUpdatedBy: decoded.username || 'admin'
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Project request not found' });
    }

    // Log the update action
    await db.collection('adminLogs').insertOne({
      action: 'UPDATE_PROJECT_REQUEST',
      details: {
        requestId: id,
        updatedFields: Object.keys(updateData),
        updatedBy: decoded.username || 'admin'
      },
      timestamp: new Date(),
      source: 'admin_panel'
    });

    res.status(200).json({ 
      success: true, 
      message: 'Project request updated successfully' 
    });

  } catch (error) {
    console.error('Error updating project request:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
    });
  }
}