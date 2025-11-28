import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Shield, 
  Lock, 
  Users, 
  AlertTriangle, 
  Activity,
  Globe,
  Clock,
  Unlock,
  RefreshCw,
  History,
  MapPin,
  Smartphone,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface SecurityStats {
  totalAttempts: number;
  successfulLogins: number;
  failedLogins: number;
  lockedAccounts: number;
  successRate: string;
  topFailedIPs: Array<{
    _id: string;
    count: number;
    lastAttempt: string;
  }>;
}

interface AuditLog {
  id: string;
  timestamp: string;
  ip: string;
  email: string;
  type: string;
  success: boolean;
  failureReason?: string;
  userAgent: string;
}

interface LockedAccount {
  email: string;
  ip: string;
  lockTime: string;
  unlockTime: string;
  failedAttempts: number;
  isActive: boolean;
}

interface LoginHistoryEntry {
  id: string;
  timestamp: string;
  ip: string;
  email: string;
  success: boolean;
  deviceFingerprint: string;
  userAgent: string;
  location?: string;
  isNewDevice: boolean;
  isNewIP: boolean;
  sessionDuration?: number;
  logoutTime?: string;
  failureReason?: string;
}

export default function SecurityDashboard() {
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [lockedAccounts, setLockedAccounts] = useState<LockedAccount[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const fetchSecurityData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch security analytics
      const [statsRes, logsRes, lockoutRes, historyRes] = await Promise.all([
        fetch('/api/security/analytics?days=7', { headers }),
        fetch('/api/security/audit-logs?limit=20', { headers }),
        fetch('/api/security/account-lockout', { headers }),
        fetch('/api/security/audit-logs?type=login_attempt&limit=50', { headers })
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data);
      }

      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setAuditLogs(logsData.data.logs);
      }

      if (lockoutRes.ok) {
        const lockoutData = await lockoutRes.json();
        setLockedAccounts(lockoutData.data);
      }

      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setLoginHistory(historyData.data.logs.map((log: any) => ({
          id: log.id,
          timestamp: log.timestamp,
          ip: log.ip,
          email: log.email,
          success: log.success,
          deviceFingerprint: log.deviceFingerprint,
          userAgent: log.userAgent,
          isNewDevice: log.type === 'new_device_login',
          isNewIP: log.type === 'new_device_login',
          failureReason: log.failureReason
        })));
      }

      setError('');
    } catch (err) {
      setError('Failed to fetch security data');
      console.error('Security data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const unlockAccount = async (email: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/security/account-lockout', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        // Refresh data
        fetchSecurityData();
      }
    } catch (err) {
      console.error('Unlock account error:', err);
    }
  };

  // Helper function to format relative time
  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Helper function to extract device info from user agent
  const getDeviceInfo = (userAgent: string) => {
    const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
    const isChrome = /Chrome/.test(userAgent);
    const isFirefox = /Firefox/.test(userAgent);
    const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
    const isEdge = /Edg/.test(userAgent);
    
    let browser = 'Unknown';
    if (isChrome) browser = 'Chrome';
    else if (isFirefox) browser = 'Firefox';
    else if (isSafari) browser = 'Safari';
    else if (isEdge) browser = 'Edge';
    
    return {
      deviceType: isMobile ? 'Mobile' : 'Desktop',
      browser
    };
  };

  // Helper function to get location from IP (mock implementation)
  const getLocationFromIP = (ip: string) => {
    if (ip === '::1' || ip === '127.0.0.1') return 'Local';
    return 'Unknown Location'; // In production, use IP geolocation service
  };

  useEffect(() => {
    fetchSecurityData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        Loading security data...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Security Dashboard</h1>
        <Button onClick={fetchSecurityData} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Activity className="w-4 h-4 mr-2 inline" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('login-history')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'login-history'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <History className="w-4 h-4 mr-2 inline" />
            Login History
          </button>
          <button
            onClick={() => setActiveTab('security-logs')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'security-logs'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Shield className="w-4 h-4 mr-2 inline" />
            Security Logs
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">

      {/* Security Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Attempts</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalAttempts || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.successRate || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Failed Logins</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.failedLogins || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Lock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Locked Accounts</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.lockedAccounts || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Audit Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      log.success ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <p className="text-sm font-medium">{log.email}</p>
                      <p className="text-xs text-gray-500">{log.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{log.ip}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Locked Accounts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="h-5 w-5 mr-2" />
              Locked Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {lockedAccounts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No locked accounts</p>
              ) : (
                lockedAccounts.map((account, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{account.email}</p>
                      <p className="text-xs text-gray-500">IP: {account.ip}</p>
                      <p className="text-xs text-gray-400">
                        Locked: {new Date(account.lockTime).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={account.isActive ? "destructive" : "secondary"}>
                        {account.isActive ? 'Locked' : 'Expired'}
                      </Badge>
                      {account.isActive && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => unlockAccount(account.email)}
                        >
                          <Unlock className="h-3 w-3 mr-1" />
                          Unlock
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Failed IPs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Suspicious IP Addresses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats?.topFailedIPs?.map((ipData, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{ipData._id}</p>
                  <Badge variant="destructive">{ipData.count} attempts</Badge>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Last: {new Date(ipData.lastAttempt).toLocaleString()}
                </p>
              </div>
            )) || (
              <p className="text-gray-500 col-span-full text-center py-4">No suspicious activity</p>
            )}
          </div>
        </CardContent>
      </Card>
        </div>
      )}

      {/* Login History Tab */}
      {activeTab === 'login-history' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <History className="h-5 w-5 mr-2" />
                Admin Login History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {loginHistory.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No login history available</p>
                ) : (
                  loginHistory.map((entry) => {
                    const deviceInfo = getDeviceInfo(entry.userAgent);
                    const location = getLocationFromIP(entry.ip);
                    
                    return (
                      <div key={entry.id} className={`p-4 border rounded-lg ${
                        entry.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className={`mt-1 ${entry.success ? 'text-green-600' : 'text-red-600'}`}>
                              {entry.success ? (
                                <CheckCircle className="h-5 w-5" />
                              ) : (
                                <XCircle className="h-5 w-5" />
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-medium text-gray-900">{entry.email}</h4>
                                <Badge variant={entry.success ? "success" : "destructive"}>
                                  {entry.success ? 'Success' : 'Failed'}
                                </Badge>
                                {entry.isNewDevice && (
                                  <Badge variant="warning" className="bg-orange-100 text-orange-800">
                                    <Smartphone className="h-3 w-3 mr-1" />
                                    New Device
                                  </Badge>
                                )}
                                {entry.isNewIP && (
                                  <Badge variant="warning" className="bg-yellow-100 text-yellow-800">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    New Location
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {formatRelativeTime(entry.timestamp)}
                                </div>
                                <div className="flex items-center">
                                  <Globe className="h-3 w-3 mr-1" />
                                  {entry.ip} ({location})
                                </div>
                                <div className="flex items-center">
                                  <Smartphone className="h-3 w-3 mr-1" />
                                  {deviceInfo.browser} - {deviceInfo.deviceType}
                                </div>
                              </div>
                              
                              {entry.deviceFingerprint && (
                                <div className="mt-1 text-xs text-gray-500">
                                  Device ID: {entry.deviceFingerprint.substring(0, 12)}...
                                </div>
                              )}
                              
                              {!entry.success && entry.failureReason && (
                                <div className="mt-2 text-sm text-red-600 bg-red-100 p-2 rounded">
                                  <strong>Failure Reason:</strong> {entry.failureReason}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right text-xs text-gray-500">
                            {new Date(entry.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Login Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {loginHistory.filter(l => l.success).length}
                  </div>
                  <div className="text-sm text-gray-600">Successful Logins</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {loginHistory.filter(l => !l.success).length}
                  </div>
                  <div className="text-sm text-gray-600">Failed Attempts</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {new Set(loginHistory.map(l => l.ip)).size}
                  </div>
                  <div className="text-sm text-gray-600">Unique IPs</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Security Logs Tab */}
      {activeTab === 'security-logs' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Audit Logs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Recent Security Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {auditLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        log.success ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <p className="text-sm font-medium">{log.email}</p>
                        <p className="text-xs text-gray-500">{log.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{log.ip}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Locked Accounts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="h-5 w-5 mr-2" />
                Locked Accounts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {lockedAccounts.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No locked accounts</p>
                ) : (
                  lockedAccounts.map((account, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{account.email}</p>
                        <p className="text-xs text-gray-500">IP: {account.ip}</p>
                        <p className="text-xs text-gray-400">
                          Locked: {new Date(account.lockTime).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={account.isActive ? "destructive" : "secondary"}>
                          {account.isActive ? 'Locked' : 'Expired'}
                        </Badge>
                        {account.isActive && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => unlockAccount(account.email)}
                          >
                            <Unlock className="h-3 w-3 mr-1" />
                            Unlock
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}