import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'solar_naresh');

    // Get analytics data
    const [
      totalProjects,
      totalClients,
      completedProjects,
      activeProjects,
      recentProjects,
      recentClients
    ] = await Promise.all([
      db.collection('lavish').countDocuments(),
      db.collection('lavish_clients').countDocuments(),
      db.collection('lavish').countDocuments({ status: 'Completed' }),
      db.collection('lavish').countDocuments({ status: { $in: ['In Progress', 'Planning'] } }),
      db.collection('lavish').find({}).sort({ createdAt: -1 }).limit(5).toArray(),
      db.collection('lavish_clients').find({}).sort({ createdAt: -1 }).limit(5).toArray()
    ]);

    // Calculate monthly data for charts
    const currentDate = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(currentDate.getMonth() - 6);

    const monthlyProjects = await db.collection('lavish').aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]).toArray();

    const monthlyClients = await db.collection('lavish_clients').aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]).toArray();

    // Calculate completion rate
    const completionRate = totalProjects > 0 ? 
      Math.round((completedProjects / totalProjects) * 100) : 0;

    // Get project status distribution
    const statusDistribution = await db.collection('lavish').aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    // Mock revenue data (you can replace this with actual revenue calculation)
    const monthlyRevenue = [
      { month: 'Jan', revenue: 125000, expenses: 75000 },
      { month: 'Feb', revenue: 140000, expenses: 80000 },
      { month: 'Mar', revenue: 160000, expenses: 85000 },
      { month: 'Apr', revenue: 135000, expenses: 78000 },
      { month: 'May', revenue: 175000, expenses: 90000 },
      { month: 'Jun', revenue: 190000, expenses: 95000 },
    ];

    const analytics = {
      overview: {
        totalProjects,
        totalClients,
        completedProjects,
        activeProjects,
        completionRate,
        totalRevenue: 1125000, // Mock total revenue
        avgProjectValue: totalProjects > 0 ? Math.round(1125000 / totalProjects) : 0
      },
      charts: {
        monthlyProjects: monthlyProjects.map(item => ({
          month: new Date(item._id.year, item._id.month - 1).toLocaleDateString('en-US', { month: 'short' }),
          projects: item.count
        })),
        monthlyClients: monthlyClients.map(item => ({
          month: new Date(item._id.year, item._id.month - 1).toLocaleDateString('en-US', { month: 'short' }),
          clients: item.count
        })),
        monthlyRevenue,
        statusDistribution: statusDistribution.map(item => ({
          status: item._id,
          count: item.count,
          percentage: Math.round((item.count / totalProjects) * 100)
        }))
      },
      recent: {
        projects: recentProjects,
        clients: recentClients
      }
    };

    res.status(200).json({ success: true, data: analytics });
  } catch (error) {
    console.error('Analytics API Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
  }
}