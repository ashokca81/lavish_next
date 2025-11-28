import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Users, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const WhatsAppChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleWhatsAppClick = () => {
    const phoneNumber = '+919705239494';
    const message = 'Hi! I am interested in your digital solutions. Can we discuss my project?';
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    setIsOpen(false);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* WhatsApp Chat Bot Button */}
      <div className="fixed bottom-24 right-6 z-50">
        {/* Pulse Rings */}
        <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-30"></div>
        <div className="absolute inset-0 rounded-full bg-green-400 animate-pulse opacity-40"></div>
        
        {/* Main Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full shadow-2xl hover:scale-110 hover:shadow-green-500/50 transition-all duration-500 group animate-bounce"
          style={{ animationDuration: '2s' }}
        >
          <MessageCircle className="w-8 h-8 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform" />
          
          {/* Sparkle */}
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-pulse">
            <Sparkles className="w-3 h-3 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
        </button>
        
        {/* Notification Badge */}
        <div className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-bounce">
          <span className="text-white text-xs font-bold">1</span>
        </div>
      </div>

      {/* Popup Modal */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-in fade-in duration-300"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Popup Content */}
          <div className="fixed bottom-24 right-6 z-50 w-80 max-w-[90vw] animate-in slide-in-from-bottom-5 duration-500">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
              {/* Header */}
              <div className="relative bg-gradient-to-r from-green-500 via-green-400 to-emerald-500 p-6 text-white overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-2 left-4 w-16 h-16 bg-white/30 rounded-full blur-xl animate-pulse"></div>
                  <div className="absolute bottom-2 right-4 w-12 h-12 bg-white/20 rounded-full blur-lg animate-pulse"></div>
                </div>
                
                <div className="absolute top-4 left-4 animate-bounce">
                  <Users className="w-6 h-6 text-white/80" />
                </div>
                <div className="absolute top-6 right-8 animate-bounce">
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                </div>
                
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-1">Welcome to Lavishstar!</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                      <span className="text-green-100 text-sm">Online now</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <X size={16} className="text-white" />
                  </button>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="flex justify-center items-center space-x-2 mb-4">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center animate-bounce">
                      <span className="text-purple-600 text-lg">🎉</span>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center animate-bounce">
                      <span className="text-blue-600 text-xl">👥</span>
                    </div>
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
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
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 text-base font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group"
                >
                  <MessageCircle className="w-5 h-5 mr-3 group-hover:animate-pulse" />
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
  );
};

export default WhatsAppChatBot;