import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Alert, AlertDescription } from './ui/alert';
import { 
  User, Mail, Phone, Building2, Globe, Smartphone, 
  PaintBucket, Database, ShoppingCart, Calendar, 
  DollarSign, FileText, Send, CheckCircle, AlertCircle 
} from 'lucide-react';

interface ProjectRequestFormData {
  // Personal Information
  fullName: string;
  email: string;
  phone: string;
  company: string;
  
  // Project Details
  projectType: string;
  projectTitle: string;
  projectDescription: string;
  
  // Services Required
  services: string[];
  
  // Timeline & Budget
  timeline: string;
  budget: string;
  startDate: string;
  
  // Technical Requirements
  platforms: string[];
  features: string[];
  designPreferences: string;
  
  // Additional Information
  hasExistingWebsite: boolean;
  currentWebsite: string;
  inspiration: string;
  additionalRequirements: string;
}

const ProjectRequestForm: React.FC = () => {
  const [formData, setFormData] = useState<ProjectRequestFormData>({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    projectType: '',
    projectTitle: '',
    projectDescription: '',
    services: [],
    timeline: '',
    budget: '',
    startDate: '',
    platforms: [],
    features: [],
    designPreferences: '',
    hasExistingWebsite: false,
    currentWebsite: '',
    inspiration: '',
    additionalRequirements: ''
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const projectTypes = [
    'Website Development',
    'Mobile App Development',
    'E-commerce Platform',
    'Web Application',
    'UI/UX Design',
    'Digital Marketing',
    'Brand Identity',
    'Custom Software',
    'API Development',
    'Database Design'
  ];

  const serviceOptions = [
    'Frontend Development',
    'Backend Development',
    'Full Stack Development',
    'UI/UX Design',
    'Mobile App Development',
    'E-commerce Solutions',
    'SEO Optimization',
    'Digital Marketing',
    'Brand Design',
    'Content Management',
    'API Integration',
    'Database Development',
    'Cloud Hosting',
    'Maintenance & Support'
  ];

  const platformOptions = [
    'Web (Desktop)',
    'Mobile (iOS)',
    'Mobile (Android)',
    'Progressive Web App',
    'Desktop Application',
    'Cross-platform Mobile'
  ];

  const featureOptions = [
    'User Authentication',
    'Payment Integration',
    'Admin Dashboard',
    'Real-time Chat',
    'Push Notifications',
    'Social Media Integration',
    'Analytics & Reporting',
    'Multi-language Support',
    'Third-party Integrations',
    'Advanced Search',
    'File Upload/Management',
    'Email Notifications',
    'CRM Integration',
    'Inventory Management'
  ];

  const budgetRanges = [
    '₹50,000 - ₹1,00,000',
    '₹1,00,000 - ₹2,50,000',
    '₹2,50,000 - ₹5,00,000',
    '₹5,00,000 - ₹10,00,000',
    '₹10,00,000+',
    'Custom Quote Required'
  ];

  const timelineOptions = [
    '2-4 weeks',
    '1-2 months',
    '2-4 months',
    '4-6 months',
    '6+ months',
    'Flexible timeline'
  ];

  const handleInputChange = (field: keyof ProjectRequestFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const handleArrayChange = (field: 'services' | 'platforms' | 'features', value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  const validateForm = () => {
    if (!formData.fullName || !formData.email || !formData.phone) {
      setError('Please fill in all required personal information fields.');
      return false;
    }
    
    if (!formData.projectType || !formData.projectTitle || !formData.projectDescription) {
      setError('Please provide project type, title, and description.');
      return false;
    }

    if (formData.services.length === 0) {
      setError('Please select at least one service.');
      return false;
    }

    if (!formData.timeline || !formData.budget) {
      setError('Please specify timeline and budget.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/project-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          submittedAt: new Date().toISOString(),
          status: 'new'
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        // Reset form
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          company: '',
          projectType: '',
          projectTitle: '',
          projectDescription: '',
          services: [],
          timeline: '',
          budget: '',
          startDate: '',
          platforms: [],
          features: [],
          designPreferences: '',
          hasExistingWebsite: false,
          currentWebsite: '',
          inspiration: '',
          additionalRequirements: ''
        });
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to submit project request. Please try again.');
      }
    } catch (error) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-600 mb-4">
            Your project request has been successfully submitted. Our team will review your requirements and get back to you within 24 hours.
          </p>
          <Button onClick={() => setSubmitted(false)}>
            Submit Another Request
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-gray-900">
            Start Your Project
          </CardTitle>
          <p className="text-center text-gray-600 mt-2">
            Tell us about your project and let&apos;s bring your vision to life
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <User size={20} />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company/Organization</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="Enter company name (optional)"
                  />
                </div>
              </div>
            </div>

            {/* Project Details */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Building2 size={20} />
                Project Details
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="projectType">Project Type *</Label>
                  <Select value={formData.projectType} onValueChange={(value) => handleInputChange('projectType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project type" />
                    </SelectTrigger>
                    <SelectContent>
                      {projectTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="projectTitle">Project Title *</Label>
                  <Input
                    id="projectTitle"
                    value={formData.projectTitle}
                    onChange={(e) => handleInputChange('projectTitle', e.target.value)}
                    placeholder="Give your project a title"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="projectDescription">Project Description *</Label>
                  <Textarea
                    id="projectDescription"
                    value={formData.projectDescription}
                    onChange={(e) => handleInputChange('projectDescription', e.target.value)}
                    placeholder="Describe your project in detail..."
                    className="min-h-32"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Services Required */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Globe size={20} />
                Services Required *
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {serviceOptions.map((service) => (
                  <div key={service} className="flex items-center space-x-2">
                    <Checkbox
                      id={service}
                      checked={formData.services.includes(service)}
                      onCheckedChange={(checked) => handleArrayChange('services', service, checked as boolean)}
                    />
                    <Label htmlFor={service} className="text-sm">{service}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline & Budget */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Calendar size={20} />
                Timeline & Budget
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timeline">Expected Timeline *</Label>
                  <Select value={formData.timeline} onValueChange={(value) => handleInputChange('timeline', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      {timelineOptions.map((timeline) => (
                        <SelectItem key={timeline} value={timeline}>{timeline}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="budget">Budget Range *</Label>
                  <Select value={formData.budget} onValueChange={(value) => handleInputChange('budget', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select budget range" />
                    </SelectTrigger>
                    <SelectContent>
                      {budgetRanges.map((budget) => (
                        <SelectItem key={budget} value={budget}>{budget}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="startDate">Preferred Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Platform & Features */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Smartphone size={20} />
                Platforms & Features
              </h3>
              <div className="space-y-4">
                <div>
                  <Label>Target Platforms</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    {platformOptions.map((platform) => (
                      <div key={platform} className="flex items-center space-x-2">
                        <Checkbox
                          id={platform}
                          checked={formData.platforms.includes(platform)}
                          onCheckedChange={(checked) => handleArrayChange('platforms', platform, checked as boolean)}
                        />
                        <Label htmlFor={platform} className="text-sm">{platform}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Required Features</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    {featureOptions.map((feature) => (
                      <div key={feature} className="flex items-center space-x-2">
                        <Checkbox
                          id={feature}
                          checked={formData.features.includes(feature)}
                          onCheckedChange={(checked) => handleArrayChange('features', feature, checked as boolean)}
                        />
                        <Label htmlFor={feature} className="text-sm">{feature}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Design & Additional Info */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <PaintBucket size={20} />
                Design & Additional Information
              </h3>
              <div className="space-y-4">
                <div>
                  <Label>Design Preferences</Label>
                  <RadioGroup
                    value={formData.designPreferences}
                    onValueChange={(value) => handleInputChange('designPreferences', value)}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="modern" id="modern" />
                      <Label htmlFor="modern">Modern & Minimalist</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="professional" id="professional" />
                      <Label htmlFor="professional">Professional & Corporate</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="creative" id="creative" />
                      <Label htmlFor="creative">Creative & Artistic</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ecommerce" id="ecommerce" />
                      <Label htmlFor="ecommerce">E-commerce Focused</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="custom" id="custom" />
                      <Label htmlFor="custom">Custom Design Required</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasExistingWebsite"
                    checked={formData.hasExistingWebsite}
                    onCheckedChange={(checked) => handleInputChange('hasExistingWebsite', checked)}
                  />
                  <Label htmlFor="hasExistingWebsite">I have an existing website</Label>
                </div>

                {formData.hasExistingWebsite && (
                  <div>
                    <Label htmlFor="currentWebsite">Current Website URL</Label>
                    <Input
                      id="currentWebsite"
                      type="url"
                      value={formData.currentWebsite}
                      onChange={(e) => handleInputChange('currentWebsite', e.target.value)}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="inspiration">Inspiration/Reference Websites</Label>
                  <Textarea
                    id="inspiration"
                    value={formData.inspiration}
                    onChange={(e) => handleInputChange('inspiration', e.target.value)}
                    placeholder="Share URLs or describe websites you like..."
                    className="min-h-20"
                  />
                </div>

                <div>
                  <Label htmlFor="additionalRequirements">Additional Requirements</Label>
                  <Textarea
                    id="additionalRequirements"
                    value={formData.additionalRequirements}
                    onChange={(e) => handleInputChange('additionalRequirements', e.target.value)}
                    placeholder="Any specific requirements, constraints, or additional information..."
                    className="min-h-20"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full md:w-auto"
                size="lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2" size={16} />
                    Submit Project Request
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectRequestForm;