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
      projectType,
      dateFrom,
      dateTo,
      search,
      sortBy = 'submittedAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter: any = {};
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (projectType) filter.projectType = projectType;
    
    if (dateFrom || dateTo) {
      filter.submittedAt = {};
      if (dateFrom) filter.submittedAt.$gte = new Date(dateFrom as string);
      if (dateTo) filter.submittedAt.$lte = new Date(dateTo as string);
    }
    
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { projectTitle: { $regex: search, $options: 'i' } },
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
    const [projectRequests, totalCount] = await Promise.all([
      db.collection('projectRequests')
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .toArray(),
      db.collection('projectRequests').countDocuments(filter)
    ]);

    // Get summary statistics
    const stats = await db.collection('projectRequests').aggregate([
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          totalValue: { $sum: '$estimatedValue' },
          avgValue: { $avg: '$estimatedValue' },
          newRequests: {
            $sum: {
              $cond: [{ $eq: ['$status', 'new'] }, 1, 0]
            }
          },
          inProgress: {
            $sum: {
              $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0]
            }
          },
          completed: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
            }
          }
        }
      }
    ]).toArray();

    const summary = stats[0] || {
      totalRequests: 0,
      totalValue: 0,
      avgValue: 0,
      newRequests: 0,
      inProgress: 0,
      completed: 0
    };

    res.status(200).json({
      projectRequests,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        pages: Math.ceil(totalCount / limitNum)
      },
      summary
    });

  } catch (error) {
    console.error('Error fetching project requests:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}