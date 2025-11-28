import React from 'react';
import Head from 'next/head';
import AdminSidebar from '@/components/AdminSidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import SecurityDashboard from '@/components/SecurityDashboard';

const SecurityDashboardPage = () => {
  return (
    <ProtectedRoute>
      <Head>
        <title>Security Dashboard - Lavish Star Soft</title>
        <meta name="description" content="Security monitoring and audit logs for Lavish Star Soft admin panel" />
      </Head>

      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <AdminSidebar />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="px-6 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Security Monitor</h1>
                  <p className="text-gray-600 text-sm mt-1">Monitor login activity, security events, and system access</p>
                </div>
              </div>
            </div>
          </header>

          {/* Scrollable Main Content */}
          <main className="flex-1 overflow-y-auto p-6">
            <SecurityDashboard />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default SecurityDashboardPage;