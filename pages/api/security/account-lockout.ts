import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import { getClientIP } from '../../../lib/security';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Basic auth check
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const client = await clientPromise;
    const db = client.db('lavish');

    if (req.method === 'GET') {
      // Get all locked accounts
      const { active = 'true' } = req.query;
      
      const filter = active === 'true' 
        ? { unlockTime: { $gt: new Date() } }
        : {};
      
      const lockedAccounts = await db.collection('account_lockouts')
        .find(filter)
        .sort({ lockTime: -1 })
        .toArray();
      
      res.status(200).json({
        success: true,
        data: lockedAccounts.map(account => ({
          email: account.email,
          ip: account.ip,
          lockTime: account.lockTime,
          unlockTime: account.unlockTime,
          failedAttempts: account.failedAttempts,
          isActive: new Date() < account.unlockTime
        }))
      });
      
    } else if (req.method === 'DELETE') {
      // Unlock specific account
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email is required'
        });
      }
      
      const result = await db.collection('account_lockouts').deleteOne({ email });
      
      if (result.deletedCount > 0) {
        // Log unlock event
        const ip = getClientIP(req);
        await db.collection('security_logs').insertOne({
          ip,
          email,
          success: true,
          timestamp: new Date(),
          type: 'account_unlocked',
          userAgent: req.headers['user-agent'] || '',
          adminAction: true
        });
        
        res.status(200).json({
          success: true,
          message: `Account ${email} unlocked successfully`
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'Account not found or not locked'
        });
      }
      
    } else if (req.method === 'POST') {
      // Manually lock account
      const { email, reason, duration = 15 } = req.body;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email is required'
        });
      }
      
      const ip = getClientIP(req);
      const lockTime = new Date();
      const unlockTime = new Date(Date.now() + duration * 60 * 1000);
      
      await db.collection('account_lockouts').replaceOne(
        { email },
        {
          email,
          ip,
          lockTime,
          unlockTime,
          failedAttempts: 0,
          reason: reason || 'Manually locked by admin',
          manualLock: true
        },
        { upsert: true }
      );
      
      // Log manual lock event
      await db.collection('security_logs').insertOne({
        ip,
        email,
        success: false,
        timestamp: new Date(),
        type: 'account_locked',
        userAgent: req.headers['user-agent'] || '',
        failureReason: reason || 'Manually locked by admin',
        adminAction: true
      });
      
      res.status(200).json({
        success: true,
        message: `Account ${email} locked for ${duration} minutes`,
        unlockTime
      });
      
    } else {
      res.status(405).json({ success: false, error: 'Method not allowed' });
    }
    
  } catch (error) {
    console.error('Account lockout error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}