import { NextApiRequest, NextApiResponse } from 'next';
import { verifySecureToken, getClientIP, generateDeviceFingerprint } from '../../../lib/security';
import clientPromise from '../../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const payload = verifySecureToken(token);
    
    const ip = getClientIP(req);
    const deviceFingerprint = generateDeviceFingerprint(req);
    
    // Log session activity
    const client = await clientPromise;
    const db = client.db('lavish');
    
    await db.collection('security_logs').insertOne({
      ip,
      email: payload.email,
      success: true,
      timestamp: new Date(),
      userAgent: req.headers['user-agent'] || '',
      deviceFingerprint,
      type: 'session_verify',
      tokenId: payload.tokenId
    });
    
    res.status(200).json({
      success: true,
      valid: true,
      user: {
        email: payload.email,
        name: payload.name,
        role: payload.role
      },
      session: {
        ip,
        deviceFingerprint,
        expiresAt: new Date(payload.exp * 1000)
      }
    });
    
  } catch (error) {
    console.error('Session verification error:', error);
    
    res.status(401).json({
      success: false,
      valid: false,
      error: error instanceof Error ? error.message : 'Token verification failed'
    });
  }
}