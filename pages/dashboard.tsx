import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  Users, DollarSign, ShoppingCart, TrendingUp, 
  Eye, MessageSquare, Heart, Share2,
  Calendar, Clock, Settings,
  RefreshCcw, Download, Filter, Search, BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AdminSidebar from '@/components/AdminSidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import SecurityDashboard from '@/components/SecurityDashboard';

// Sample data for charts
const revenueData = [
  { month: 'Jan', revenue: 4000, expenses: 2400 },
  { month: 'Feb', revenue: 3000, expenses: 1398 },
  { month: 'Mar', revenue: 2000, expenses: 9800 },
  { month: 'Apr', revenue: 2780, expenses: 3908 },
  { month: 'May', revenue: 1890, expenses: 4800 },
  { month: 'Jun', revenue: 2390, expenses: 3800 },
];

const userGrowthData = [
  { month: 'Jan', users: 400 },
  { month: 'Feb', users: 300 },
  { month: 'Mar', users: 600 },
  { month: 'Apr', users: 800 },
  { month: 'May', users: 700 },
  { month: 'Jun', users: 900 },
];

const pieData = [
  { name: 'Web Development', value: 400, color: '#0088FE' },
  { name: 'Mobile Apps', value: 300, color: '#00C49F' },
  { name: 'UI/UX Design', value: 300, color: '#FFBB28' },
  { name: 'Consulting', value: 200, color: '#FF8042' },
];

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalRevenue: 0,
    totalOrders: 0,
    conversionRate: 0,
    projectRequests: 0,
    contactSubmissions: 0,
    recentProjects: [] as any[],
    recentActivities: [] as any[],
    recentProjectRequests: [] as any[],
    recentContactSubmissions: [] as any[]
  });
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch general analytics
        const response = await fetch('/api/dashboard/analytics');
        const data = await response.json();
        
        // Fetch project requests and contact submissions
        const token = localStorage.getItem('authToken');
        const headers = { 'Authorization': `Bearer ${token}` };
        
        const [projectRequestsRes, contactSubmissionsRes] = await Promise.all([
          fetch('/api/admin/project-requests?limit=5', { headers }),
          fetch('/api/admin/contact-submissions?limit=5', { headers })
        ]);
        
        const projectRequestsData = projectRequestsRes.ok ? await projectRequestsRes.json() : { summary: { totalRequests: 0 }, projectRequests: [] };
        const contactSubmissionsData = contactSubmissionsRes.ok ? await contactSubmissionsRes.json() : { summary: { totalSubmissions: 0 }, contactSubmissions: [] };
        
        if (data.success) {
          setAnalyticsData(data.data);
          setDashboardData({
            totalUsers: data.data.overview.totalClients,
            totalRevenue: data.data.overview.totalRevenue,
            totalOrders: data.data.overview.totalProjects,
            conversionRate: data.data.overview.completionRate,
            projectRequests: projectRequestsData.summary.totalRequests,
            contactSubmissions: contactSubmissionsData.summary.totalSubmissions,
            recentProjects: data.data.recent.projects,
            recentProjectRequests: projectRequestsData.projectRequests || [],
            recentContactSubmissions: contactSubmissionsData.contactSubmissions || [],
            recentActivities: [
              { id: 1, action: 'New project created', user: 'John Doe', time: '2 hours ago', type: 'project' },
              { id: 2, action: 'Payment received', user: 'TechCorp', time: '4 hours ago', type: 'payment' },
              { id: 3, action: 'Client meeting scheduled', user: 'Sarah Wilson', time: '6 hours ago', type: 'meeting' },
              { id: 4, action: 'Project milestone completed', user: 'Mike Johnson', time: '8 hours ago', type: 'milestone' },
            ]
          });
        } else {
          // Fallback data
          setDashboardData({
            totalUsers: 150,
            totalRevenue: 2500000,
            totalOrders: 45,
            conversionRate: 87,
            projectRequests: projectRequestsData.summary.totalRequests || 24,
            contactSubmissions: contactSubmissionsData.summary.totalSubmissions || 47,
            recentProjects: [],
            recentProjectRequests: projectRequestsData.projectRequests || [],
            recentContactSubmissions: contactSubmissionsData.contactSubmissions || [],
            recentActivities: [
              { id: 1, action: 'New project created', user: 'John Doe', time: '2 hours ago', type: 'project' },
              { id: 2, action: 'Payment received', user: 'TechCorp', time: '4 hours ago', type: 'payment' },
              { id: 3, action: 'Client meeting scheduled', user: 'Sarah Wilson', time: '6 hours ago', type: 'meeting' },
              { id: 4, action: 'Project milestone completed', user: 'Mike Johnson', time: '8 hours ago', type: 'milestone' },
            ]
          });
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = [
    {
      title: 'Total Revenue',
      value: `₹${dashboardData.totalRevenue.toLocaleString()}`,
      change: '+12.5%',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Project Requests',
      value: dashboardData.projectRequests || '24',
      change: '+18.2%',
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Contact Leads',
      value: dashboardData.contactSubmissions || '47',
      change: '+25.3%',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Conversion Rate',
      value: `${dashboardData.conversionRate}%`,
      change: '+2.1%',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Planning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Lavish Dashboard - Analytics & Management</title>
        <meta name="description" content="Lavish business dashboard for analytics and project management" />
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
                  <h1 className="text-2xl font-bold text-gray-900">Lavish Star Dashboard</h1>
                  <p className="text-gray-600 text-sm mt-1">Manage your web development projects and business analytics</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input 
                      placeholder="Search..." 
                      className="pl-9 w-48 h-8 text-sm"
                    />
                  </div>
                  <Button variant="outline" size="sm" className="h-8">
                    <RefreshCcw size={14} className="mr-1" />
                    Refresh
                  </Button>
                  <Button size="sm" className="h-8">
                    <Download size={14} className="mr-1" />
                    Export
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Scrollable Main Content */}
          <main className="flex-1 overflow-y-auto p-6">{/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">{stats.map((stat, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <p className="text-xs text-green-600 mt-1">
                    {stat.change} from last month
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Revenue Chart */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 size={20} />
                  Revenue & Expenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData?.charts.monthlyRevenue || revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#3B82F6" name="Revenue" />
                    <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* User Growth Chart */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp size={20} />
                  Client Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData?.charts.monthlyProjects || userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey={analyticsData ? "projects" : "users"} 
                      stroke="#8B5CF6" 
                      fill="#8B5CF6" 
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Submissions Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Project Requests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <ShoppingCart size={20} />
                    Recent Project Requests
                  </span>
                  <Button size="sm" variant="outline" onClick={() => window.location.href = '/admin/project-requests'}>
                    View All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.recentProjectRequests.length > 0 ? (
                    dashboardData.recentProjectRequests.map((request: any) => (
                      <div key={request._id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{request.projectTitle}</h4>
                          <p className="text-sm text-gray-600">{request.fullName}</p>
                          <p className="text-xs text-gray-500">{request.projectType}</p>
                        </div>
                        <div className="text-right">
                          <Badge className={`${request.priority === 'urgent' ? 'bg-red-100 text-red-800' : 
                                           request.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                           'bg-blue-100 text-blue-800'}`}>
                            {request.priority?.toUpperCase() || 'MEDIUM'}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            {request.estimatedValue ? `₹${request.estimatedValue.toLocaleString()}` : request.budget}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-8">No recent project requests</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Contact Submissions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <MessageSquare size={20} />
                    Recent Contact Leads
                  </span>
                  <Button size="sm" variant="outline" onClick={() => window.location.href = '/admin/contact-submissions'}>
                    View All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.recentContactSubmissions.length > 0 ? (
                    dashboardData.recentContactSubmissions.map((submission: any) => (
                      <div key={submission._id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{submission.subject}</h4>
                          <p className="text-sm text-gray-600">{submission.fullName}</p>
                          <p className="text-xs text-gray-500">{submission.inquiryType}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <Badge className={`${submission.leadScore >= 70 ? 'bg-green-100 text-green-800' : 
                                             submission.leadScore >= 50 ? 'bg-blue-100 text-blue-800' :
                                             'bg-gray-100 text-gray-800'}`}>
                              Score: {submission.leadScore || 0}
                            </Badge>
                            {submission.hasProject && <Badge variant="secondary">Has Project</Badge>}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {submission.urgency?.split(' - ')[0] || 'Medium'}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-8">No recent contact submissions</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;