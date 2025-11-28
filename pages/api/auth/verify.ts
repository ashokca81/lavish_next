import { NextApiRequest, NextApiResponse } from 'next';
import { verifySecureToken, getClientIP } from '../../../lib/security';
import clientPromise from '../../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: 'No token provided' 
      });
    }

    const token = authHeader.substring(7);
    
    // Check if it's a simple token (starts with 'lavish_') - backward compatibility
    if (token.startsWith('lavish_')) {
      const tokenTimestamp = parseInt(token.split('_')[1]);
      const now = Date.now();
      const tokenAge = now - tokenTimestamp;
      const twentyFourHours = 24 * 60 * 60 * 1000;
      
      if (tokenAge < twentyFourHours) {
        return res.status(200).json({ 
          success: true, 
          user: {
            email: 'lavishstarsoft@gmail.com',
            role: 'admin',
            status: 'active'
          }
        });
      } else {
        return res.status(401).json({ 
          success: false, 
          error: 'Token expired' 
        });
      }
    }

    // Try new secure token verification
    try {
      const payload = verifySecureToken(token);
      
      const client = await clientPromise;
      const db = client.db('lavish');
      
      // Check if session is still active
      const activeSession = await db.collection('active_sessions').findOne({
        email: payload.email,
        tokenId: payload.tokenId
      });
      
      if (!activeSession) {
        return res.status(401).json({ 
          success: false, 
          error: 'Session expired or invalid' 
        });
      }
      
      // Update last activity
      await db.collection('active_sessions').updateOne(
        { email: payload.email, tokenId: payload.tokenId },
        { $set: { lastActivity: new Date() } }
      );

      // Log session verification
      const ip = getClientIP(req);
      await db.collection('security_logs').insertOne({
        ip,
        email: payload.email,
        success: true,
        timestamp: new Date(),
        type: 'session_verify',
        tokenId: payload.tokenId
      });

      return res.status(200).json({
        success: true,
        user: {
          email: payload.email,
          name: payload.name,
          role: payload.role
        },
        session: {
          tokenId: payload.tokenId,
          loginTime: new Date(payload.loginTime),
          lastActivity: activeSession.lastActivity,
          deviceFingerprint: activeSession.deviceFingerprint.substring(0, 8) + '...'
        }
      });
      
    } catch (secureTokenError) {
      // Fallback to old MongoDB session verification
      const client = await clientPromise;
      const db = client.db('lavish');

      const session = await db.collection('user_sessions').findOne({ 
        sessionToken: token,
        expiresAt: { $gt: new Date() }
      });

      if (!session) {
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid or expired token' 
        });
      }

      const user = await db.collection('admin_credentials').findOne({ 
        _id: session.userId,
        status: 'active'
      });

      if (!user) {
        return res.status(401).json({ 
          success: false, 
          error: 'User not found or inactive' 
        });
      }

      return res.status(200).json({ 
        success: true, 
        user: {
          email: user.email,
          role: user.role,
          status: user.status
        }
      });
    }

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      error: error instanceof Error ? error.message : 'Token verification failed'
    });
  }
}