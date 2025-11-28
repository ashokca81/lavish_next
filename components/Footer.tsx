
import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { useContent } from '@/hooks/useContent';

const Footer = () => {
  const { getContent, getContentList } = useContent('footer');
  
  // Get dynamic content
  const logo = getContent('logo', 'main');
  const footerTagline = getContent('footer', 'tagline');
  const socialLinks = getContentList('footer', 'social');
  const navLinks = getContentList('footer', 'navigation');
  
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-2 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Logo and Tagline */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-6">
            <img 
              src={logo?.imageUrl || "/lavishstar-logo.png"} 
              alt={logo?.title || "Lavishstar Technologies"} 
              className="h-16 w-auto drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] filter contrast-125 brightness-110"
              style={{ filter: 'drop-shadow(0 1px 2px rgba(255,255,255,0.2)) drop-shadow(0 1px 3px rgba(0,0,0,0.6))' }}
            />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-0 tracking-wider">
            {footerTagline?.content || "TRANSFORMING IDEAS INTO DIGITAL EXCELLENCE"}
          </h2>
        </div>

        {/* Navigation Menu */}
        <div className="flex flex-wrap justify-center items-center gap-8 mb-4 text-gray-300">
          {navLinks && navLinks.length > 0 ? (
            navLinks.map((link) => (
              <a key={link._id} href={link.linkUrl || "#"} className="hover:text-white transition-colors duration-300">
                {link.title}
              </a>
            ))
          ) : (
            <>
              <a href="#about" className="hover:text-white transition-colors duration-300">About Us</a>
              <a href="#showcase" className="hover:text-white transition-colors duration-300">Our Showcase</a>
              <a href="#services" className="hover:text-white transition-colors duration-300">Services</a>
              <a href="#careers" className="hover:text-white transition-colors duration-300">Careers</a>
              <a href="#contact" className="hover:text-white transition-colors duration-300">Contact Us</a>
            </>
          )}
        </div>

        {/* Social Media Icons */}
        <div className="flex justify-center space-x-4 mb-6">
          <a 
            href="https://www.facebook.com/share/1XmALBXFuv/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-colors duration-300"
          >
            <Facebook size={20} className="text-white" />
          </a>
          <a 
            href="#" 
            className="w-12 h-12 rounded-full bg-blue-400 flex items-center justify-center hover:bg-blue-500 transition-colors duration-300"
          >
            <Twitter size={20} className="text-white" />
          </a>
          <a 
            href="#" 
            className="w-12 h-12 rounded-full bg-blue-700 flex items-center justify-center hover:bg-blue-800 transition-colors duration-300"
          >
            <Linkedin size={20} className="text-white" />
          </a>
          <a 
            href="https://www.instagram.com/lavishstartech/?igsh=ZXdpaXRsbDFuZzZs#" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center hover:from-purple-600 hover:to-pink-600 transition-colors duration-300"
          >
            <Instagram size={20} className="text-white" />
          </a>
        </div>

        {/* Copyright and Links */}
        <div className="text-center border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-4">
            <p className="text-gray-400 text-sm">
              Copyright © {new Date().getFullYear()} All Rights Reserved by Lavishstar Technologies
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#privacy" className="text-gray-400 hover:text-white transition-colors duration-300 underline">
                Privacy Policy
              </a>
              <a href="#terms" className="text-gray-400 hover:text-white transition-colors duration-300 underline">
                Terms and Conditions
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
