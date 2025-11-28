import { NextApiRequest } from 'next';
import crypto from 'crypto';
import clientPromise from './mongodb';

// Types for security features
interface LoginAttempt {
  ip: string;
  userAgent: string;
  timestamp: Date;
  success: boolean;
  email: string;
  deviceFingerprint: string;
  location?: string;
  failureReason?: string;
}

interface SecurityConfig {
  maxLoginAttempts: number;
  lockoutDuration: number; // in minutes
  rateLimitWindow: number; // in minutes
  maxRequestsPerWindow: number;
  sessionTimeout: number; // in minutes
}

const SECURITY_CONFIG: SecurityConfig = {
  maxLoginAttempts: 5,
  lockoutDuration: 15, // 15 minutes lockout
  rateLimitWindow: 15, // 15 minute window
  maxRequestsPerWindow: 10, // 10 attempts per window
  sessionTimeout: 60 // 60 minutes session timeout
};

// Get client IP address
export function getClientIP(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'] as string;
  const realIP = req.headers['x-real-ip'] as string;
  const cloudflareIP = req.headers['cf-connecting-ip'] as string;
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (cloudflareIP) {
    return cloudflareIP;
  }
  
  return req.socket.remoteAddress || 'unknown';
}

// Generate device fingerprint
export function generateDeviceFingerprint(req: NextApiRequest): string {
  const userAgent = req.headers['user-agent'] || '';
  const acceptLanguage = req.headers['accept-language'] || '';
  const acceptEncoding = req.headers['accept-encoding'] || '';
  const ip = getClientIP(req);
  
  const fingerprintData = `${userAgent}|${acceptLanguage}|${acceptEncoding}|${ip}`;
  return crypto.createHash('sha256').update(fingerprintData).digest('hex').substring(0, 16);
}

