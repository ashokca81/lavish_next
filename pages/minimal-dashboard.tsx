import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  Users, DollarSign, TrendingUp, 
  Eye, MessageSquare, Heart, Share2,
  Calendar, Clock, FileText,
  RefreshCcw, Download, Search, BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AdminSidebar from '@/components/AdminSidebar';
import ProtectedRoute from '@/components/ProtectedRoute';

// Sample data for web development business
const revenueData = [
  { month: 'Jan', revenue: 250000, expenses: 180000 },
  { month: 'Feb', revenue: 320000, expenses: 210000 },
  { month: 'Mar', revenue: 290000, expenses: 195000 },
  { month: 'Apr', revenue: 380000, expenses: 250000 },
  { month: 'May', revenue: 450000, expenses: 280000 },
  { month: 'Jun', revenue: 520000, expenses: 320000 },
];

const userGrowthData = [
  { month: 'Jan', clients: 12 },
  { month: 'Feb', clients: 15 },
  { month: 'Mar', clients: 18 },
  { month: 'Apr', clients: 22 },
  { month: 'May', clients: 28 },
  { month: 'Jun', clients: 34 },
];

const serviceData = [
  { name: 'Web Development', value: 45, color: '#0088FE' },
  { name: 'Mobile Apps', value: 25, color: '#00C49F' },
  { name: 'UI/UX Design', value: 20, color: '#FFBB28' },
  { name: 'Digital Marketing', value: 10, color: '#FF8042' },
];

const MainDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalRevenue: 0,
    totalOrders: 0,
    conversionRate: 0,
    recentProjects: [] as any[],
    recentActivities: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard/analytics');
        const data = await response.json();
        
        if (data.success) {
          setDashboardData({
            totalUsers: data.data.overview.totalClients,
            totalRevenue: data.data.overview.totalRevenue,
            totalOrders: data.data.overview.totalProjects,
            conversionRate: data.data.overview.completionRate,
            recentProjects: data.data.recent.projects,
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
        // Set default mock data for web development business
        setDashboardData({
          totalUsers: 34,
          totalRevenue: 520000,
          totalOrders: 28,
          conversionRate: 95.2,
          recentProjects: [],
          recentActivities: [
            { id: 1, action: 'New website project started', user: 'TechCorp Solutions', time: '2 hours ago', type: 'project' },
            { id: 2, action: 'Payment received for mobile app', user: 'StartupXYZ', time: '4 hours ago', type: 'payment' },
            { id: 3, action: 'Client consultation scheduled', user: 'Retail Plus', time: '6 hours ago', type: 'meeting' },
            { id: 4, action: 'Website deployment completed', user: 'Fashion Hub', time: '8 hours ago', type: 'milestone' },
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = [
    {
      title: 'Active Projects',
      value: `${dashboardData.totalUsers}`,
      change: '+12.5%',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Monthly Revenue',
      value: `₹${dashboardData.totalRevenue.toLocaleString()}`,
      change: '-8%',
      icon: DollarSign,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      isNegative: true
    },
    {
      title: 'Client Value',
      value: '₹1.45M',
      change: '+15%',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'New Clients',
      value: '34',
      change: '+8%',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'project': return <FileText size={16} />;
      case 'payment': return <DollarSign size={16} />;
      case 'meeting': return <Calendar size={16} />;
      case 'milestone': return <TrendingUp size={16} />;
      default: return <Eye size={16} />;
    }
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Lavish Dashboard - Main Overview</title>
        <meta name="description" content="Lavish business dashboard main overview" />
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
                  <h1 className="text-2xl font-bold text-gray-900">Business Overview</h1>
                  <p className="text-gray-600 text-sm mt-1">Monitor your web development business performance</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Button variant="outline" size="sm" className="h-8">
                    Actions
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Scrollable Main Content */}
          <main className="flex-1 overflow-y-auto p-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {stats.map((stat, index) => (
                <Card key={index} className="relative overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <div className="flex items-center mt-2">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            stat.isNegative 
                              ? 'bg-red-100 text-red-600' 
                              : 'bg-green-100 text-green-600'
                          }`}>
                            {stat.change}
                          </span>
                        </div>
                      </div>
                      <div className={`p-3 rounded-full ${stat.bgColor}`}>
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-transparent to-gray-50 opacity-20"></div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Project Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="#3B82F6" name="Revenue" />
                      <Bar dataKey="expenses" fill="#10B981" name="Expenses" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Client Satisfaction Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Client Satisfaction</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-[250px]">
                    <div className="relative">
                      <div className="w-40 h-40 rounded-full bg-gradient-to-r from-blue-400 to-green-400 flex items-center justify-center">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-2xl font-bold">95</div>
                            <div className="text-xs text-gray-500">Percent</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <div className="text-green-600 font-medium">95%</div>
                    <div className="text-xs text-gray-500">Client Satisfaction Rate</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Business Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Project Income', value: '₹5,456', change: '+14%', color: 'text-green-600' },
                { label: 'Development Costs', value: '₹4,764', change: '8%', color: 'text-red-600' },
                { label: 'Client Payments', value: '₹1.5M', change: '+15%', color: 'text-green-600' },
                { label: 'Total Revenue', value: '₹31,564', change: '+12.3%', color: 'text-green-600' }
              ].map((item, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">{item.label}</div>
                      <div className="text-xl font-bold text-gray-900">{item.value}</div>
                      <div className={`text-sm font-medium mt-1 ${item.color}`}>{item.change}</div>
                    </div>
                    <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
                      <div className={`h-1 rounded-full ${
                        item.color.includes('green') ? 'bg-green-500' : 'bg-red-500'
                      }`} style={{ width: `${Math.abs(parseFloat(item.change))}%` }}></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default MainDashboard;