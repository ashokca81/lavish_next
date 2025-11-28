import { NextApiRequest, NextApiResponse } from 'next';
import { checkRateLimit, getClientIP } from '../../../lib/security';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const ip = getClientIP(req);
    const rateLimit = await checkRateLimit(ip);
    
    res.status(200).json({
      success: true,
      ip,
      allowed: rateLimit.allowed,
      remainingAttempts: rateLimit.remainingAttempts,
      message: rateLimit.allowed 
        ? 'Requests allowed' 
        : 'Rate limit exceeded. Please try again later.'
    });
    
  } catch (error) {
    console.error('Rate limit check error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}