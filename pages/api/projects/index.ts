import { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import clientPromise from '../../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || 'solar_naresh');

  switch (req.method) {
    case 'GET':
      try {
        const projects = await db.collection('lavish').find({}).toArray();
        res.status(200).json({ success: true, data: projects });
      } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch projects' });
      }
      break;

    case 'POST':
      try {
        const {
          name,
          client,
          description,
          status,
          progress,
          startDate,
          endDate,
          budget,
          tags
        } = req.body;

        const newProject = {
          name,
          client,
          description,
          status: status || 'Planning',
          progress: progress || 0,
          startDate: startDate || new Date(),
          endDate,
          budget,
          tags: tags || [],
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const result = await db.collection('lavish').insertOne(newProject);
        res.status(201).json({ 
          success: true, 
          data: { ...newProject, _id: result.insertedId } 
        });
      } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to create project' });
      }
      break;

    case 'PUT':
      try {
        const { id, ...updateData } = req.body;
        
        const result = await db.collection('lavish').updateOne(
          { _id: new ObjectId(id as string) },
          { 
            $set: { 
              ...updateData, 
              updatedAt: new Date() 
            } 
          }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ success: false, error: 'Project not found' });
        }

        res.status(200).json({ success: true, message: 'Project updated successfully' });
      } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to update project' });
      }
      break;

    case 'DELETE':
      try {
        const { id } = req.query;
        
        const result = await db.collection('lavish').deleteOne({ _id: new ObjectId(id as string) });

        if (result.deletedCount === 0) {
          return res.status(404).json({ success: false, error: 'Project not found' });
        }

        res.status(200).json({ success: true, message: 'Project deleted successfully' });
      } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to delete project' });
      }
      break;

    default:
      res.status(405).json({ success: false, error: 'Method not allowed' });
      break;
  }
}