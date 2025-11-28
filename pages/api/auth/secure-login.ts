import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import { 
  checkRateLimit, 
  checkAccountLockout, 
  logLoginAttempt,
  generateSecureToken,
  getClientIP,
  generateDeviceFingerprint
} from '../../../lib/security';
import crypto from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const ip = getClientIP(req);
  const deviceFingerprint = generateDeviceFingerprint(req);
  
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      await logLoginAttempt(req, email || 'unknown', false, 'Missing credentials');
      return res.status(400).json({ 
        success: false, 
        error: 'Email and password are required' 
      });
    }

    // Check rate limiting
    const rateLimit = await checkRateLimit(ip);
    if (!rateLimit.allowed) {
      await logLoginAttempt(req, email, false, 'Rate limit exceeded');
      return res.status(429).json({
        success: false,
        error: 'Too many attempts. Please try again later.',
        retryAfter: 900 // 15 minutes
      });
    }

    // Check account lockout
    const lockoutStatus = await checkAccountLockout(email);
    if (lockoutStatus.locked) {
      await logLoginAttempt(req, email, false, 'Account locked');
      return res.status(423).json({
        success: false,
        error: 'Account is temporarily locked due to multiple failed attempts.',
        unlockTime: lockoutStatus.unlockTime
      });
    }

    const client = await clientPromise;
    const db = client.db('lavish');

    // Check if admin user exists in admin_credentials collection
    let admin = await db.collection('admin_credentials').findOne({ email });

    // If admin doesn't exist, create the default admin in lavish database
    if (!admin && email === 'lavishstarsoft@gmail.com' && password === 'Lavish@AS') {
      const defaultAdmin = {
        email: 'lavishstarsoft@gmail.com',
        password: 'Lavish@AS', // In production, this should be hashed
        name: 'Lavishstar Admin',
        role: 'admin',
        status: 'active',
        isActive: true,
        permissions: ['dashboard', 'content', 'projects', 'users'],
        createdAt: new Date(),
        lastLogin: new Date(),
        securitySettings: {
          requirePasswordChange: false,
          twoFactorEnabled: false
        }
      };
      
      await db.collection('admin_credentials').insertOne(defaultAdmin);
      admin = await db.collection('admin_credentials').findOne({ email: 'lavishstarsoft@gmail.com' });
    }

    // Verify credentials
    if (!admin || admin.email !== email || admin.password !== password) {
      await logLoginAttempt(req, email, false, 'Invalid credentials');
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid email or password' 
      });
    }

    // Check if admin is active
    if (!admin.isActive || admin.status !== 'active') {
      await logLoginAttempt(req, email, false, 'Account disabled');
      return res.status(403).json({ 
        success: false, 
        error: 'Account is disabled' 
      });
    }

    // Check for suspicious device/location
    const recentLogins = await db.collection('security_logs').find({
      email,
      success: true,
      type: { $in: ['login_attempt', 'session_verify'] },
      timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    }).sort({ timestamp: -1 }).limit(5).toArray();

    const isNewDevice = !recentLogins.some(log => log.deviceFingerprint === deviceFingerprint);
    const isNewIP = !recentLogins.some(log => log.ip === ip);

    // Generate secure session token
    const tokenId = crypto.randomUUID();
    const tokenPayload = {
      email: admin.email,
      name: admin.name,
      role: admin.role,
      tokenId,
      deviceFingerprint,
      ip,
      loginTime: Date.now()
    };

    const sessionToken = generateSecureToken(tokenPayload);

    // Update last login info
    await db.collection('admin_credentials').updateOne(
      { email },
      { 
        $set: { 
          lastLogin: new Date(),
          lastLoginIP: ip,
          lastDeviceFingerprint: deviceFingerprint
        } 
      }
    );

    // Create active session record
    await db.collection('active_sessions').replaceOne(
      { email },
      {
        email,
        tokenId,
        ip,
        deviceFingerprint,
        userAgent: req.headers['user-agent'] || '',
        createdAt: new Date(),
        lastActivity: new Date(),
        isNewDevice,
        isNewIP
      },
      { upsert: true }
    );

    // Log successful login
    await logLoginAttempt(req, email, true);

    // If new device/IP, log security alert
    if (isNewDevice || isNewIP) {
      await db.collection('security_logs').insertOne({
        ip,
        email,
        success: true,
        timestamp: new Date(),
        type: 'new_device_login',
        userAgent: req.headers['user-agent'] || '',
        deviceFingerprint,
        alert: true,
        alertReason: isNewDevice ? 'New device detected' : 'New IP address detected'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        email: admin.email,
        name: admin.name,
        role: admin.role,
        permissions: admin.permissions || []
      },
      token: sessionToken,
      sessionToken, // For backward compatibility
      security: {
        isNewDevice,
        isNewIP,
        deviceFingerprint: deviceFingerprint.substring(0, 8) + '...',
        remainingAttempts: rateLimit.remainingAttempts
      }
    });

  } catch (error) {
    console.error('Secure login error:', error);
    
    // Log error
    await logLoginAttempt(req, req.body?.email || 'unknown', false, 'Server error');
    
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
    });
  }
}