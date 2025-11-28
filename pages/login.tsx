import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Signing In...');

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Verify token with backend
      fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          router.push('/dashboard');
        } else {
          localStorage.removeItem('authToken');
        }
      });
    }
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setLoadingMessage('Validating credentials...');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      // Use new secure login API
      setLoadingMessage('Connecting to server...');
      const response = await fetch('/api/auth/secure-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setLoadingMessage('Login successful! Redirecting...');
        localStorage.setItem('authToken', data.token);
        
        // Show security info if new device/IP
        if (data.security?.isNewDevice || data.security?.isNewIP) {
          console.log('Security Alert:', data.security);
          // You can show a toast notification here
        }
        
        // Add a small delay to show success message
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } else {
        // Handle specific error types
        if (response.status === 429) {
          setError('Too many login attempts. Please try again after 15 minutes.');
        } else if (response.status === 423) {
          setError('Account is temporarily locked. Please try again later.');
        } else {
          setError(data.error || 'Login failed');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
    } finally {
      if (!error) {
        // Keep loading state for redirect
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      } else {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-white to-blue-100 px-4">
        <Card className="w-full max-w-md shadow-2xl border-0 relative">
          {/* Loading Overlay for Card */}
          {loading && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
              <div className="text-center">
                <div className="relative mx-auto w-12 h-12 mb-4">
                  <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                  <div className="absolute top-2 left-2 w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                </div>
                <p className="text-purple-700 font-medium text-sm mb-1">{loadingMessage}</p>
                <div className="flex justify-center space-x-1 mt-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Lavish Dashboard
          </CardTitle>
          <p className="text-gray-600 text-sm">
            Sign in to access your dashboard
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 transition-all duration-200 relative overflow-hidden"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="relative">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute top-0 left-0 w-5 h-5 border-2 border-white/30 rounded-full"></div>
                  </div>
                  <span className="text-white font-medium">{loadingMessage}</span>
                </div>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <Lock className="w-4 h-4" />
                  <span>Sign In</span>
                </span>
              )}
              
              {loading && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-700 opacity-20 animate-pulse"></div>
              )}
            </Button>

            {/* Enhanced Loading Overlay */}
            {loading && (
              <div className="mt-4 flex items-center justify-center space-x-2 text-purple-600">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-sm font-medium">Verifying credentials...</span>
              </div>
            )}
          </form>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="text-center text-xs text-gray-500">
              <p>Lavish StarSoft Dashboard</p>
              <p>Secure Access Portal</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
}