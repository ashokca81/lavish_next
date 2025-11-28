import React from 'react';
import Head from 'next/head';
import AdminSidebar from '@/components/AdminSidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import ProjectRequestsManager from '@/components/ProjectRequestsManager';

const ProjectRequestsPage = () => {
  return (
    <ProtectedRoute>
      <Head>
        <title>Project Requests - Admin Dashboard</title>
        <meta name="description" content="Manage project requests and client inquiries" />
      </Head>

      <div className="flex h-screen bg-gray-50">
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="px-6 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Project Requests</h1>
                  <p className="text-gray-600 mt-1">Manage and track client project requests</p>
                </div>
              </div>
            </div>
          </header>
          
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
            <ProjectRequestsManager />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ProjectRequestsPage;