import { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import clientPromise from '../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const {
      name,
      email,
      phone,
      company,
      service,
      budget,
      message,
      type = 'contact' // 'contact' or 'enquiry'
    } = req.body;

    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name, email, and message are required' 
      });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'solar_naresh');

    const formSubmission = {
      type,
      name,
      email,
      phone: phone || '',
      company: company || '',
      service: service || '',
      budget: budget || '',
      message,
      status: 'new',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('lavish_form_submissions').insertOne(formSubmission);

    // You can add email notification logic here
    
    res.status(201).json({ 
      success: true, 
      message: 'Form submitted successfully',
      id: result.insertedId
    });

  } catch (error) {
    console.error('Form submission error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to submit form' 
    });
  }
}