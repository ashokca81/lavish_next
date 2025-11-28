import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import ServicesSection from '@/components/ServicesSection';
import TechnologiesSection from '@/components/TechnologiesSection';
import ProjectsSection from '@/components/ProjectsSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import ScrollReveal from '@/utils/ScrollReveal';
import { MessageCircle, X, Users, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  
  useEffect(() => {
    // Show WhatsApp after 3 seconds
    const whatsappTimer = setTimeout(() => {
      setShowWhatsApp(true);
    }, 3000);
    
    return () => {
      clearTimeout(whatsappTimer);
    };
  }, []);
  
  const handleWhatsAppClick = () => {
    const phoneNumber = '+919705239494';
    const message = 'Hi! I am interested in your digital solutions. Can we discuss my project?';
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    setIsWhatsAppOpen(false);
  };
  
  return (
    <>
      <Head>
        <title>Lavishstar - Web Development & Digital Solutions</title>
        <meta name="description" content="Professional web development and digital solutions" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen flex flex-col relative">
        <Navbar />
        <main className="flex-grow">
          <HeroSection />
          <ServicesSection />
          <TechnologiesSection />
          <ProjectsSection />
          <ContactSection />
        </main>
        <Footer />
        <ScrollReveal />
        
        {/* WhatsApp Chat Bot */}
        {showWhatsApp && (
          <>
            {/* WhatsApp Chat Bot Button */}
            <div className="fixed bottom-4 right-4 z-50">
              {/* Main Button */}
              <button
                onClick={() => setIsWhatsAppOpen(!isWhatsAppOpen)}
                className="relative w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isWhatsAppOpen ? (
                  <X className="w-8 h-8 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                ) : (
                  <svg 
                    className="w-8 h-8 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" 
                    viewBox="0 0 24 24" 
                    fill="currentColor"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.461 3.488"/>
                  </svg>
                )}
              </button>
            </div>

            {/* Popup Modal */}
            {isWhatsAppOpen && (
              <>
                {/* Overlay */}
                <div 
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-in fade-in duration-300"
                  onClick={() => setIsWhatsAppOpen(false)}
                />
                
                {/* Popup Content */}
                <div className="fixed bottom-4 right-4 z-50 w-80 max-w-[90vw] animate-in slide-in-from-bottom-5 duration-300">
                  <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-200">
                    {/* Enhanced Close Button - Top Right Edge */}
                    <button
                      onClick={() => setIsWhatsAppOpen(false)}
                      className="absolute -top-3 -right-3 z-[60] w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 border-2 border-white group"
                    >
                      <X size={18} className="text-white group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                    {/* Header */}
                    <div className="relative bg-gradient-to-r from-green-500 via-green-400 to-emerald-500 p-6 text-white rounded-t-3xl overflow-hidden">
                      <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-2 left-4 w-16 h-16 bg-white/30 rounded-full blur-xl"></div>
                        <div className="absolute bottom-2 right-4 w-12 h-12 bg-white/20 rounded-full blur-lg"></div>
                      </div>
                      
                      <div className="relative z-10 flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold mb-1">Welcome to Lavishstar!</h3>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                            <span className="text-green-100 text-sm">Online now</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-6">
                      <div className="text-center mb-6">
                        <div className="flex justify-center items-center space-x-2 mb-4">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-purple-600 text-lg">🎉</span>
                          </div>
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 text-xl">👥</span>
                          </div>
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 text-lg">✨</span>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 text-base leading-relaxed mb-4">
                          We are here to help you! Chat with us on WhatsApp for any queries about our digital solutions.
                        </p>
                        
                        <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-left">
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>Instant Response</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span>Free Consultation</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              <span>24/7 Support</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={handleWhatsAppClick}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 text-base font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <svg 
                          className="w-5 h-5 mr-3" 
                          viewBox="0 0 24 24" 
                          fill="currentColor"
                        >
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.461 3.488"/>
                        </svg>
                        START CHAT
                      </Button>
                      
                      <div className="text-center mt-4">
                        <p className="text-xs text-gray-500">Powered by Lavishstar Digital</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
        
        {/* Enhanced animated decorative elements */}
        <div className="fixed -z-10 top-1/3 left-20 w-64 h-64 bg-weebix-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="fixed -z-10 bottom-1/4 right-20 w-80 h-80 bg-weebix-secondary/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="fixed -z-10 top-1/2 left-1/2 w-96 h-96 bg-weebix-accent/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
    </>
  );
};

export default Index;