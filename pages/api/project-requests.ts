import { NextApiRequest, NextApiResponse } from 'next';
import { connectToMongoDB } from '@/lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const db = await connectToMongoDB();
    
    // Add metadata to the submission
    const projectRequest = {
      ...req.body,
      submittedAt: new Date(),
      status: 'new',
      priority: getPriority(req.body.budget, req.body.timeline),
      ipAddress: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      source: 'website',
      responseRequired: true,
      estimatedValue: getEstimatedValue(req.body.budget),
      complexityLevel: getComplexityLevel(req.body.services, req.body.features),
      followUpDate: getFollowUpDate(req.body.timeline),
      assignedTo: null,
      notes: [],
      communications: []
    };

    // Insert into database
    const result = await db.collection('projectRequests').insertOne(projectRequest);
    
    // Log the submission for analytics
    await db.collection('adminLogs').insertOne({
      action: 'NEW_PROJECT_REQUEST',
      details: {
        requestId: result.insertedId,
        projectType: req.body.projectType,
        budget: req.body.budget,
        clientEmail: req.body.email,
        estimatedValue: projectRequest.estimatedValue
      },
      timestamp: new Date(),
      source: 'api',
      ipAddress: projectRequest.ipAddress
    });

    // Send notification to admin (you can implement email notification here)
    await db.collection('notifications').insertOne({
      type: 'NEW_PROJECT_REQUEST',
      title: `New Project Request: ${req.body.projectTitle}`,
      message: `${req.body.fullName} submitted a new project request for ${req.body.projectType}`,
      data: {
        requestId: result.insertedId,
        clientEmail: req.body.email,
        budget: req.body.budget,
        priority: projectRequest.priority
      },
      isRead: false,
      createdAt: new Date()
    });

    res.status(201).json({ 
      message: 'Project request submitted successfully',
      requestId: result.insertedId,
      status: 'received'
    });

  } catch (error) {
    console.error('Error submitting project request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Helper functions
function getPriority(budget: string, timeline: string): 'low' | 'medium' | 'high' | 'urgent' {
  const highValueBudgets = ['₹5,00,000 - ₹10,00,000', '₹10,00,000+'];
  const urgentTimelines = ['2-4 weeks', '1-2 months'];
  
  if (highValueBudgets.includes(budget) && urgentTimelines.includes(timeline)) {
    return 'urgent';
  } else if (highValueBudgets.includes(budget) || urgentTimelines.includes(timeline)) {
    return 'high';
  } else if (budget !== '₹50,000 - ₹1,00,000') {
    return 'medium';
  } else {
    return 'low';
  }
}

function getEstimatedValue(budget: string): number {
  const budgetMap: { [key: string]: number } = {
    '₹50,000 - ₹1,00,000': 75000,
    '₹1,00,000 - ₹2,50,000': 175000,
    '₹2,50,000 - ₹5,00,000': 375000,
    '₹5,00,000 - ₹10,00,000': 750000,
    '₹10,00,000+': 1500000,
    'Custom Quote Required': 500000
  };
  
  return budgetMap[budget] || 100000;
}

function getComplexityLevel(services: string[], features: string[]): 'simple' | 'moderate' | 'complex' | 'enterprise' {
  const totalFeatures = services.length + features.length;
  
  if (totalFeatures <= 3) return 'simple';
  if (totalFeatures <= 6) return 'moderate';
  if (totalFeatures <= 10) return 'complex';
  return 'enterprise';
}

function getFollowUpDate(timeline: string): Date {
  const followUpDays = {
    '2-4 weeks': 1,
    '1-2 months': 2,
    '2-4 months': 3,
    '4-6 months': 5,
    '6+ months': 7,
    'Flexible timeline': 3
  };
  
  const days = followUpDays[timeline as keyof typeof followUpDays] || 3;
  const followUpDate = new Date();
  followUpDate.setDate(followUpDate.getDate() + days);
  
  return followUpDate;
}