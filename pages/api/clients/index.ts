import { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import clientPromise from '../../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || 'solar_naresh');

  switch (req.method) {
    case 'GET':
      try {
        const clients = await db.collection('lavish_clients').find({}).toArray();
        res.status(200).json({ success: true, data: clients });
      } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch clients' });
      }
      break;

    case 'POST':
      try {
        const {
          name,
          email,
          phone,
          company,
          industry,
          address,
          projects
        } = req.body;

        const newClient = {
          name,
          email,
          phone,
          company,
          industry,
          address,
          projects: projects || [],
          totalProjects: 0,
          totalRevenue: 0,
          status: 'Active',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const result = await db.collection('lavish_clients').insertOne(newClient);
        res.status(201).json({ 
          success: true, 
          data: { ...newClient, _id: result.insertedId } 
        });
      } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to create client' });
      }
      break;

    case 'PUT':
      try {
        const { id, ...updateData } = req.body;
        
        const result = await db.collection('lavish_clients').updateOne(
          { _id: new ObjectId(id as string) },
          { 
            $set: { 
              ...updateData, 
              updatedAt: new Date() 
            } 
          }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ success: false, error: 'Client not found' });
        }

        res.status(200).json({ success: true, message: 'Client updated successfully' });
      } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to update client' });
      }
      break;

    case 'DELETE':
      try {
        const { id } = req.query;
        
        const result = await db.collection('lavish_clients').deleteOne({ _id: new ObjectId(id as string) });

        if (result.deletedCount === 0) {
          return res.status(404).json({ success: false, error: 'Client not found' });
        }

        res.status(200).json({ success: true, message: 'Client deleted successfully' });
      } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to delete client' });
      }
      break;

    default:
      res.status(405).json({ success: false, error: 'Method not allowed' });
      break;
  }
}