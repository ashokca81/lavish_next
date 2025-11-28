
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Menu, X, Home, Settings, Briefcase, Code, BookOpen, Mail, User, Phone, Building, MessageSquare } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState('home');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: '',
    budget: '',
    message: ''
  });
  const router = useRouter();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 50);

      // Don't update active section if we're not on home page
      if (router.pathname !== '/') return;

      // Update active section based on scroll position
      const sections = document.querySelectorAll('section[id]');
      let currentSection = 'home';
      
      sections.forEach(section => {
        const sectionTop = (section as HTMLElement).offsetTop - 100;
        if (scrollY >= sectionTop) {
          currentSection = section.getAttribute('id') || 'home';
        }
      });

      setActiveMenuItem(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const scrollToSection = (sectionId: string) => {
    setIsMenuOpen(false); // Close menu first
    
    // Check if we're not on the home page
    if (router.pathname !== '/') {
      // Navigate to home page with section hash
      router.push(`/#${sectionId}`);
      return;
    }
    
    if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setActiveMenuItem('home');
      return;
    }

    const section = document.getElementById(sectionId);
    if (section) {
      setTimeout(() => {
        window.scrollTo({
          top: section.offsetTop - 80,
          behavior: 'smooth'
        });
      }, 300); // Small delay to allow menu to close
      setActiveMenuItem(sectionId);
    }
  };

  // Handle hash navigation when arriving at home page
  useEffect(() => {
    if (router.pathname === '/' && router.asPath.includes('#')) {
      const hash = router.asPath.split('#')[1];
      if (hash) {
        setTimeout(() => {
          const section = document.getElementById(hash);
          if (section) {
            window.scrollTo({
              top: section.offsetTop - 80,
              behavior: 'smooth'
            });
            setActiveMenuItem(hash);
          }
        }, 500); // Delay to ensure page is loaded
      }
    }
  }, [router.pathname, router.asPath]);

  // Set active menu item based on current route
  useEffect(() => {
    if (router.pathname === '/') {
      // On home page, let scroll handler manage active state
      return;
    } else if (router.pathname.startsWith('/blog')) {
      setActiveMenuItem('blog');
    } else {
      // Default fallback
      setActiveMenuItem('home');
    }
  }, [router.pathname]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Prepare the data for project request API
      const projectRequestData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || '',
        company: formData.company || '',
        projectType: 'web-development', // Default value, can be mapped from service
        services: [formData.service],
        budget: formData.budget,
        timeline: 'discuss', // Default value
        description: formData.message,
        features: [],
        platforms: [],
        designPreferences: 'modern',
        hasExistingDesign: false,
        projectGoals: formData.message,
        targetAudience: 'general',
        competitorExamples: '',
        additionalRequirements: ''
      };

      const response = await fetch('/api/project-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectRequestData),
      });

      if (response.ok) {
        toast.success('Thank you for your enquiry! We will contact you soon.');
        setIsModalOpen(false);
        setIsMenuOpen(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          service: '',
          budget: '',
          message: ''
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit enquiry');
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Sorry, there was an error submitting your enquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  const openEnquiryModal = () => {
    setIsModalOpen(true);
    setIsMenuOpen(false);
  };

  const menuItems = [
    { id: 'home', label: 'Home', path: null, icon: Home },
    { id: 'services', label: 'Services', path: null, icon: Settings },
    { id: 'technologies', label: 'Technologies', path: null, icon: Code },
    { id: 'projects', label: 'Projects', path: null, icon: Briefcase },
    { id: 'blog', label: 'Blog', path: '/blog', icon: BookOpen },
    { id: 'contact', label: 'Contact', path: null, icon: Mail },
  ];

  return (
    <>
      {/* Main Navbar */}
      <nav className={cn(
        "fixed top-4 left-4 right-4 z-50 transition-all duration-500 ease-out backdrop-blur-2xl bg-white/70 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] border border-white/30 rounded-3xl",
        isMenuOpen ? "blur-sm" : ""
      )}>
        <div className="container mx-auto px-4 md:px-6 py-3">
          <div className={cn(
            "flex justify-between items-center transition-all duration-300",
            isMenuOpen ? "blur-sm" : ""
          )}>
            {/* Logo */}
            <div className="flex items-center">
              <img 
                src="/lavishstar.png" 
                alt="Lavishstar Technologies" 
                className="h-12 w-auto transition-all duration-300 brightness-90"
                />
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8 items-center">
              {menuItems.map((item) => {
                if (item.path) {
                  return (
                    <Link
                      key={item.id}
                      href={item.path}
                      className={cn(
                        "text-sm font-medium transition-colors",
                        activeMenuItem === item.id
                          ? "text-weebix-primary"
                          : "text-weebix-dark hover:text-weebix-primary"
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                } else {
                  return (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={cn(
                        "text-sm font-medium transition-colors",
                        activeMenuItem === item.id
                          ? "text-weebix-primary"
                          : "text-weebix-dark hover:text-weebix-primary"
                      )}
                    >
                      {item.label}
                    </button>
                  );
                }
              })}
              <Button
                onClick={openEnquiryModal}
                className="bg-weebix-primary hover:bg-weebix-primary/90 text-white"
              >
                Get Started
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className={cn(
                "md:hidden relative z-50 p-2 rounded-xl transition-all duration-300",
                isMenuOpen ? "blur-none" : ""
              )}
            >
              <div className="relative w-6 h-6">
                <span
                  className={cn(
                    "absolute top-1 left-0 w-6 h-0.5 bg-gray-700 transition-all duration-300 origin-center",
                    isMenuOpen ? "rotate-45 top-3" : ""
                  )}
                />
                <span
                  className={cn(
                    "absolute top-3 left-0 w-6 h-0.5 bg-gray-700 transition-all duration-300",
                    isMenuOpen ? "opacity-0" : ""
                  )}
                />
                <span
                  className={cn(
                    "absolute top-5 left-0 w-6 h-0.5 bg-gray-700 transition-all duration-300 origin-center",
                    isMenuOpen ? "-rotate-45 top-3" : ""
                  )}
                />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Menu - Bottom Slide */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 bg-white z-50 md:hidden shadow-2xl rounded-t-3xl transform transition-transform duration-300 ease-in-out max-h-[80vh]",
          isMenuOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* Menu Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white rounded-t-3xl">
          <div className="flex items-center">
            <img 
              src="/lavishstar.png" 
              alt="Lavishstar Technologies" 
              className="h-10 w-auto brightness-90"
            />
          </div>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <X size={24} className="text-gray-700" />
          </button>
        </div>

        {/* Menu Items */}
        <div className="flex flex-col p-4 space-y-2 overflow-y-auto max-h-[50vh]">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            if (item.path) {
              return (
                <Link
                  key={item.id}
                  href={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "flex items-center px-4 py-3 rounded-xl transition-all duration-200 group",
                    activeMenuItem === item.id
                      ? "bg-weebix-primary text-white shadow-lg"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <IconComponent 
                    size={20} 
                    className={cn(
                      "mr-4 transition-colors",
                      activeMenuItem === item.id ? "text-white" : "text-weebix-primary"
                    )}
                  />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            } else {
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={cn(
                    "flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 text-left group",
                    activeMenuItem === item.id
                      ? "bg-weebix-primary text-white shadow-lg"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <IconComponent 
                    size={20} 
                    className={cn(
                      "mr-4 transition-colors",
                      activeMenuItem === item.id ? "text-white" : "text-weebix-primary"
                    )}
                  />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            }
          })}
        </div>

        {/* Get Started Button */}
        <div className="p-4 border-t border-gray-100">
          <Button
            onClick={openEnquiryModal}
            className="w-full bg-weebix-primary hover:bg-weebix-primary/90 text-white py-3 text-lg font-medium shadow-lg"
          >
            Get Started
          </Button>
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
                      disabled={isSubmitting}
                      className="flex-1 bg-weebix-primary hover:bg-weebix-primary/90 h-9 sm:h-10 text-sm sm:text-base disabled:opacity-50"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Enquiry'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;
