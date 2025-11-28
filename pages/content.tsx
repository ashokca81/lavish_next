import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { 
  Plus, Edit3, Trash2, Upload, Eye, EyeOff,
  Image as ImageIcon, Type, Link as LinkIcon, Settings,
  Save, RefreshCw, Globe, Layout, Palette, Monitor
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import DashboardNav from '@/components/DashboardNav';
import ProtectedRoute from '@/components/ProtectedRoute';

interface ContentItem {
  _id: string;
  type: string;
  section: string;
  title: string;
  content: string;
  imageUrl?: string;
  linkUrl?: string;
  metadata?: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const ContentManagement = () => {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [filteredContent, setFilteredContent] = useState<ContentItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);
  const [activeTab, setActiveTab] = useState('hero');
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    type: 'hero',
    section: '',
    title: '',
    content: '',
    imageUrl: '',
    linkUrl: '',
    isActive: true,
    metadata: '{}'
  });

  const contentTypes = [
    { id: 'hero', label: 'Hero Section', icon: Layout },
    { id: 'logo', label: 'Logo & Branding', icon: ImageIcon },
    { id: 'service', label: 'Services', icon: Settings },
    { id: 'about', label: 'About Section', icon: Type },
    { id: 'contact', label: 'Contact Info', icon: LinkIcon },
    { id: 'footer', label: 'Footer', icon: Globe },
    { id: 'theme', label: 'Theme & Colors', icon: Palette }
  ];

  // Fetch content
  const fetchContent = async (type?: string) => {
    try {
      const url = type ? `/api/content?type=${type}` : '/api/content';
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setContentItems(data.data);
        setFilteredContent(data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  // Filter content by active tab
  useEffect(() => {
    const filtered = contentItems.filter(item => item.type === activeTab);
    setFilteredContent(filtered);
  }, [contentItems, activeTab]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let metadata = {};
      try {
        metadata = JSON.parse(formData.metadata);
      } catch {
        metadata = {};
      }

      const contentData: any = {
        ...formData,
        metadata
      };

      const url = editingContent ? '/api/content' : '/api/content';
      const method = editingContent ? 'PUT' : 'POST';
      
      if (editingContent) {
        contentData._id = editingContent._id;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contentData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(editingContent ? 'Content updated successfully' : 'Content created successfully');
        setIsModalOpen(false);
        setEditingContent(null);
        resetForm();
        fetchContent();
      } else {
        toast.error(data.error || 'Failed to save content');
      }
    } catch (error) {
      toast.error('Failed to save content');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      type: activeTab,
      section: '',
      title: '',
      content: '',
      imageUrl: '',
      linkUrl: '',
      isActive: true,
      metadata: '{}'
    });
  };

  // Edit content
  const handleEdit = (content: ContentItem) => {
    setEditingContent(content);
    setFormData({
      type: content.type,
      section: content.section,
      title: content.title,
      content: content.content,
      imageUrl: content.imageUrl || '',
      linkUrl: content.linkUrl || '',
      isActive: content.isActive,
      metadata: JSON.stringify(content.metadata || {}, null, 2)
    });
    setIsModalOpen(true);
  };

  // Delete content
  const handleDelete = async (contentId: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;

    try {
      const response = await fetch(`/api/content?id=${contentId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Content deleted successfully');
        fetchContent();
      } else {
        toast.error(data.error || 'Failed to delete content');
      }
    } catch (error) {
      toast.error('Failed to delete content');
    }
  };

  // Toggle content active status
  const toggleActiveStatus = async (content: ContentItem) => {
    try {
      const response = await fetch('/api/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: content._id,
          isActive: !content.isActive
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Content ${!content.isActive ? 'activated' : 'deactivated'}`);
        fetchContent();
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Content Management - Lavish Dashboard</title>
        <meta name="description" content="Manage website content dynamically" />
      </Head>
        <div className="min-h-screen bg-gray-50">
        <DashboardNav />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
              <p className="text-gray-600 mt-1">Manage your website content dynamically</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => fetchContent()}>
                <RefreshCw size={16} className="mr-2" />
                Refresh
              </Button>
              
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { resetForm(); setEditingContent(null); }}>
                    <Plus size={16} className="mr-2" />
                    Add Content
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingContent ? 'Edit Content' : 'Add New Content'}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Content Type</label>
                        <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {contentTypes.map(type => (
                              <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Section</label>
                        <Input
                          value={formData.section}
                          onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                          placeholder="e.g., main, secondary, sidebar"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Title</label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Content</label>
                      <Textarea
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        rows={4}
                        placeholder="Enter your content here..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Image URL</label>
                        <Input
                          value={formData.imageUrl}
                          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Link URL</label>
                        <Input
                          value={formData.linkUrl}
                          onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Metadata (JSON)</label>
                      <Textarea
                        value={formData.metadata}
                        onChange={(e) => setFormData({ ...formData, metadata: e.target.value })}
                        rows={3}
                        placeholder='{"color": "#000", "fontSize": "16px"}'
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={formData.isActive}
                        onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                      />
                      <label className="text-sm font-medium">Active</label>
                    </div>

                    <div className="flex justify-end space-x-3">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsModalOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={loading}>
                        <Save size={16} className="mr-2" />
                        {loading ? 'Saving...' : (editingContent ? 'Update' : 'Create')}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-7">
              {contentTypes.map((type) => (
                <TabsTrigger 
                  key={type.id} 
                  value={type.id}
                  className="flex items-center gap-1 text-xs"
                >
                  <type.icon size={14} />
                  <span className="hidden sm:inline">{type.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {contentTypes.map((type) => (
              <TabsContent key={type.id} value={type.id} className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <type.icon size={20} />
                    {type.label} Content
                  </h2>
                  <Badge variant="outline">
                    {filteredContent.length} items
                  </Badge>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading content...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredContent.map((content) => (
                      <Card key={content._id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <CardTitle className="text-lg flex items-center gap-2">
                                {content.title}
                                {content.isActive ? 
                                  <Eye size={16} className="text-green-600" /> : 
                                  <EyeOff size={16} className="text-gray-400" />
                                }
                              </CardTitle>
                              {content.section && (
                                <Badge variant="secondary" className="mt-1">
                                  {content.section}
                                </Badge>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => toggleActiveStatus(content)}
                              >
                                {content.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleEdit(content)}
                              >
                                <Edit3 size={14} />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleDelete(content._id)}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-3">
                          <p className="text-sm text-gray-600 line-clamp-3">
                            {content.content}
                          </p>
                          
                          {content.imageUrl && (
                            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                              <img 
                                src={content.imageUrl} 
                                alt={content.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                          
                          {content.linkUrl && (
                            <div className="flex items-center gap-1 text-sm text-blue-600">
                              <LinkIcon size={14} />
                              <span className="truncate">{content.linkUrl}</span>
                            </div>
                          )}
                          
                          <div className="text-xs text-gray-500">
                            Updated: {new Date(content.updatedAt).toLocaleDateString()}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {filteredContent.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <type.icon size={64} className="mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No {type.label.toLowerCase()} content</h3>
                    <p className="text-gray-600 mb-4">
                      Create your first {type.label.toLowerCase()} content item to get started.
                    </p>
                    <Button onClick={() => { 
                      setFormData({...formData, type: type.id}); 
                      setIsModalOpen(true); 
                    }}>
                      <Plus size={16} className="mr-2" />
                      Add {type.label}
                    </Button>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
        </div>
      </ProtectedRoute>
  );
};

export default ContentManagement;