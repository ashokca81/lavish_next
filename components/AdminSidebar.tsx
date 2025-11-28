import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  BarChart3, Settings, 
  Home, FileText, LogOut,
  Shield, Database, Globe, 
  PieChart, TrendingUp, Mail,
  ChevronDown, ChevronRight, Menu, X,
  Building2, Smartphone,
  MessageSquare, Share2, Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/button';

const AdminSidebar = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Function to determine which section should be open based on current route
  const getInitialExpandedSection = () => {
    const currentPath = router.pathname;
    
    if (currentPath.includes('/dashboard') || currentPath.includes('/security-dashboard') || currentPath.includes('/minimal-dashboard')) {
      return 'dashboards';
    } else if (currentPath.includes('/content') || currentPath.includes('/blog') || currentPath.includes('/testimonials') || currentPath.includes('/contact-submissions')) {
      return 'website';
    } else if (currentPath.includes('/project-requests') || currentPath.includes('/services') || currentPath.includes('/portfolio') || currentPath.includes('/clients')) {
      return 'business';
    } else if (currentPath.includes('/web-dev') || currentPath.includes('/mobile-apps') || currentPath.includes('/ui-ux') || currentPath.includes('/technologies')) {
      return 'services';
    } else if (currentPath.includes('/messages') || currentPath.includes('/notifications') || currentPath.includes('/whatsapp-bot') || currentPath.includes('/social-media')) {
      return 'communication';
    }
    
    return 'dashboards'; // default
  };

  const [expandedSections, setExpandedSections] = useState(() => {
    const activeSection = getInitialExpandedSection();
    return {
      dashboards: activeSection === 'dashboards',
      website: activeSection === 'website',
      business: activeSection === 'business',
      services: activeSection === 'services',
      communication: activeSection === 'communication'
    };
  });

  // Update expanded section when route changes
  useEffect(() => {
    const activeSection = getInitialExpandedSection();
    setExpandedSections({
      dashboards: activeSection === 'dashboards',
      website: activeSection === 'website',
      business: activeSection === 'business',
      services: activeSection === 'services',
      communication: activeSection === 'communication'
    });
  }, [router.pathname]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      // If the clicked section is already open, close it
      if (prev[section as keyof typeof prev]) {
        return {
          ...prev,
          [section]: false
        };
      }
      
      // Otherwise, close all sections and open the clicked one
      const newState = Object.keys(prev).reduce((acc, key) => {
        acc[key as keyof typeof prev] = false;
        return acc;
      }, {} as typeof prev);
      
      return {
        ...newState,
        [section]: true
      };
    });
  };

  const menuSections = [
    {
      id: 'dashboards',
      title: 'Dashboards',
      icon: BarChart3,
      items: [
        { href: '/dashboard', label: 'Main Dashboard', icon: Home },
        { href: '/minimal-dashboard', label: 'Business Overview', icon: TrendingUp },
        { href: '/security-dashboard', label: 'Security Monitor', icon: Shield }
      ]
    },

    {
      id: 'website',
      title: 'Website Management',
      icon: Globe,
      items: [
        { href: '/content', label: 'Website Content', icon: FileText },
        { href: '/blog', label: 'Blog Posts', icon: FileText },
        { href: '/testimonials', label: 'Testimonials', icon: MessageSquare },
        { href: '/admin/contact-submissions', label: 'Contact Forms', icon: Mail }
      ]
    },
    {
      id: 'business',
      title: 'Business Management',
      icon: Building2,
      items: [
        { href: '/admin/project-requests', label: 'Project Requests', icon: Building2 },
        { href: '/services', label: 'Services', icon: Settings },
        { href: '/portfolio', label: 'Portfolio', icon: Globe },
        { href: '/clients', label: 'Client Management', icon: Users }
      ]
    },
    {
      id: 'services',
      title: 'Services & Technologies',
      icon: Building2,
      items: [
        { href: '/services/web-dev', label: 'Web Development', icon: Building2 },
        { href: '/services/mobile-apps', label: 'Mobile Apps', icon: Smartphone },
        { href: '/services/ui-ux', label: 'UI/UX Design', icon: PieChart },
        { href: '/technologies', label: 'Technologies', icon: Database }
      ]
    },
    {
      id: 'communication',
      title: 'Communication',
      icon: MessageSquare,
      items: [
        { href: '/messages', label: 'Client Messages', icon: Mail },
        { href: '/notifications', label: 'Notifications', icon: Users },
        { href: '/whatsapp-bot', label: 'WhatsApp Bot', icon: MessageSquare },
        { href: '/social-media', label: 'Social Media', icon: Share2 }
      ]
    }
  ];

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 h-screen transition-all duration-300 flex flex-col",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Lavish</h2>
                <p className="text-xs text-gray-500">Star Soft</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 h-8 w-8"
          >
            {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Menu */}
      <div className="flex-1 overflow-y-auto py-4">
        {!isCollapsed && (
          <div className="px-3 mb-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              MENU
            </h3>
          </div>
        )}
        
        <nav className="space-y-1">
          {menuSections.map((section) => (
            <div key={section.id}>
              <button
                onClick={() => toggleSection(section.id)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
                  isCollapsed && "justify-center"
                )}
              >
                <div className="flex items-center">
                  <section.icon className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
                  {!isCollapsed && (
                    <>
                      <span>{section.title}</span>
                    </>
                  )}
                </div>
                {!isCollapsed && (
                  expandedSections[section.id as keyof typeof expandedSections] ? 
                  <ChevronDown className="h-4 w-4" /> : 
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              
              {!isCollapsed && expandedSections[section.id as keyof typeof expandedSections] && (
                <div className="ml-6 mt-1 space-y-1">
                  {section.items.map((item) => {
                    const isActive = router.pathname === item.href.split('#')[0] && 
                      (!item.href.includes('#') || router.asPath.includes(item.href.split('#')[1]));
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                          isActive
                            ? "bg-blue-100 text-blue-700 border-r-2 border-blue-600"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        )}
                      >
                        <item.icon className="h-4 w-4 mr-3" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* User Profile & Settings */}
      <div className="border-t border-gray-200 p-4">
        {!isCollapsed ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.email ? user.email.charAt(0).toUpperCase() : 'L'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || user?.email?.split('@')[0] || 'Lavish Admin'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || 'lavishstarsoft@gmail.com'}
                </p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                asChild
              >
                <Link href="/settings">
                  <Settings className="w-3 h-3 mr-1" />
                  Settings
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                <LogOut className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col space-y-2">
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-8 w-8"
              asChild
            >
              <Link href="/settings">
                <Settings className="w-4 h-4" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="p-1 h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSidebar;