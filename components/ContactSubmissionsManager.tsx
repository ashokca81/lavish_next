import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Search, Mail, Phone, User, MessageSquare, Clock, 
  TrendingUp, AlertCircle, CheckCircle, XCircle, Star,
  RefreshCw, ChevronLeft, ChevronRight, Download, Eye, Edit,
  X, Calendar, Plus, Tag, FileText, Briefcase
} from 'lucide-react';
import { format } from 'date-fns';

interface ContactSubmission {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  website: string;
  inquiryType: string;
  subject: string;
  message: string;
  urgency: string;
  serviceInterest: string[];
  hasProject: boolean;
  projectBudget: string;
  projectTimeline: string;
  leadScore: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'new' | 'contacted' | 'in-progress' | 'resolved' | 'closed';
  submittedAt: string;
  followUpDate: string;
  country: string;
  city: string;
  tags: string[];
  assignedTo?: string;
  source?: string;
}

interface ContactSubmissionsManagerProps {
  className?: string;
}

const ContactSubmissionsManager: React.FC<ContactSubmissionsManagerProps> = ({ className }) => {
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [inquiryTypeFilter, setInquiryTypeFilter] = useState('all');
  const [leadScoreFilter, setLeadScoreFilter] = useState('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;
  
  // Summary stats
  const [summary, setSummary] = useState({
    totalSubmissions: 0,
    avgLeadScore: 0,
    newSubmissions: 0,
    inProgress: 0,
    resolved: 0,
    highValueLeads: 0
  });

  const [inquiryTypeStats, setInquiryTypeStats] = useState([]);

  const statusColors = {
    'new': 'bg-blue-100 text-blue-800',
    'contacted': 'bg-yellow-100 text-yellow-800',
    'in-progress': 'bg-purple-100 text-purple-800',
    'resolved': 'bg-green-100 text-green-800',
    'closed': 'bg-gray-100 text-gray-800'
  };

  const priorityColors = {
    'low': 'bg-gray-100 text-gray-800',
    'medium': 'bg-blue-100 text-blue-800',
    'high': 'bg-orange-100 text-orange-800',
    'urgent': 'bg-red-100 text-red-800'
  };

  const urgencyColors = {
    'Low - General inquiry': 'bg-gray-100 text-gray-800',
    'Medium - Within a week': 'bg-blue-100 text-blue-800',
    'High - Within 2-3 days': 'bg-orange-100 text-orange-800',
    'Urgent - Same day response needed': 'bg-red-100 text-red-800'
  };

  const fetchContactSubmissions = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(priorityFilter !== 'all' && { priority: priorityFilter }),
        ...(inquiryTypeFilter !== 'all' && { inquiryType: inquiryTypeFilter }),
        ...(leadScoreFilter !== 'all' && { leadScore: leadScoreFilter })
      });

      const response = await fetch(`/api/admin/contact-submissions?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setContactSubmissions(data.contactSubmissions);
        setTotalPages(data.pagination.pages);
        setTotalCount(data.pagination.total);
        setSummary(data.summary);
        setInquiryTypeStats(data.inquiryTypeStats || []);
      } else {
        setError('Failed to fetch contact submissions');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContactSubmissions();
  }, [currentPage, statusFilter, priorityFilter, inquiryTypeFilter, leadScoreFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchContactSubmissions();
  };

  const handleStatusUpdate = async (submissionId: string, newStatus: string) => {
    try {
      console.log('🔄 Updating contact submission status:', { submissionId, newStatus });
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication required. Please log in again.');
        return;
      }

      const response = await fetch(`/api/admin/contact-submissions/${submissionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      console.log('📝 Status update response:', { status: response.status, data });

      if (response.ok) {
        console.log('✅ Status updated successfully');
        // Update the selected submission if it's the one being updated
        if (selectedSubmission && selectedSubmission._id === submissionId) {
          setSelectedSubmission({ ...selectedSubmission, status: newStatus });
        }
        // Refresh the list
        fetchContactSubmissions();
        setError(null); // Clear any previous errors
      } else {
        console.error('❌ Failed to update status:', data);
        setError(data.message || 'Failed to update status. Please try again.');
      }
    } catch (err) {
      console.error('💥 Error updating status:', err);
      setError('Network error. Please check your connection and try again.');
    }
  };

  const getLeadScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <AlertCircle size={16} />;
      case 'resolved': return <CheckCircle size={16} />;
      case 'closed': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  if (loading && contactSubmissions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin" size={24} />
        <span className="ml-2">Loading contact submissions...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Contacts</p>
                <p className="text-2xl font-bold">{summary.totalSubmissions}</p>
              </div>
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Lead Score</p>
                <p className="text-2xl font-bold">{Math.round(summary.avgLeadScore)}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">New Contacts</p>
                <p className="text-2xl font-bold text-blue-600">{summary.newSubmissions}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Value Leads</p>
                <p className="text-2xl font-bold text-green-600">{summary.highValueLeads}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Table Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Contact Submissions</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchContactSubmissions}>
                <RefreshCw size={16} className="mr-1" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download size={16} className="mr-1" />
                Export
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {/* Search and Filters */}
          <div className="space-y-4 mb-6">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  placeholder="Search by name, email, company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Search</Button>
            </form>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={inquiryTypeFilter} onValueChange={setInquiryTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="General Inquiry">General Inquiry</SelectItem>
                  <SelectItem value="Service Quote Request">Quote Request</SelectItem>
                  <SelectItem value="Project Consultation">Consultation</SelectItem>
                  <SelectItem value="Partnership Opportunity">Partnership</SelectItem>
                  <SelectItem value="Technical Support">Support</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={leadScoreFilter} onValueChange={setLeadScoreFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Scores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Scores</SelectItem>
                  <SelectItem value="80">80+ High Value</SelectItem>
                  <SelectItem value="60">60+ Good Leads</SelectItem>
                  <SelectItem value="40">40+ Prospects</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setPriorityFilter('all');
                setInquiryTypeFilter('all');
                setLeadScoreFilter('all');
                setCurrentPage(1);
              }}>
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Contact Submissions Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Contact</th>
                  <th className="text-left p-3 font-medium">Inquiry</th>
                  <th className="text-left p-3 font-medium">Type</th>
                  <th className="text-left p-3 font-medium">Lead Score</th>
                  <th className="text-left p-3 font-medium">Urgency</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Date</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contactSubmissions.map((submission) => (
                  <tr key={submission._id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{submission.fullName}</div>
                        <div className="text-sm text-gray-600">{submission.email}</div>
                        {submission.phone && (
                          <div className="text-xs text-gray-500">{submission.phone}</div>
                        )}
                        {submission.company && (
                          <div className="text-xs text-blue-600">{submission.company}</div>
                        )}
                        {submission.country && submission.country !== 'India' && (
                          <div className="text-xs text-purple-600">{submission.country}</div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div>
                        <div className="font-medium max-w-xs truncate">{submission.subject}</div>
                        <div className="text-sm text-gray-600 max-w-xs truncate">
                          {submission.message}
                        </div>
                        {submission.hasProject && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            Has Project
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline">{submission.inquiryType}</Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className={`px-2 py-1 rounded text-sm font-medium ${getLeadScoreColor(submission.leadScore)}`}>
                          {submission.leadScore}
                        </div>
                        {submission.leadScore >= 70 && <Star className="w-4 h-4 text-yellow-500" />}
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className={urgencyColors[submission.urgency as keyof typeof urgencyColors] || 'bg-gray-100 text-gray-800'}>
                        {submission.urgency?.split(' - ')[0] || 'Medium'}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(submission.status)}
                        <Badge className={statusColors[submission.status]}>
                          {submission.status.replace('-', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">
                        {format(new Date(submission.submittedAt), 'MMM dd, yyyy')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(submission.submittedAt), 'HH:mm')}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedSubmission(submission)}
                          className="hover:bg-green-50 hover:text-green-600"
                          title="View Message"
                        >
                          <MessageSquare size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => window.open(`mailto:${submission.email}`)}
                          className="hover:bg-purple-50 hover:text-purple-600"
                          title="Send Email"
                        >
                          <Mail size={16} />
                        </Button>
                        {submission.phone && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => window.open(`tel:${submission.phone}`)}
                            className="hover:bg-cyan-50 hover:text-cyan-600"
                            title="Call Phone"
                          >
                            <Phone size={16} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} results
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  <ChevronLeft size={16} />
                  Previous
                </Button>
                <span className="px-3 py-1 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-gradient-to-br from-black/70 via-blue-900/50 to-purple-900/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in-0 duration-300">
          <div className="w-full max-w-5xl max-h-[95vh] overflow-hidden rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-purple-600 p-[2px] rounded-2xl">
              <Card className="bg-white dark:bg-gray-900 rounded-2xl border-0 shadow-none overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 via-cyan-50 to-purple-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 border-b border-blue-200/30 p-6">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <Mail className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          {selectedSubmission.subject || 'Contact Inquiry'}
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Submitted on {new Date(selectedSubmission.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedSubmission(null)}
                      className="hover:bg-red-100 hover:text-red-600 rounded-full p-2 transition-colors duration-200"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 max-h-[calc(95vh-8rem)] overflow-y-auto custom-scrollbar">
                  <div className="space-y-6">
                    {/* Status and Priority Banner */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 p-4 rounded-xl border border-blue-200/50">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status:</span>
                            <Badge 
                              variant={selectedSubmission.status === 'new' ? 'default' : 
                                      selectedSubmission.status === 'contacted' ? 'secondary' :
                                      selectedSubmission.status === 'resolved' ? 'success' : 'outline'}
                              className="capitalize"
                            >
                              {selectedSubmission.status || 'New'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Priority:</span>
                            <Badge 
                              variant={selectedSubmission.priority === 'high' ? 'destructive' :
                                      selectedSubmission.priority === 'medium' ? 'default' : 'secondary'}
                              className="capitalize"
                            >
                              {selectedSubmission.priority || 'Medium'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Lead Score:</span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              (selectedSubmission.leadScore || 0) >= 80 ? 'bg-green-100 text-green-800' :
                              (selectedSubmission.leadScore || 0) >= 60 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {selectedSubmission.leadScore || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-750 p-5 rounded-xl border border-blue-200/50 hover:shadow-lg transition-shadow duration-300">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">Contact Information</h3>
                        </div>
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-600 dark:text-gray-400 min-w-[60px]">Name:</span>
                            <span className="text-gray-800 dark:text-gray-200">{selectedSubmission.fullName || 'Not provided'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-600 dark:text-gray-400 min-w-[60px]">Email:</span>
                            <a href={`mailto:${selectedSubmission.email}`} className="text-blue-600 hover:text-blue-800 transition-colors">
                              {selectedSubmission.email}
                            </a>
                          </div>
                          {selectedSubmission.phone && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-600 dark:text-gray-400 min-w-[60px]">Phone:</span>
                              <a href={`tel:${selectedSubmission.phone}`} className="text-blue-600 hover:text-blue-800 transition-colors">
                                {selectedSubmission.phone}
                              </a>
                            </div>
                          )}
                          {selectedSubmission.company && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-600 dark:text-gray-400 min-w-[60px]">Company:</span>
                              <span className="text-gray-800 dark:text-gray-200">{selectedSubmission.company}</span>
                            </div>
                          )}
                          {selectedSubmission.jobTitle && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-600 dark:text-gray-400 min-w-[60px]">Role:</span>
                              <span className="text-gray-800 dark:text-gray-200">{selectedSubmission.jobTitle}</span>
                            </div>
                          )}
                          {selectedSubmission.website && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-600 dark:text-gray-400 min-w-[60px]">Website:</span>
                              <a href={selectedSubmission.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition-colors">
                                {selectedSubmission.website}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-750 p-5 rounded-xl border border-purple-200/50 hover:shadow-lg transition-shadow duration-300">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                            <FileText className="w-4 h-4 text-white" />
                          </div>
                          <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">Inquiry Details</h3>
                        </div>
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-600 dark:text-gray-400 min-w-[60px]">Type:</span>
                            <span className="text-gray-800 dark:text-gray-200">{selectedSubmission.inquiryType || 'General'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-600 dark:text-gray-400 min-w-[60px]">Urgency:</span>
                            <span className="text-gray-800 dark:text-gray-200">{selectedSubmission.urgency || 'Medium'}</span>
                          </div>
                          {selectedSubmission.source && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-600 dark:text-gray-400 min-w-[60px]">Source:</span>
                              <span className="text-gray-800 dark:text-gray-200 capitalize">{selectedSubmission.source}</span>
                            </div>
                          )}
                          {(selectedSubmission.city || selectedSubmission.country) && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-600 dark:text-gray-400 min-w-[60px]">Location:</span>
                              <span className="text-gray-800 dark:text-gray-200">
                                {[selectedSubmission.city, selectedSubmission.country].filter(Boolean).join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Message Section */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-750 p-5 rounded-xl border border-green-200/50 hover:shadow-lg transition-shadow duration-300">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                          <MessageSquare className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">Message</h3>
                      </div>
                      <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-green-200/30 shadow-sm">
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                          {selectedSubmission.message || 'No message provided.'}
                        </p>
                      </div>
                    </div>
                    {/* Tags and Services Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-gray-800 dark:to-gray-750 p-5 rounded-xl border border-orange-200/50 hover:shadow-lg transition-shadow duration-300">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center">
                            <Star className="w-4 h-4 text-white" />
                          </div>
                          <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">Services of Interest</h3>
                        </div>
                        <div className="flex flex-wrap gap-2 min-h-[40px] items-center">
                          {(selectedSubmission.serviceInterest || []).length > 0 ? (
                            (selectedSubmission.serviceInterest || []).map((service, index) => (
                              <Badge key={index} variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-200 transition-colors">
                                {service}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-400 italic">No specific services mentioned</span>
                          )}
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-800 dark:to-gray-750 p-5 rounded-xl border border-indigo-200/50 hover:shadow-lg transition-shadow duration-300">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center">
                            <Tag className="w-4 h-4 text-white" />
                          </div>
                          <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">Tags</h3>
                        </div>
                        <div className="flex flex-wrap gap-2 min-h-[40px] items-center">
                          {(selectedSubmission.tags || []).length > 0 ? (
                            (selectedSubmission.tags || []).map((tag, index) => (
                              <Badge key={index} variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-colors">
                                {tag}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-400 italic">No tags assigned</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Project Information */}
                    {selectedSubmission.hasProject && (
                      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-gray-800 dark:to-gray-750 p-5 rounded-xl border border-cyan-200/50 hover:shadow-lg transition-shadow duration-300">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                            <Briefcase className="w-4 h-4 text-white" />
                          </div>
                          <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">Project Information</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-cyan-200/30">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Budget:</span>
                            <p className="text-gray-800 dark:text-gray-200 font-medium">{selectedSubmission.projectBudget}</p>
                          </div>
                          <div className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-cyan-200/30">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Timeline:</span>
                            <p className="text-gray-800 dark:text-gray-200 font-medium">{selectedSubmission.projectTimeline}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Action Buttons */}
                    <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-gray-750 p-5 rounded-xl border border-gray-200/50 mt-6">
                      <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 mb-4">Quick Actions</h3>
                      <div className="flex flex-wrap gap-3">
                        <Button 
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                          onClick={() => window.open(`mailto:${selectedSubmission.email}`)}
                        >
                          <Mail className="w-4 h-4" />
                          Reply via Email
                        </Button>
                        <Button 
                          variant="outline" 
                          className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 transition-all duration-300 flex items-center gap-2"
                        >
                          <Calendar className="w-4 h-4" />
                          Schedule Call
                        </Button>
                        <Button 
                          variant="outline"
                          className="border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400 transition-all duration-300 flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add Notes
                        </Button>
                        <Select 
                          value={selectedSubmission.status}
                          onValueChange={(value) => handleStatusUpdate(selectedSubmission._id, value)}
                        >
                          <SelectTrigger className="w-auto min-w-[140px] border-purple-300 hover:border-purple-400 transition-colors">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">🆕 New</SelectItem>
                            <SelectItem value="contacted">📞 Contacted</SelectItem>
                            <SelectItem value="in-progress">⚡ In Progress</SelectItem>
                            <SelectItem value="resolved">✅ Resolved</SelectItem>
                            <SelectItem value="closed">❌ Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactSubmissionsManager;