import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  BarChart3, FolderOpen, Users, Settings, 
  Home, FileText, Calendar, DollarSign, LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/button';

const DashboardNav = () => {
  const router = useRouter();
  const { user, logout } = useAuth();

  const navItems = [
    { 
      href: '/dashboard', 
      label: 'Dashboard', 
      icon: BarChart3,
      description: 'Overview & Analytics'
    },
    { 
      href: '/projects', 
      label: 'Projects', 
      icon: FolderOpen,
      description: 'Manage Projects'
    },
    { 
      href: '/content', 
      label: 'Content', 
      icon: FileText,
      description: 'Website Content'
    },
    { 
      href: '/clients', 
      label: 'Clients', 
      icon: Users,
      description: 'Client Management'
    },
    { 
      href: '/', 
      label: 'Website', 
      icon: Home,
      description: 'Back to Website'
    }
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="flex items-center py-4">
              <BarChart3 className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Lavish</h1>
                <p className="text-xs text-gray-500">Business Dashboard</p>
              </div>
            </Link>
            
            <div className="hidden md:flex space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    router.pathname === item.href
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">{user?.email || 'Admin'}</p>
              <p className="text-xs text-gray-500">Lavishstar Digital</p>
            </div>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.email ? user.email.charAt(0).toUpperCase() : 'L'}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNav;