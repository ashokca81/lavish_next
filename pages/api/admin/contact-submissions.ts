import { NextApiRequest, NextApiResponse } from 'next';
import { connectToMongoDB } from '@/lib/mongodb';
import { verifyJWT } from '@/lib/security';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
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
    
    // Get query parameters for filtering and pagination
    const {
      page = '1',
      limit = '20',
      status,
      priority,
      inquiryType,
      urgency,
      dateFrom,
      dateTo,
      search,
      leadScore,
      sortBy = 'submittedAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter: any = {};
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (inquiryType) filter.inquiryType = inquiryType;
    if (urgency) filter.urgency = urgency;
    
    if (leadScore) {
      const score = parseInt(leadScore as string);
      filter.leadScore = { $gte: score };
    }
    
    if (dateFrom || dateTo) {
      filter.submittedAt = {};
      if (dateFrom) filter.submittedAt.$gte = new Date(dateFrom as string);
      if (dateTo) filter.submittedAt.$lte = new Date(dateTo as string);
    }
    
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build sort object
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    // Fetch data
    const [contactSubmissions, totalCount] = await Promise.all([
      db.collection('contactSubmissions')
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .toArray(),
      db.collection('contactSubmissions').countDocuments(filter)
    ]);

    // Get summary statistics
    const stats = await db.collection('contactSubmissions').aggregate([
      {
        $group: {
          _id: null,
          totalSubmissions: { $sum: 1 },
          avgLeadScore: { $avg: '$leadScore' },
          newSubmissions: {
            $sum: {
              $cond: [{ $eq: ['$status', 'new'] }, 1, 0]
            }
          },
          inProgress: {
            $sum: {
              $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0]
            }
          },
          resolved: {
            $sum: {
              $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0]
            }
          },
          highValueLeads: {
            $sum: {
              $cond: [{ $gte: ['$leadScore', 70] }, 1, 0]
            }
          }
        }
      }
    ]).toArray();

    const inquiryTypeStats = await db.collection('contactSubmissions').aggregate([
      {
        $group: {
          _id: '$inquiryType',
          count: { $sum: 1 },
          avgLeadScore: { $avg: '$leadScore' }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray();

    const summary = stats[0] || {
      totalSubmissions: 0,
      avgLeadScore: 0,
      newSubmissions: 0,
      inProgress: 0,
      resolved: 0,
      highValueLeads: 0
    };

    res.status(200).json({
      contactSubmissions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        pages: Math.ceil(totalCount / limitNum)
      },
      summary,
      inquiryTypeStats
    });

  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}