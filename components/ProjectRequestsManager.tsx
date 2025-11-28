import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Search, Filter, Download, Eye, Edit, Trash2, 
  Calendar, DollarSign, User, Building2, Clock, 
  TrendingUp, AlertCircle, CheckCircle, XCircle,
  RefreshCw, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { format } from 'date-fns';

interface ProjectRequest {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  company: string;
  projectType: string;
  projectTitle: string;
  description: string;
  services: string[];
  timeline: string;
  budget: string;
  estimatedValue: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'new' | 'reviewing' | 'in-progress' | 'quoted' | 'completed' | 'rejected';
  submittedAt: string;
  followUpDate: string;
  complexityLevel: string;
  platforms: string[];
  features: string[];
  assignedTo?: string;
  notes: any[];
  scheduledCalls?: any[];
}

interface EditFormData {
  _id?: string;
  name?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  company?: string;
  projectTitle?: string;
  projectType?: string;
  budget?: string;
  timeline?: string;
  status?: 'new' | 'reviewing' | 'in-progress' | 'quoted' | 'completed' | 'rejected';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  description?: string;
}

interface ProjectRequestsManagerProps {
  className?: string;
}

const ProjectRequestsManager: React.FC<ProjectRequestsManagerProps> = ({ className }) => {
  const [projectRequests, setProjectRequests] = useState<ProjectRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<ProjectRequest | null>(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [scheduleData, setScheduleData] = useState({
    date: '',
    time: '',
    type: 'call',
    notes: ''
  });
  const [editFormData, setEditFormData] = useState<EditFormData>({});
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [projectTypeFilter, setProjectTypeFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;
  
  // Summary stats
  const [summary, setSummary] = useState({
    totalRequests: 0,
    totalValue: 0,
    avgValue: 0,
    newRequests: 0,
    inProgress: 0,
    completed: 0
  });

  const statusColors = {
    'new': 'bg-blue-100 text-blue-800',
    'reviewing': 'bg-yellow-100 text-yellow-800',
    'in-progress': 'bg-purple-100 text-purple-800',
    'quoted': 'bg-orange-100 text-orange-800',
    'completed': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800'
  };

  const priorityColors = {
    'low': 'bg-gray-100 text-gray-800',
    'medium': 'bg-blue-100 text-blue-800',
    'high': 'bg-orange-100 text-orange-800',
    'urgent': 'bg-red-100 text-red-800'
  };

  const fetchProjectRequests = async () => {
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
        ...(projectTypeFilter !== 'all' && { projectType: projectTypeFilter }),
        ...(dateRange.from && { dateFrom: dateRange.from }),
        ...(dateRange.to && { dateTo: dateRange.to })
      });

      const response = await fetch(`/api/admin/project-requests?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProjectRequests(data.projectRequests);
        setTotalPages(data.pagination.pages);
        setTotalCount(data.pagination.total);
        setSummary(data.summary);
      } else {
        setError('Failed to fetch project requests');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectRequests();
  }, [currentPage, statusFilter, priorityFilter, projectTypeFilter, dateRange]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProjectRequests();
  };

  const handleStatusUpdate = async (requestId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/project-requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchProjectRequests();
      } else {
        setError('Failed to update status');
      }
    } catch (err) {
      setError('Error updating status');
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !selectedRequest) return;
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/project-requests/${selectedRequest._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          notes: [...(selectedRequest.notes || []), {
            text: newNote,
            addedBy: 'admin',
            addedAt: new Date().toISOString()
          }]
        })
      });

      if (response.ok) {
        setNewNote('');
        setShowNotesModal(false);
        fetchProjectRequests();
        // Update the selected request
        if (selectedRequest) {
          setSelectedRequest({
            ...selectedRequest,
            notes: [...(selectedRequest.notes || []), {
              text: newNote,
              addedBy: 'admin',
              addedAt: new Date().toISOString()
            }]
          });
        }
      } else {
        setError('Failed to add note');
      }
    } catch (err) {
      setError('Error adding note');
    }
  };

  const handleScheduleCall = async () => {
    if (!scheduleData.date || !scheduleData.time || !selectedRequest) return;
    
    try {
      const token = localStorage.getItem('authToken');
      const scheduledCall = {
        date: scheduleData.date,
        time: scheduleData.time,
        type: scheduleData.type,
        notes: scheduleData.notes,
        scheduledBy: 'admin',
        scheduledAt: new Date().toISOString(),
        status: 'scheduled'
      };
      
      const response = await fetch(`/api/admin/project-requests/${selectedRequest._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          scheduledCalls: [...(selectedRequest.scheduledCalls || []), scheduledCall]
        })
      });

      if (response.ok) {
        setScheduleData({ date: '', time: '', type: 'call', notes: '' });
        setShowScheduleModal(false);
        fetchProjectRequests();
        // Update the selected request
        setSelectedRequest({
          ...selectedRequest,
          scheduledCalls: [...(selectedRequest.scheduledCalls || []), scheduledCall]
        });
      } else {
        setError('Failed to schedule call');
      }
    } catch (err) {
      setError('Error scheduling call');
    }
  };

  const handleEdit = (request: any) => {
    setEditFormData(request);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/project-requests/${editFormData._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editFormData)
      });

      if (response.ok) {
        setShowEditModal(false);
        fetchProjectRequests();
        setSelectedRequest(null);
      } else {
        setError('Failed to update request');
      }
    } catch (err) {
      setError('Error updating request');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <AlertCircle size={16} />;
      case 'completed': return <CheckCircle size={16} />;
      case 'rejected': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  if (loading && projectRequests.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin" size={24} />
        <span className="ml-2">Loading project requests...</span>
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
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold">{summary.totalRequests}</p>
              </div>
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.totalValue)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">New Requests</p>
                <p className="text-2xl font-bold text-blue-600">{summary.newRequests}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Value</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.avgValue)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
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
            <span>Project Requests</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchProjectRequests}>
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
                  placeholder="Search by name, email, project title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Search</Button>
            </form>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="reviewing">Reviewing</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="quoted">Quoted</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
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
              
              <Select value={projectTypeFilter} onValueChange={setProjectTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Website Development">Website Development</SelectItem>
                  <SelectItem value="Mobile App Development">Mobile App</SelectItem>
                  <SelectItem value="E-commerce Platform">E-commerce</SelectItem>
                  <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setPriorityFilter('all');
                setProjectTypeFilter('all');
                setDateRange({ from: '', to: '' });
                setCurrentPage(1);
              }}>
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Project Requests Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Client</th>
                  <th className="text-left p-3 font-medium">Project</th>
                  <th className="text-left p-3 font-medium">Type</th>
                  <th className="text-left p-3 font-medium">Budget</th>
                  <th className="text-left p-3 font-medium">Priority</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Date</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projectRequests.map((request) => (
                  <tr key={request._id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{request.fullName}</div>
                        <div className="text-sm text-gray-600">{request.email}</div>
                        {request.company && (
                          <div className="text-xs text-gray-500">{request.company}</div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{request.projectTitle}</div>
                        <div className="text-sm text-gray-600 max-w-xs truncate">
                          {request.description}
                        </div>
                        <div className="text-xs text-gray-500">{request.timeline}</div>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline">{request.projectType}</Badge>
                    </td>
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{formatCurrency(request.estimatedValue)}</div>
                        <div className="text-xs text-gray-500">{request.budget}</div>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className={priorityColors[request.priority]}>
                        {request.priority.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(request.status)}
                        <Badge className={statusColors[request.status]}>
                          {request.status.replace('-', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">
                        {format(new Date(request.submittedAt), 'MMM dd, yyyy')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(request.submittedAt), 'HH:mm')}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedRequest(request)}
                        >
                          <Eye size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit(request)}
                        >
                          <Edit size={16} />
                        </Button>
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

      {/* Project Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start sm:items-center justify-center p-2 sm:p-4 z-50 animate-in fade-in-0 duration-200">
          <div className="w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] bg-white rounded-lg shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 sm:p-6 border-b border-gray-200 z-10">
              <div className="flex items-start justify-between">
                <div className="flex-1 mr-4">
                  <h2 className="text-xl sm:text-2xl font-bold truncate">{selectedRequest.projectTitle}</h2>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge className={`${
                      selectedRequest.priority === 'urgent' ? 'bg-red-100 text-red-800 border-red-200' :
                      selectedRequest.priority === 'high' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                      selectedRequest.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                      'bg-green-100 text-green-800 border-green-200'
                    } text-xs sm:text-sm`}>
                      {selectedRequest.priority.toUpperCase()} Priority
                    </Badge>
                    <Badge className={`${
                      selectedRequest.status === 'new' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                      selectedRequest.status === 'reviewing' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                      selectedRequest.status === 'in-progress' ? 'bg-indigo-100 text-indigo-800 border-indigo-200' :
                      selectedRequest.status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' :
                      'bg-red-100 text-red-800 border-red-200'
                    } text-xs sm:text-sm`}>
                      {selectedRequest.status.toUpperCase()}
                    </Badge>
                    <span className="text-xs sm:text-sm text-blue-100">
                      Submitted {format(new Date(selectedRequest.submittedAt), 'MMM dd, yyyy')}
                    </span>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedRequest(null)}
                  className="text-white hover:bg-white/20 flex-shrink-0 h-8 w-8 p-0 sm:h-10 sm:w-10"
                >
                  <X size={20} />
                </Button>
              </div>
            </div>
            
            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-140px)]">
              <div className="p-4 sm:p-6 space-y-6">
                {/* Client & Project Information Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                  {/* Client Info Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-5 border border-blue-100">
                    <div className="flex items-center mb-3">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <User size={18} className="text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Client Information</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <span className="text-xs text-gray-500 w-16 flex-shrink-0 mt-1">NAME</span>
                        <span className="text-sm font-medium text-gray-900 flex-1">{selectedRequest.fullName}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-xs text-gray-500 w-16 flex-shrink-0 mt-1">EMAIL</span>
                        <a href={`mailto:${selectedRequest.email}`} className="text-sm text-blue-600 hover:text-blue-800 flex-1 break-all">{selectedRequest.email}</a>
                      </div>
                      <div className="flex items-start">
                        <span className="text-xs text-gray-500 w-16 flex-shrink-0 mt-1">PHONE</span>
                        <a href={`tel:${selectedRequest.phone}`} className="text-sm text-blue-600 hover:text-blue-800 flex-1">{selectedRequest.phone}</a>
                      </div>
                      {selectedRequest.company && (
                        <div className="flex items-start">
                          <span className="text-xs text-gray-500 w-16 flex-shrink-0 mt-1">COMPANY</span>
                          <span className="text-sm font-medium text-gray-900 flex-1">{selectedRequest.company}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Project Details Card */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 sm:p-5 border border-green-100">
                    <div className="flex items-center mb-3">
                      <div className="p-2 bg-green-100 rounded-lg mr-3">
                        <Building2 size={18} className="text-green-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Project Details</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <span className="text-xs text-gray-500 w-16 flex-shrink-0 mt-1">TYPE</span>
                        <span className="text-sm font-medium text-gray-900 flex-1">{selectedRequest.projectType}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-xs text-gray-500 w-16 flex-shrink-0 mt-1">BUDGET</span>
                        <span className="text-sm font-medium text-green-700 flex-1">{selectedRequest.budget}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-xs text-gray-500 w-16 flex-shrink-0 mt-1">TIMELINE</span>
                        <span className="text-sm font-medium text-gray-900 flex-1">{selectedRequest.timeline}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-xs text-gray-500 w-16 flex-shrink-0 mt-1">VALUE</span>
                        <span className="text-sm font-medium text-green-700 flex-1">{formatCurrency(selectedRequest.estimatedValue)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Project Metrics Card */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 sm:p-5 border border-purple-100">
                    <div className="flex items-center mb-3">
                      <div className="p-2 bg-purple-100 rounded-lg mr-3">
                        <TrendingUp size={18} className="text-purple-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Project Metrics</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <span className="text-xs text-gray-500 w-20 flex-shrink-0 mt-1">COMPLEXITY</span>
                        <span className="text-sm font-medium text-gray-900 flex-1 capitalize">{selectedRequest.complexityLevel}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-xs text-gray-500 w-20 flex-shrink-0 mt-1">SERVICES</span>
                        <span className="text-sm font-medium text-gray-900 flex-1">{selectedRequest.services?.length || 0} Selected</span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-xs text-gray-500 w-20 flex-shrink-0 mt-1">FEATURES</span>
                        <span className="text-sm font-medium text-gray-900 flex-1">{selectedRequest.features?.length || 0} Required</span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-xs text-gray-500 w-20 flex-shrink-0 mt-1">FOLLOW-UP</span>
                        <span className="text-sm font-medium text-purple-700 flex-1">{format(new Date(selectedRequest.followUpDate), 'MMM dd')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              
                {/* Project Description */}
                <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-200">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-gray-200 rounded-lg mr-3">
                      <AlertCircle size={18} className="text-gray-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Project Description</h3>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {selectedRequest.description || 'No description provided'}
                    </p>
                  </div>
                </div>
              
                {/* Services & Features */}
                <div className="space-y-6">
                  {/* Services */}
                  {selectedRequest.services && selectedRequest.services.length > 0 && (
                    <div className="bg-blue-50 rounded-xl p-4 sm:p-6 border border-blue-200">
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <div className="p-1.5 bg-blue-100 rounded-lg mr-2">
                          <CheckCircle size={16} className="text-blue-600" />
                        </div>
                        Services Required ({selectedRequest.services.length})
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedRequest.services.map((service, index) => (
                          <Badge key={index} className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 transition-colors text-xs sm:text-sm px-3 py-1.5">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Platforms */}
                  {selectedRequest.platforms && selectedRequest.platforms.length > 0 && (
                    <div className="bg-indigo-50 rounded-xl p-4 sm:p-6 border border-indigo-200">
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <div className="p-1.5 bg-indigo-100 rounded-lg mr-2">
                          <Building2 size={16} className="text-indigo-600" />
                        </div>
                        Target Platforms ({selectedRequest.platforms.length})
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedRequest.platforms.map((platform, index) => (
                          <Badge key={index} variant="outline" className="border-indigo-300 text-indigo-700 hover:bg-indigo-100 transition-colors text-xs sm:text-sm px-3 py-1.5">
                            {platform}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Features */}
                  {selectedRequest.features && selectedRequest.features.length > 0 && (
                    <div className="bg-emerald-50 rounded-xl p-4 sm:p-6 border border-emerald-200">
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <div className="p-1.5 bg-emerald-100 rounded-lg mr-2">
                          <TrendingUp size={16} className="text-emerald-600" />
                        </div>
                        Required Features ({selectedRequest.features.length})
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedRequest.features.map((feature, index) => (
                          <Badge key={index} variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-100 transition-colors text-xs sm:text-sm px-3 py-1.5">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              
              {/* Notes Section */}
              {selectedRequest.notes && selectedRequest.notes.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Notes</h3>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {selectedRequest.notes.map((note, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg text-sm">
                        <p>{note.text}</p>
                        <div className="text-xs text-gray-500 mt-1">
                          By {note.addedBy} on {format(new Date(note.addedAt), 'MMM dd, yyyy HH:mm')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Scheduled Calls Section */}
              {selectedRequest.scheduledCalls && selectedRequest.scheduledCalls.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Scheduled Calls</h3>
                  <div className="space-y-2">
                    {selectedRequest.scheduledCalls.map((call, index) => (
                      <div key={index} className="bg-blue-50 p-3 rounded-lg text-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{call.type} - {call.date} at {call.time}</p>
                            {call.notes && <p className="text-gray-600 mt-1">{call.notes}</p>}
                          </div>
                          <Badge className={call.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                            {call.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          Scheduled by {call.scheduledBy} on {format(new Date(call.scheduledAt), 'MMM dd, yyyy HH:mm')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              </div>
            </div>
            
            {/* Sticky Action Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2.5 transition-all duration-200 shadow-lg hover:shadow-xl">
                  <DollarSign size={18} className="mr-2" />
                  Send Quote
                </Button>
                <Button 
                  variant="outline" 
                  className="border-blue-200 text-blue-700 hover:bg-blue-50 font-medium py-2.5 transition-all duration-200"
                  onClick={() => setShowScheduleModal(true)}
                >
                  <Calendar size={18} className="mr-2" />
                  Schedule Call
                </Button>
                <Button 
                  variant="outline"
                  className="border-green-200 text-green-700 hover:bg-green-50 font-medium py-2.5 transition-all duration-200"
                  onClick={() => setShowNotesModal(true)}
                >
                  <Edit size={18} className="mr-2" />
                  Add Notes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in-0 duration-200">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 zoom-in-95 duration-300">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-white/20 rounded-lg mr-3">
                    <Edit size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Add Note</h3>
                    <p className="text-green-100 text-sm">Add internal notes for this project request</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowNotesModal(false)}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                >
                  <X size={20} />
                </Button>
              </div>
            </div>
            
            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Note Content</label>
                <Textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Enter your note here... You can include project updates, client feedback, technical requirements, or any other relevant information."
                  rows={6}
                  className="w-full border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm resize-none"
                />
                <div className="text-xs text-gray-500 mt-2 flex items-center justify-between">
                  <span>{newNote.length} characters</span>
                  <span>Note will be visible to all admin users</span>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={() => setShowNotesModal(false)}
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Note
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Schedule Call Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in-0 duration-200">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 zoom-in-95 duration-300">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-white/20 rounded-lg mr-3">
                    <Calendar size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Schedule Call</h3>
                    <p className="text-blue-100 text-sm">Set up a meeting with the client</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowScheduleModal(false)}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                >
                  <X size={20} />
                </Button>
              </div>
            </div>
            
            <div className="p-4 sm:p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <Input
                    type="date"
                    value={scheduleData.date}
                    onChange={(e) => setScheduleData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <Input
                    type="time"
                    value={scheduleData.time}
                    onChange={(e) => setScheduleData(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Call Type</label>
                <Select value={scheduleData.type} onValueChange={(value) => setScheduleData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger className="w-full border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consultation">Initial Consultation</SelectItem>
                    <SelectItem value="requirement">Requirement Discussion</SelectItem>
                    <SelectItem value="proposal">Proposal Presentation</SelectItem>
                    <SelectItem value="follow-up">Follow-up Call</SelectItem>
                    <SelectItem value="technical">Technical Discussion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Notes (Optional)</label>
                <Textarea
                  value={scheduleData.notes}
                  onChange={(e) => setScheduleData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add agenda, topics to discuss, or any preparation notes for the call..."
                  rows={4}
                  className="w-full border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                />
              </div>
              
              {selectedRequest && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-start">
                    <AlertCircle size={18} className="text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Meeting Details</p>
                      <p>Client: <span className="font-medium">{selectedRequest.fullName}</span></p>
                      <p>Email: <span className="font-medium">{selectedRequest.email}</span></p>
                      <p>Project: <span className="font-medium">{selectedRequest.projectTitle}</span></p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={() => setShowScheduleModal(false)}
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleScheduleCall}
                  disabled={!scheduleData.date || !scheduleData.time || !scheduleData.type}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Calendar size={18} className="mr-2" />
                  Schedule Call
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in-0 duration-200">
          <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 zoom-in-95 duration-300">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-white/20 rounded-lg mr-3">
                    <Edit size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Edit Project Request</h3>
                    <p className="text-purple-100 text-sm">Update project request details</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowEditModal(false)}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                >
                  <X size={20} />
                </Button>
              </div>
            </div>
            
            <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="p-4 sm:p-6 space-y-6">
                {/* Client Information */}
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <User size={16} className="mr-2 text-blue-600" />
                    Client Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <Input
                        value={editFormData.fullName || ''}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, fullName: e.target.value }))}
                        className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <Input
                        type="email"
                        value={editFormData.email || ''}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <Input
                        value={editFormData.phone || ''}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                      <Input
                        value={editFormData.company || ''}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, company: e.target.value }))}
                        className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Project Details */}
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Building2 size={16} className="mr-2 text-green-600" />
                    Project Details
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Project Title</label>
                      <Input
                        value={editFormData.projectTitle || ''}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, projectTitle: e.target.value }))}
                        className="border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Project Type</label>
                        <Select value={editFormData.projectType} onValueChange={(value) => setEditFormData(prev => ({ ...prev, projectType: value }))}>
                          <SelectTrigger className="border-gray-300 focus:ring-2 focus:ring-green-500">
                            <SelectValue placeholder="Select project type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Website Development">Website Development</SelectItem>
                            <SelectItem value="Mobile App Development">Mobile App Development</SelectItem>
                            <SelectItem value="E-commerce Platform">E-commerce Platform</SelectItem>
                            <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Timeline</label>
                        <Select value={editFormData.timeline} onValueChange={(value) => setEditFormData(prev => ({ ...prev, timeline: value }))}>
                          <SelectTrigger className="border-gray-300 focus:ring-2 focus:ring-green-500">
                            <SelectValue placeholder="Select timeline" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2-4 weeks">2-4 weeks</SelectItem>
                            <SelectItem value="1-2 months">1-2 months</SelectItem>
                            <SelectItem value="2-4 months">2-4 months</SelectItem>
                            <SelectItem value="4-6 months">4-6 months</SelectItem>
                            <SelectItem value="6+ months">6+ months</SelectItem>
                            <SelectItem value="Flexible timeline">Flexible timeline</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Budget</label>
                      <Select value={editFormData.budget} onValueChange={(value) => setEditFormData(prev => ({ ...prev, budget: value }))}>
                        <SelectTrigger className="border-gray-300 focus:ring-2 focus:ring-green-500">
                          <SelectValue placeholder="Select budget range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="₹50,000 - ₹1,00,000">₹50,000 - ₹1,00,000</SelectItem>
                          <SelectItem value="₹1,00,000 - ₹2,50,000">₹1,00,000 - ₹2,50,000</SelectItem>
                          <SelectItem value="₹2,50,000 - ₹5,00,000">₹2,50,000 - ₹5,00,000</SelectItem>
                          <SelectItem value="₹5,00,000 - ₹10,00,000">₹5,00,000 - ₹10,00,000</SelectItem>
                          <SelectItem value="₹10,00,000+">₹10,00,000+</SelectItem>
                          <SelectItem value="Custom Quote Required">Custom Quote Required</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Project Description</label>
                      <Textarea
                        value={editFormData.description || ''}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={4}
                        className="border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                        placeholder="Enter project description..."
                      />
                    </div>
                  </div>
                </div>
                
                {/* Status & Priority */}
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <TrendingUp size={16} className="mr-2 text-purple-600" />
                    Status & Priority
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <Select value={editFormData.status} onValueChange={(value: 'new' | 'reviewing' | 'in-progress' | 'quoted' | 'completed' | 'rejected') => setEditFormData(prev => ({ ...prev, status: value }))}>
                        <SelectTrigger className="border-gray-300 focus:ring-2 focus:ring-purple-500">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="reviewing">Reviewing</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="quoted">Quoted</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                      <Select value={editFormData.priority} onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => setEditFormData(prev => ({ ...prev, priority: value }))}>
                        <SelectTrigger className="border-gray-300 focus:ring-2 focus:ring-purple-500">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="urgent">Urgent</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 sm:p-6">
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveEdit}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  <CheckCircle size={18} className="mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectRequestsManager;