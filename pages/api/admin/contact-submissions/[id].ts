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

    const db = await connectToMongoDB();
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Invalid submission ID' });
    }

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid submission ID format' });
    }

    // Get the current submission to ensure it exists
    const existingSubmission = await db.collection('contactSubmissions').findOne({ _id: new ObjectId(id) });
    if (!existingSubmission) {
      return res.status(404).json({ message: 'Contact submission not found' });
    }

    // Extract fields that can be updated (exclude immutable fields)
    const {
      _id,
      submittedAt,
      createdAt,
      ...updateFields
    } = req.body;

    // Add update timestamp
    const updateData = {
      ...updateFields,
      updatedAt: new Date()
    };

    console.log('📝 Updating contact submission:', {
      id,
      updateData,
      originalStatus: existingSubmission.status
    });

    // Update the submission
    const result = await db.collection('contactSubmissions').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Contact submission not found' });
    }

    if (result.modifiedCount === 0) {
      console.log('⚠️ No fields were modified');
      return res.status(200).json({ 
        message: 'No changes made',
        submissionId: id 
      });
    }

    // Log the update for admin tracking
    await db.collection('adminLogs').insertOne({
      action: 'UPDATE_CONTACT_SUBMISSION',
      details: {
        submissionId: id,
        adminId: decoded.id,
        updatedFields: Object.keys(updateData),
        oldStatus: existingSubmission.status,
        newStatus: updateData.status || existingSubmission.status
      },
      timestamp: new Date(),
      source: 'admin_dashboard',
      ipAddress: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress
    });

    console.log('✅ Contact submission updated successfully:', {
      id,
      modifiedCount: result.modifiedCount
    });

    res.status(200).json({ 
      message: 'Contact submission updated successfully',
      submissionId: id,
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('💥 Error updating contact submission:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
}