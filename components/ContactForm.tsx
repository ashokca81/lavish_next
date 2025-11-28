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
  Mail, Phone, User, Building2, MessageSquare, 
  Calendar, Clock, DollarSign, Globe, 
  CheckCircle, AlertCircle, Send, MapPin 
} from 'lucide-react';

interface ContactFormData {
  // Personal Information
  fullName: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  website: string;
  
  // Contact Details
  preferredContactMethod: string;
  bestTimeToCall: string;
  timezone: string;
  
  // Inquiry Details
  inquiryType: string;
  serviceInterest: string[];
  urgency: string;
  subject: string;
  message: string;
  
  // Project Information
  hasProject: boolean;
  projectBudget: string;
  projectTimeline: string;
  
  // Communication Preferences
  subscribeToNewsletter: boolean;
  allowMarketing: boolean;
  
  // Location
  country: string;
  city: string;
}

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
    website: '',
    preferredContactMethod: '',
    bestTimeToCall: '',
    timezone: '',
    inquiryType: '',
    serviceInterest: [],
    urgency: '',
    subject: '',
    message: '',
    hasProject: false,
    projectBudget: '',
    projectTimeline: '',
    subscribeToNewsletter: false,
    allowMarketing: false,
    country: '',
    city: ''
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const inquiryTypes = [
    'General Inquiry',
    'Service Quote Request',
    'Project Consultation',
    'Partnership Opportunity',
    'Technical Support',
    'Career Inquiry',
    'Media/Press Inquiry',
    'Feedback/Complaint',
    'Other'
  ];

  const serviceOptions = [
    'Website Development',
    'Mobile App Development',
    'E-commerce Solutions',
    'UI/UX Design',
    'Digital Marketing',
    'SEO Services',
    'Brand Identity',
    'Content Management',
    'API Development',
    'Cloud Solutions',
    'Maintenance & Support',
    'Consultation Services'
  ];

  const urgencyLevels = [
    'Low - General inquiry',
    'Medium - Within a week',
    'High - Within 2-3 days',
    'Urgent - Same day response needed'
  ];

  const contactMethods = [
    'Email',
    'Phone Call',
    'WhatsApp',
    'Video Call',
    'In-person Meeting'
  ];

  const budgetRanges = [
    '₹25,000 - ₹50,000',
    '₹50,000 - ₹1,00,000',
    '₹1,00,000 - ₹2,50,000',
    '₹2,50,000 - ₹5,00,000',
    '₹5,00,000 - ₹10,00,000',
    '₹10,00,000+',
    'Budget not decided'
  ];

  const timelineOptions = [
    'ASAP',
    'Within 1 month',
    '1-3 months',
    '3-6 months',
    '6+ months',
    'Just exploring options'
  ];

  const timeSlots = [
    '9:00 AM - 12:00 PM',
    '12:00 PM - 3:00 PM',
    '3:00 PM - 6:00 PM',
    '6:00 PM - 9:00 PM',
    'Flexible timing'
  ];

  const timezones = [
    'IST (Indian Standard Time)',
    'GMT (Greenwich Mean Time)',
    'EST (Eastern Standard Time)',
    'PST (Pacific Standard Time)',
    'CET (Central European Time)',
    'Other'
  ];

  const handleInputChange = (field: keyof ContactFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const handleArrayChange = (field: 'serviceInterest', value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  const validateForm = () => {
    if (!formData.fullName || !formData.email) {
      setError('Please provide your name and email address.');
      return false;
    }
    
    if (!formData.inquiryType) {
      setError('Please select the type of inquiry.');
      return false;
    }

    if (!formData.subject || !formData.message) {
      setError('Please provide a subject and message.');
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
      console.log('Submitting contact form with data:', formData);
      
      const response = await fetch('/api/contact-submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          submittedAt: new Date().toISOString(),
          status: 'new',
          ipAddress: 'client-ip',
          userAgent: navigator.userAgent
        }),
      });

      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (response.ok) {
        setSubmitted(true);
        console.log('Contact form submitted successfully');
        // Reset form
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          company: '',
          jobTitle: '',
          website: '',
          preferredContactMethod: '',
          bestTimeToCall: '',
          timezone: '',
          inquiryType: '',
          serviceInterest: [],
          urgency: '',
          subject: '',
          message: '',
          hasProject: false,
          projectBudget: '',
          projectTimeline: '',
          subscribeToNewsletter: false,
          allowMarketing: false,
          country: '',
          city: ''
        });
      } else {
        console.error('Failed to submit contact form:', responseData);
        setError(responseData.message || 'Failed to submit contact form. Please try again.');
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h2>
          <p className="text-gray-600 mb-4">
            Thank you for contacting us. We&apos;ll get back to you within 24 hours based on your urgency level.
          </p>
          <div className="space-y-2 text-sm text-gray-500 mb-6">
            <p>📧 You&apos;ll receive a confirmation email shortly</p>
            <p>📞 If urgent, we&apos;ll call you within a few hours</p>
            <p>💼 For project inquiries, expect a detailed response</p>
          </div>
          <Button onClick={() => setSubmitted(false)}>
            Send Another Message
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
            Get In Touch
          </CardTitle>
          <p className="text-center text-gray-600 mt-2">
            We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
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
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="Company name"
                  />
                </div>
                <div>
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    value={formData.jobTitle}
                    onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                    placeholder="Your job title"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <MapPin size={20} />
                Location
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    placeholder="Enter your country"
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Enter your city"
                  />
                </div>
              </div>
            </div>

            {/* Contact Preferences */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Phone size={20} />
                Contact Preferences
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Preferred Contact Method</Label>
                  <Select value={formData.preferredContactMethod} onValueChange={(value) => handleInputChange('preferredContactMethod', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      {contactMethods.map((method) => (
                        <SelectItem key={method} value={method}>{method}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Best Time to Contact</Label>
                  <Select value={formData.bestTimeToCall} onValueChange={(value) => handleInputChange('bestTimeToCall', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Timezone</Label>
                  <Select value={formData.timezone} onValueChange={(value) => handleInputChange('timezone', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Inquiry Details */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <MessageSquare size={20} />
                Inquiry Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Type of Inquiry *</Label>
                  <Select value={formData.inquiryType} onValueChange={(value) => handleInputChange('inquiryType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select inquiry type" />
                    </SelectTrigger>
                    <SelectContent>
                      {inquiryTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Urgency Level</Label>
                  <Select value={formData.urgency} onValueChange={(value) => handleInputChange('urgency', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select urgency" />
                    </SelectTrigger>
                    <SelectContent>
                      {urgencyLevels.map((level) => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Services of Interest</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                  {serviceOptions.map((service) => (
                    <div key={service} className="flex items-center space-x-2">
                      <Checkbox
                        id={service}
                        checked={formData.serviceInterest.includes(service)}
                        onCheckedChange={(checked) => handleArrayChange('serviceInterest', service, checked as boolean)}
                      />
                      <Label htmlFor={service} className="text-sm">{service}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  placeholder="Brief subject of your inquiry"
                  required
                />
              </div>

              <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder="Please provide details about your inquiry..."
                  className="min-h-32"
                  required
                />
              </div>
            </div>

            {/* Project Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasProject"
                  checked={formData.hasProject}
                  onCheckedChange={(checked) => handleInputChange('hasProject', checked)}
                />
                <Label htmlFor="hasProject" className="text-lg font-medium">
                  I have a specific project in mind
                </Label>
              </div>

              {formData.hasProject && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
                  <div>
                    <Label>Estimated Budget</Label>
                    <Select value={formData.projectBudget} onValueChange={(value) => handleInputChange('projectBudget', value)}>
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
                  <div>
                    <Label>Timeline</Label>
                    <Select value={formData.projectTimeline} onValueChange={(value) => handleInputChange('projectTimeline', value)}>
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
                </div>
              )}
            </div>

            {/* Communication Preferences */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Communication Preferences</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="subscribeToNewsletter"
                    checked={formData.subscribeToNewsletter}
                    onCheckedChange={(checked) => handleInputChange('subscribeToNewsletter', checked)}
                  />
                  <Label htmlFor="subscribeToNewsletter">
                    Subscribe to our newsletter for tech updates and insights
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allowMarketing"
                    checked={formData.allowMarketing}
                    onCheckedChange={(checked) => handleInputChange('allowMarketing', checked)}
                  />
                  <Label htmlFor="allowMarketing">
                    I agree to receive marketing communications from Lavish Star Soft
                  </Label>
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
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2" size={16} />
                    Send Message
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

export default ContactForm;