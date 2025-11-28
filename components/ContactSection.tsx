
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Send, 
  Check,
  Loader2
} from 'lucide-react';
import { useContent } from '@/hooks/useContent';

const ContactSection = () => {
  const { getContent, getContentList } = useContent('contact');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const sectionRef = useRef<HTMLDivElement>(null);
  
  // Get dynamic content
  const contactTitle = getContent('contact', 'title');
  const contactInfo = getContentList('contact', 'info');
  const contactDescription = getContent('contact', 'description');
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      console.log('📧 ContactSection: Submitting contact form', {
        name,
        email,
        subject,
        message
      });

      const response = await fetch('/api/contact-submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
          source: 'contact_section'
        }),
      });

      console.log('📧 ContactSection: Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('📧 ContactSection: Submission failed:', errorData);
        throw new Error(errorData.error || 'Failed to submit contact form');
      }

      const result = await response.json();
      console.log('📧 ContactSection: Submission successful:', result);

      setIsSubmitted(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      
      // Reset success message after a few seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    } catch (error) {
      console.error('📧 ContactSection: Error submitting form:', error);
      // You could add error state handling here if needed
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <section id="contact" className="py-20 bg-gradient-to-br from-indigo-900 via-blue-800 to-cyan-900 relative overflow-hidden">
      {/* Flowing wave pattern overlay for visual distinction */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
          <path d="M0,120 C100,80 200,160 400,120 L400,280 C300,240 200,320 0,280 Z" fill="rgba(255,255,255,0.05)"/>
          <path d="M0,200 C150,160 250,240 400,200 L400,360 C250,320 150,400 0,360 Z" fill="rgba(255,255,255,0.03)"/>
        </svg>
      </div>
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-yellow-400/60 to-transparent"></div>
      <div className="container mx-auto px-4 md:px-6">
        <div ref={sectionRef} className="text-center mb-12 reveal relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Get In Touch</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-brand-blue via-brand-yellow to-brand-purple mx-auto mb-6"></div>
          <p className="max-w-2xl mx-auto text-gray-300 text-lg">
            Have a project in mind or want to learn more about our services?
            We&apos;d love to hear from you!
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto relative z-10">
          <div className="reveal" style={{animationDelay: '0.2s'}}>
            <div className="bg-gradient-to-br from-cyan-800/50 via-indigo-700/60 to-blue-800/50 backdrop-blur-sm border border-cyan-400/20 hover:border-cyan-300/40 p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:transform hover:scale-[1.02]">
              <h3 className="text-2xl font-bold mb-6 text-white">Send Us a Message</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-cyan-200 mb-1">
                    Your Name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-cyan-200 mb-1">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-cyan-200 mb-1">
                    Subject
                  </label>
                  <Input
                    id="subject"
                    type="text"
                    placeholder="What is this regarding?"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-cyan-200 mb-1">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Tell us about your project..."
                    className="min-h-[120px]"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 via-yellow-500 to-purple-600 hover:from-blue-700 hover:via-yellow-400 hover:to-purple-700 shadow-lg hover:shadow-yellow-400/20 transition-all duration-300" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : isSubmitted ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Message Sent!
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
          
          <div className="reveal" style={{animationDelay: '0.4s'}}>
            <div className="bg-gradient-to-br from-indigo-700/70 via-cyan-600/60 to-blue-700/70 backdrop-blur-sm border border-indigo-400/30 hover:border-indigo-300/50 text-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:transform hover:scale-[1.02] h-full relative overflow-hidden group">
              {/* Decorative elements */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-indigo-500/10 pointer-events-none"></div>
              <div className="absolute -top-10 -right-10 w-20 h-20 bg-cyan-400/20 rounded-full blur-xl group-hover:bg-cyan-400/30 transition-colors duration-500"></div>
              <div className="absolute -bottom-5 -left-5 w-16 h-16 bg-indigo-400/15 rounded-full blur-lg group-hover:bg-indigo-400/25 transition-colors duration-500"></div>
              <h3 className="text-2xl font-bold mb-8 relative z-10">Contact Information</h3>
              
              <div className="space-y-6 relative z-10">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <MapPin className="h-6 w-6 text-white/80" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold mb-1">Our Office</h4>
                    <p className="text-white/80">
                     10-28/240/A, 10th line SHIVA SAI NAGAR<br />
                      KUSHAIGUDA, HYDERABAD - 500062
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <Phone className="h-6 w-6 text-white/80" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold mb-1">Phone</h4>
                    <p className="text-white/80">
                      +91 97052 39494<br />
                      +91 88011 88884
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <Mail className="h-6 w-6 text-white/80" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold mb-1">Email</h4>
                    <p className="text-white/80">
                      info@lavishstar.in<br />
                      support@lavishstar.in
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-12 relative z-10">
                <h4 className="text-lg font-semibold mb-4">Connect With Us</h4>
                <div className="flex space-x-4">
                  <a href="https://www.facebook.com/share/1XmALBXFuv/" target='blank' className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors">
                    <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z" />
                    </svg>
                  </a>
                  <a href="#" className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors">
                    <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.896-.959-2.173-1.559-3.591-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067 2.189 1.394 4.768 2.209 7.557 2.209 9.054 0 14-7.503 14-14v-.617c.961-.689 1.8-1.56 2.46-2.548l-.047-.02z" />
                    </svg>
                  </a>
                  <a href="https://www.instagram.com/lavishstartech/?igsh=ZXdpaXRsbDFuZzZs#" target='blank' className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors">
                    <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                    </svg>
                  </a>
                  <a href="#" className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors">
                    <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
