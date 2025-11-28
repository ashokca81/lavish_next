
import React, { useState } from 'react';
import { ArrowRight, ShieldCheck, TrendingUp, Zap, Award, Sparkles, X, User, Mail, Phone, Building, MessageSquare } from 'lucide-react';
import TypeWriter from './TypeWriter';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useContent } from '@/hooks/useContent';


const HeroSection = () => {
  const { getContent, getContentList, loading } = useContent('hero');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: '',
    budget: '',
    message: ''
  });

  // Get dynamic content
  const heroMain = getContent('hero', 'main');
  const heroSubtitle = getContent('hero', 'subtitle');
  const heroFeatures = getContentList('hero', 'features');

  const scrollToContact = () => {
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you can add form submission logic
    console.log('Form submitted:', formData);
    toast.success('Thank you for your enquiry! We will contact you soon.');
    setIsModalOpen(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      service: '',
      budget: '',
      message: ''
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({...prev, [field]: value}));
  };
  
  return (
    <section id="home" className="relative min-h-screen flex flex-col justify-center pt-28 pb-16 overflow-hidden">
      {/* Spline.design 3D Background - Commented out */}
      {/* <div className="absolute inset-0 -z-10 bg-black">
        <iframe src='https://my.spline.design/glowingplanetparticles-74fZAsOyxilYafFeGBLU2oA0/' width='100%' height='92%'></iframe>
        <div className="absolute inset-0 bg-black/20"></div>
      </div> */}
      
      {/* Responsive Background Images */}
      <div className="absolute inset-0 -z-10">
        {/* Mobile background */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat lg:hidden"
          style={{
            backgroundImage: `url('/mobile_view.jpg')`
          }}
        ></div>
        {/* Desktop background */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat hidden lg:block"
          style={{
            backgroundImage: `url('/hero.webp')`
          }}
        ></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10 " >
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center lg:justify-start mb-[100%] lg:mb-0">
          <div className="max-w-3xl text-center lg:text-left">
            <div className="reveal">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight text-white">
                <span className="gradient-text">
                  {heroMain?.title || 'We Build Your Dreams'}
                </span>
                <br />
                <span className="text-yellow-400 pt-1">
                  <TypeWriter 
                    words={heroMain?.metadata?.typewriterWords || ['Digitally', 'Creatively', 'Smartly', 'Professionally']}
                    typeSpeed={120}
                    deleteSpeed={80}
                    delayBetweenWords={1500}
                  />
                </span>
              </h2>
            </div>
            
            <div className="reveal">
              <p className="text-lg md:text-xl text-white/80 mb-8 hidden sm:block">
                {heroSubtitle?.content || 
                'We craft innovative digital solutions tailored to your business needs. From web development to mobile apps, dashboards, and industrial automation - we\'ve got you covered.'}
              </p>
            </div>
            
            <div className="reveal">
              <div className="flex justify-center lg:justify-start gap-2 sm:gap-4">
                <button onClick={scrollToContact} className="btn-primary group text-sm sm:text-base px-4 sm:px-6 hover:scale-105 transition-transform">
                  Start Your Project
                  <ArrowRight className="ml-1 sm:ml-2 group-hover:translate-x-1 transition-transform" size={16} />
                </button>
                
                <button className="btn-outline text-sm sm:text-base px-4 sm:px-6 hover:scale-105 transition-transform" onClick={() => window.scrollTo({top: document.getElementById('services')?.offsetTop || 0, behavior: 'smooth'})}>
                  Explore Services
                </button>
              </div>
            </div>
            
            {/* Feature Cards */}
            <div className="reveal hidden sm:block">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 lg:mt-16">
                {heroFeatures && heroFeatures.length > 0 ? (
                  heroFeatures.slice(0, 4).map((feature, index) => (
                    <div key={feature._id} className="p-4 text-center bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:scale-105 transition-transform">
                      <div className="w-8 h-8 mx-auto mb-2 text-blue-400">
                        {index === 0 && <Zap className="w-full h-full animate-pulse" />}
                        {index === 1 && <Award className="w-full h-full animate-pulse" />}
                        {index === 2 && <ShieldCheck className="w-full h-full animate-pulse" />}
                        {index === 3 && <TrendingUp className="w-full h-full animate-pulse" />}
                      </div>
                      <p className="text-white text-xs font-medium">{feature.title}</p>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="p-4 text-center bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:scale-105 transition-transform">
                      <div className="w-8 h-8 mx-auto mb-2 text-blue-400">
                        <Zap className="w-full h-full animate-pulse" />
                      </div>
                      <p className="text-white text-xs font-medium">Fast Development</p>
                    </div>
                    
                    <div className="p-4 text-center bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:scale-105 transition-transform">
                      <div className="w-8 h-8 mx-auto mb-2 text-green-400">
                        <Award className="w-full h-full animate-pulse" />
                      </div>
                      <p className="text-white text-xs font-medium">Award Winning</p>
                    </div>
                    
                    <div className="p-4 text-center bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:scale-105 transition-transform">
                      <div className="w-8 h-8 mx-auto mb-2 text-purple-400">
                        <ShieldCheck className="w-full h-full animate-pulse" />
                      </div>
                      <p className="text-white text-xs font-medium">Secure & Reliable</p>
                    </div>
                    
                    <div className="p-4 text-center bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:scale-105 transition-transform">
                      <div className="w-8 h-8 mx-auto mb-2 text-yellow-400">
                        <TrendingUp className="w-full h-full animate-pulse" />
                      </div>
                      <p className="text-white text-xs font-medium">Growth Focused</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Client Enquiry Modal */}
      {isModalOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-300"
            onClick={() => setIsModalOpen(false)}
          />
          
          {/* Modal Content */}
          <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 w-full h-full sm:h-auto sm:max-w-4xl sm:max-h-[95vh] overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
              {/* Header */}
              <div className="relative bg-gradient-to-r from-weebix-primary via-weebix-secondary to-weebix-primary p-4 sm:p-6 text-white rounded-t-2xl sm:rounded-t-3xl flex-shrink-0">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-2 right-2 sm:top-4 sm:right-4 p-2 hover:bg-white/20 rounded-full transition-colors z-10"
                >
                  <X size={20} />
                </button>
                <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2 pr-12">Start Your Project</h2>
                <p className="text-white/90 text-sm sm:text-base">Tell us about your project and we'll get back to you within 24 hours</p>
              </div>
              
              {/* Form Container with Scroll */}
              <div className="flex-1 overflow-y-auto">
                <form onSubmit={handleFormSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1 sm:space-y-2">
                      <label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center">
                        <User size={14} className="mr-2 text-weebix-primary" />
                        Full Name *
                      </label>
                      <Input
                        required
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="border-gray-300 focus:border-weebix-primary text-sm sm:text-base h-9 sm:h-10"
                      />
                    </div>
                    
                    <div className="space-y-1 sm:space-y-2">
                      <label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center">
                        <Mail size={14} className="mr-2 text-weebix-primary" />
                        Email Address *
                      </label>
                      <Input
                        required
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="border-gray-300 focus:border-weebix-primary text-sm sm:text-base h-9 sm:h-10"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1 sm:space-y-2">
                      <label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center">
                        <Phone size={14} className="mr-2 text-weebix-primary" />
                        Phone Number
                      </label>
                      <Input
                        placeholder="Enter your phone number"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="border-gray-300 focus:border-weebix-primary text-sm sm:text-base h-9 sm:h-10"
                      />
                    </div>
                    
                    <div className="space-y-1 sm:space-y-2">
                      <label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center">
                        <Building size={14} className="mr-2 text-weebix-primary" />
                        Company Name
                      </label>
                      <Input
                        placeholder="Enter your company name"
                        value={formData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        className="border-gray-300 focus:border-weebix-primary text-sm sm:text-base h-9 sm:h-10"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1 sm:space-y-2">
                      <label className="text-xs sm:text-sm font-medium text-gray-700">Service Required *</label>
                      <Select value={formData.service} onValueChange={(value) => handleInputChange('service', value)}>
                        <SelectTrigger className="border-gray-300 focus:border-weebix-primary text-sm sm:text-base h-9 sm:h-10">
                          <SelectValue placeholder="Select a service" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="web-development">Web Development</SelectItem>
                          <SelectItem value="mobile-app">Mobile App Development</SelectItem>
                          <SelectItem value="ui-ux-design">UI/UX Design</SelectItem>
                          <SelectItem value="backend-development">Backend Development</SelectItem>
                          <SelectItem value="full-stack">Full Stack Solution</SelectItem>
                          <SelectItem value="industrial-automation">Industrial Automation</SelectItem>
                          <SelectItem value="analytics-dashboard">Analytics Dashboard</SelectItem>
                          <SelectItem value="consultation">Consultation</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-1 sm:space-y-2">
                      <label className="text-xs sm:text-sm font-medium text-gray-700">Budget Range</label>
                      <Select value={formData.budget} onValueChange={(value) => handleInputChange('budget', value)}>
                        <SelectTrigger className="border-gray-300 focus:border-weebix-primary text-sm sm:text-base h-9 sm:h-10">
                          <SelectValue placeholder="Select budget range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="under-10k">Under ₹10,000</SelectItem>
                          <SelectItem value="10k-50k">₹10,000 - ₹50,000</SelectItem>
                          <SelectItem value="50k-1l">₹50,000 - ₹1,00,000</SelectItem>
                          <SelectItem value="1l-5l">₹1,00,000 - ₹5,00,000</SelectItem>
                          <SelectItem value="above-5l">Above ₹5,00,000</SelectItem>
                          <SelectItem value="discuss">Prefer to Discuss</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-1 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center">
                      <MessageSquare size={14} className="mr-2 text-weebix-primary" />
                      Project Description *
                    </label>
                    <Textarea
                      required
                      placeholder="Tell us about your project requirements, goals, and any specific features you need..."
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      className="border-gray-300 focus:border-weebix-primary min-h-[80px] sm:min-h-[100px] resize-none text-sm sm:text-base"
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-2 sm:pt-4 sticky bottom-0 bg-white">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 h-9 sm:h-10 text-sm sm:text-base"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-weebix-primary hover:bg-weebix-primary/90 h-9 sm:h-10 text-sm sm:text-base"
                    >
                      Submit Enquiry
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default HeroSection;
