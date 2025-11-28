import React from 'react';
import Head from 'next/head';
import AdminSidebar from '@/components/AdminSidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import ContactSubmissionsManager from '@/components/ContactSubmissionsManager';

const ContactSubmissionsPage = () => {
  return (
    <ProtectedRoute>
      <Head>
        <title>Contact Submissions - Admin Dashboard</title>
        <meta name="description" content="Manage contact form submissions and lead management" />
      </Head>

      <div className="flex h-screen bg-gray-50">
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="px-6 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Contact Submissions</h1>
                  <p className="text-gray-600 mt-1">Manage contact form submissions and leads</p>
                </div>
              </div>
            </div>
          </header>
          
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
            <ContactSubmissionsManager />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ContactSubmissionsPage;