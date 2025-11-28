import { NextApiRequest, NextApiResponse } from 'next';
import { getSecurityAnalytics } from '../../../lib/security';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Basic auth check - in production you'd verify admin token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const days = parseInt(req.query.days as string) || 7;
    const analytics = await getSecurityAnalytics(days);
    
    if (!analytics) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch security analytics'
      });
    }
    
    res.status(200).json({
      success: true,
      data: analytics,
      period: `${days} days`
    });
    
  } catch (error) {
    console.error('Security analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}