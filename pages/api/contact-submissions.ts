import { NextApiRequest, NextApiResponse } from 'next';
import { connectToMongoDB } from '@/lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Contact submission received:', req.body);
    
    const db = await connectToMongoDB();
    console.log('Connected to MongoDB successfully');
    
    // Add metadata to the submission with safe field access
    const contactSubmission = {
      ...req.body,
      submittedAt: new Date(),
      status: 'new',
      priority: getContactPriority(req.body.urgency || 'medium', req.body.inquiryType || 'general'),
      ipAddress: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      source: 'website',
      responseRequired: true,
      leadScore: calculateLeadScore(req.body),
      followUpDate: getFollowUpDate(req.body.urgency || 'medium'),
      assignedTo: null,
      tags: generateTags(req.body),
      notes: [],
      communications: []
    };

    console.log('Prepared contact submission:', contactSubmission);

    // Insert into database
    const result = await db.collection('contactSubmissions').insertOne(contactSubmission);
    console.log('Insert result:', result);
    
    // Log the submission for analytics
    await db.collection('adminLogs').insertOne({
      action: 'NEW_CONTACT_SUBMISSION',
      details: {
        submissionId: result.insertedId,
        inquiryType: req.body.inquiryType || 'general',
        urgency: req.body.urgency || 'medium',
        clientEmail: req.body.email,
        leadScore: contactSubmission.leadScore,
        hasProject: req.body.hasProject || false
      },
      timestamp: new Date(),
      source: 'api',
      ipAddress: contactSubmission.ipAddress
    });

    // Send notification to admin
    await db.collection('notifications').insertOne({
      type: 'NEW_CONTACT_SUBMISSION',
      title: `New Contact: ${req.body.subject}`,
      message: `${req.body.name} sent a contact inquiry`,
      data: {
        submissionId: result.insertedId,
        clientEmail: req.body.email,
        priority: contactSubmission.priority,
        leadScore: contactSubmission.leadScore
      },
      isRead: false,
      createdAt: new Date()
    });

    res.status(201).json({ 
      message: 'Contact form submitted successfully',
      submissionId: result.insertedId,
      status: 'received'
    });

  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Helper functions
function getContactPriority(urgency: string, inquiryType: string): 'low' | 'medium' | 'high' | 'urgent' {
  const urgencyMap: { [key: string]: string } = {
    'Urgent - Same day response needed': 'urgent',
    'High - Within 2-3 days': 'high',
    'Medium - Within a week': 'medium',
    'Low - General inquiry': 'low'
  };
  
  const highPriorityTypes = ['Service Quote Request', 'Project Consultation', 'Technical Support'];
  
  if (urgency && urgencyMap[urgency]) {
    return urgencyMap[urgency] as 'low' | 'medium' | 'high' | 'urgent';
  }
  
  if (highPriorityTypes.includes(inquiryType)) {
    return 'high';
  }
  
  return 'medium';
}

function calculateLeadScore(formData: any): number {
  let score = 0;
  
  // Company indicates business client (+20)
  if (formData.company) score += 20;
  
  // Job title indicates decision maker (+15)
  if (formData.jobTitle && 
      (formData.jobTitle.toLowerCase().includes('ceo') || 
       formData.jobTitle.toLowerCase().includes('founder') || 
       formData.jobTitle.toLowerCase().includes('director') ||
       formData.jobTitle.toLowerCase().includes('manager'))) {
    score += 15;
  }
  
  // Has specific project (+25)
  if (formData.hasProject) score += 25;
  
  // Project budget (+10-30 based on range)
  const budgetScores: { [key: string]: number } = {
    '₹25,000 - ₹50,000': 5,
    '₹50,000 - ₹1,00,000': 10,
    '₹1,00,000 - ₹2,50,000': 15,
    '₹2,50,000 - ₹5,00,000': 20,
    '₹5,00,000 - ₹10,00,000': 25,
    '₹10,00,000+': 30
  };
  if (formData.projectBudget && budgetScores[formData.projectBudget]) {
    score += budgetScores[formData.projectBudget];
  }
  
  // Urgency (+5-20)
  const urgencyScores: { [key: string]: number } = {
    'ASAP': 20,
    'Within 1 month': 15,
    '1-3 months': 10,
    '3-6 months': 5
  };
  if (formData.projectTimeline && urgencyScores[formData.projectTimeline]) {
    score += urgencyScores[formData.projectTimeline];
  }
  
  // Multiple services interest (+2 per service)
  if (formData.serviceInterest && Array.isArray(formData.serviceInterest)) {
    score += Math.min(formData.serviceInterest.length * 2, 10);
  }
  
  // High-value inquiry types (+10)
  const highValueInquiries = ['Service Quote Request', 'Project Consultation', 'Partnership Opportunity'];
  if (highValueInquiries.includes(formData.inquiryType)) {
    score += 10;
  }
  
  // Website provided (+5)
  if (formData.website) score += 5;
  
  return Math.min(score, 100); // Cap at 100
}

function getFollowUpDate(urgency: string): Date {
  const followUpHours = {
    'Urgent - Same day response needed': 2,
    'High - Within 2-3 days': 24,
    'Medium - Within a week': 48,
    'Low - General inquiry': 72
  };
  
  const hours = followUpHours[urgency as keyof typeof followUpHours] || 48;
  const followUpDate = new Date();
  followUpDate.setHours(followUpDate.getHours() + hours);
  
  return followUpDate;
}

function generateTags(formData: any): string[] {
  const tags = [];
  
  if (formData.hasProject) tags.push('Has Project');
  if (formData.company) tags.push('Business Client');
  if (formData.urgency?.includes('Urgent')) tags.push('Urgent');
  if (formData.serviceInterest?.includes('E-commerce Solutions')) tags.push('E-commerce');
  if (formData.serviceInterest?.includes('Mobile App Development')) tags.push('Mobile App');
  if (formData.projectBudget?.includes('₹10,00,000+')) tags.push('High Value');
  if (formData.inquiryType === 'Partnership Opportunity') tags.push('Partnership');
  if (formData.country && formData.country !== 'India') tags.push('International');
  
  return tags;
}