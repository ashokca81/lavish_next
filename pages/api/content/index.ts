import { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import clientPromise from '../../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || 'solar_naresh');

  switch (req.method) {
    case 'GET':
      try {
        const { type } = req.query;
        const query = type ? { type } : {};
        const content = await db.collection('lavish_content').find(query).toArray();
        res.status(200).json({ success: true, data: content });
      } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch content' });
      }
      break;

    case 'POST':
      try {
        const {
          type,
          section,
          title,
          content,
          imageUrl,
          linkUrl,
          metadata,
          isActive
        } = req.body;

        const newContent = {
          type, // 'logo', 'hero', 'service', 'footer', 'contact', 'about'
          section, // specific section within type
          title,
          content,
          imageUrl,
          linkUrl,
          metadata: metadata || {},
          isActive: isActive !== undefined ? isActive : true,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const result = await db.collection('lavish_content').insertOne(newContent);
        res.status(201).json({ 
          success: true, 
          data: { ...newContent, _id: result.insertedId } 
        });
      } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to create content' });
      }
      break;

    case 'PUT':
      try {
        const { id, ...updateData } = req.body;
        
        const result = await db.collection('lavish_content').updateOne(
          { _id: new ObjectId(id as string) },
          { 
            $set: { 
              ...updateData, 
              updatedAt: new Date() 
            } 
          }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ success: false, error: 'Content not found' });
        }

        res.status(200).json({ success: true, message: 'Content updated successfully' });
      } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to update content' });
      }
      break;

    case 'DELETE':
      try {
        const { id } = req.query;
        
        const result = await db.collection('lavish_content').deleteOne({ 
          _id: new ObjectId(id as string) 
        });

        if (result.deletedCount === 0) {
          return res.status(404).json({ success: false, error: 'Content not found' });
        }

        res.status(200).json({ success: true, message: 'Content deleted successfully' });
      } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to delete content' });
      }
      break;

    default:
      res.status(405).json({ success: false, error: 'Method not allowed' });
      break;
  }
}