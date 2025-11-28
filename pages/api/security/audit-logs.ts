import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import { getClientIP } from '../../../lib/security';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Basic auth check
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const client = await clientPromise;
    const db = client.db('lavish');
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const type = req.query.type as string;
    const email = req.query.email as string;
    const ip = req.query.ip as string;
    const days = parseInt(req.query.days as string) || 7;
    
    const skip = (page - 1) * limit;
    const dateRange = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    // Build filter query
    const filter: any = {
      timestamp: { $gte: dateRange }
    };
    
    if (type) filter.type = type;
    if (email) filter.email = new RegExp(email, 'i');
    if (ip) filter.ip = ip;
    
    // Get total count
    const totalCount = await db.collection('security_logs').countDocuments(filter);
    
    // Get logs with pagination
    const logs = await db.collection('security_logs')
      .find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    // Get summary statistics
    const summaryStats = await db.collection('security_logs').aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          successCount: {
            $sum: { $cond: [{ $eq: ['$success', true] }, 1, 0] }
          }
        }
      }
    ]).toArray();
    
    // Get unique IPs in the period
    const uniqueIPs = await db.collection('security_logs').distinct('ip', filter);
    
    // Get recent lockouts
    const recentLockouts = await db.collection('account_lockouts')
      .find({ lockTime: { $gte: dateRange } })
      .sort({ lockTime: -1 })
      .limit(10)
      .toArray();
    
    res.status(200).json({
      success: true,
      data: {
        logs: logs.map(log => ({
          id: log._id,
          timestamp: log.timestamp,
          ip: log.ip,
          email: log.email,
          type: log.type,
          success: log.success,
          userAgent: log.userAgent,
          deviceFingerprint: log.deviceFingerprint,
          failureReason: log.failureReason
        })),
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasNext: skip + limit < totalCount,
          hasPrev: page > 1
        },
        summary: {
          totalLogs: totalCount,
          uniqueIPs: uniqueIPs.length,
          typeBreakdown: summaryStats,
          recentLockouts: recentLockouts.length
        },
        filters: { type, email, ip, days },
        recentLockouts
      }
    });
    
  } catch (error) {
    console.error('Audit logs error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}