// Check if IP is rate limited
export async function checkRateLimit(ip: string): Promise<{ allowed: boolean; remainingAttempts: number }> {
  try {
    const client = await clientPromise;
    const db = client.db('lavish');
    
    const windowStart = new Date(Date.now() - SECURITY_CONFIG.rateLimitWindow * 60 * 1000);
    
    const attemptCount = await db.collection('security_logs').countDocuments({
      ip: ip,
      timestamp: { $gte: windowStart },
      type: 'login_attempt'
    });
    
    const remaining = Math.max(0, SECURITY_CONFIG.maxRequestsPerWindow - attemptCount);
    
    return {
      allowed: attemptCount < SECURITY_CONFIG.maxRequestsPerWindow,
      remainingAttempts: remaining
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    return { allowed: true, remainingAttempts: SECURITY_CONFIG.maxRequestsPerWindow };
  }
}

// Check if account is locked
export async function checkAccountLockout(email: string): Promise<{ locked: boolean; unlockTime?: Date }> {
  try {
    const client = await clientPromise;
    const db = client.db('lavish');
    
    const lockoutInfo = await db.collection('account_lockouts').findOne({ email });
    
    if (!lockoutInfo) {
      return { locked: false };
    }
    
    const now = new Date();
    if (lockoutInfo.unlockTime && now < lockoutInfo.unlockTime) {
      return { locked: true, unlockTime: lockoutInfo.unlockTime };
    }
    
    // Lockout expired, remove it
    if (lockoutInfo.unlockTime && now >= lockoutInfo.unlockTime) {
      await db.collection('account_lockouts').deleteOne({ email });
      return { locked: false };
    }
    
    return { locked: false };
  } catch (error) {
    console.error('Account lockout check error:', error);
    return { locked: false };
  }
}

// Log login attempt
export async function logLoginAttempt(
  req: NextApiRequest, 
  email: string, 
  success: boolean, 
  failureReason?: string
): Promise<void> {
  try {
    const client = await clientPromise;
    const db = client.db('lavish');
    
    const ip = getClientIP(req);
    const deviceFingerprint = generateDeviceFingerprint(req);
    const userAgent = req.headers['user-agent'] || '';
    
    const logEntry = {
      ip,
      email,
      success,
      timestamp: new Date(),
      userAgent,
      deviceFingerprint,
      failureReason,
      type: 'login_attempt'
    };
    
    await db.collection('security_logs').insertOne(logEntry);
    
    // If failed login, update failure count
    if (!success) {
      await updateFailedLoginCount(email, ip);
    }
    
  } catch (error) {
    console.error('Login attempt logging error:', error);
  }
}

// Update failed login count and handle lockout
async function updateFailedLoginCount(email: string, ip: string): Promise<void> {
  try {
    const client = await clientPromise;
    const db = client.db('lavish');
    
    // Count recent failed attempts
    const windowStart = new Date(Date.now() - SECURITY_CONFIG.rateLimitWindow * 60 * 1000);
    
    const failedAttempts = await db.collection('security_logs').countDocuments({
      email,
      success: false,
      timestamp: { $gte: windowStart }
    });
    
    // Lock account if too many failed attempts
    if (failedAttempts >= SECURITY_CONFIG.maxLoginAttempts) {
      const unlockTime = new Date(Date.now() + SECURITY_CONFIG.lockoutDuration * 60 * 1000);
      
      await db.collection('account_lockouts').replaceOne(
        { email },
        {
          email,
          ip,
          lockTime: new Date(),
          unlockTime,
          failedAttempts
        },
        { upsert: true }
      );
      
      // Log lockout event
      await db.collection('security_logs').insertOne({
        ip,
        email,
        success: false,
        timestamp: new Date(),
        type: 'account_locked',
        failureReason: `Account locked due to ${failedAttempts} failed attempts`
      });
    }
  } catch (error) {
    console.error('Failed login count update error:', error);
  }
}

// Generate secure JWT token
export function generateSecureToken(payload: any): string {
  const secret = process.env.JWT_SECRET || 'lavish-jwt-secret-2025';
  const expiresIn = SECURITY_CONFIG.sessionTimeout * 60; // Convert to seconds
  
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  
  const now = Math.floor(Date.now() / 1000);
  const tokenPayload = {
    ...payload,
    iat: now,
    exp: now + expiresIn
  };
  
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(tokenPayload)).toString('base64url');
  
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// Verify JWT token
export function verifySecureToken(token: string): any {
  try {
    const secret = process.env.JWT_SECRET || 'lavish-jwt-secret-2025';
    const parts = token.split('.');
    
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }
    
    const [headerB64, payloadB64, signature] = parts;
    
    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${headerB64}.${payloadB64}`)
      .digest('base64url');
    
    if (signature !== expectedSignature) {
      throw new Error('Invalid signature');
    }
    
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());
    
    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && now > payload.exp) {
      throw new Error('Token expired');
    }
    
    return payload;
  } catch (error) {
    throw new Error(`Token verification failed: ${error}`);
  }
}

// Get security analytics
export async function getSecurityAnalytics(days: number = 7): Promise<any> {
  try {
    const client = await clientPromise;
    const db = client.db('lavish');
    
    const dateRange = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    // Get login attempts stats
    const totalAttempts = await db.collection('security_logs').countDocuments({
      type: 'login_attempt',
      timestamp: { $gte: dateRange }
    });
    
    const successfulLogins = await db.collection('security_logs').countDocuments({
      type: 'login_attempt',
      success: true,
      timestamp: { $gte: dateRange }
    });
    
    const failedLogins = await db.collection('security_logs').countDocuments({
      type: 'login_attempt',
      success: false,
      timestamp: { $gte: dateRange }
    });
    
    const lockedAccounts = await db.collection('account_lockouts').countDocuments({
      lockTime: { $gte: dateRange }
    });
    
    // Get top IPs with failed attempts
    const topFailedIPs = await db.collection('security_logs').aggregate([
      {
        $match: {
          type: 'login_attempt',
          success: false,
          timestamp: { $gte: dateRange }
        }
      },
      {
        $group: {
          _id: '$ip',
          count: { $sum: 1 },
          lastAttempt: { $max: '$timestamp' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]).toArray();
    
    return {
      totalAttempts,
      successfulLogins,
      failedLogins,
      lockedAccounts,
      successRate: totalAttempts > 0 ? (successfulLogins / totalAttempts * 100).toFixed(2) : 0,
      topFailedIPs
    };
  } catch (error) {
    console.error('Security analytics error:', error);
    return null;
  }
}

// Clean up old security logs
export async function cleanupSecurityLogs(): Promise<void> {
  try {
    const client = await clientPromise;
    const db = client.db('lavish');
    
    const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days
    
    await db.collection('security_logs').deleteMany({
      timestamp: { $lt: cutoffDate }
    });
    
    console.log('Security logs cleaned up');
  } catch (error) {
    console.error('Security logs cleanup error:', error);
  }
}

// Alias for compatibility
export const verifyJWT = verifySecureToken;
export const signJWT = generateSecureToken;

export { SECURITY_CONFIG };
export type { LoginAttempt, SecurityConfig };