
import React, { useEffect, useRef } from 'react';
import { 
  Globe, Code, Smartphone, Database, 
  LineChart, Cpu, Monitor, Layers
} from 'lucide-react';


const ServiceCard = ({ icon, title, description, delay }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  delay: number;
}) => {
  return (
    <div className="reveal" style={{ animationDelay: `${delay}ms` }}>
      <div className="p-6 rounded-xl bg-gradient-to-br from-slate-800/60 via-blue-900/40 to-slate-700/60 border border-blue-500/20 hover:border-yellow-400/40 shadow-lg hover:shadow-xl hover:shadow-yellow-400/10 transition-all duration-500 group hover:scale-105">
        <div className="w-16 h-16 mb-4 p-3 rounded-lg bg-gradient-to-br from-blue-500/20 via-yellow-400/15 to-purple-500/20 backdrop-blur-sm group-hover:from-blue-400/30 group-hover:via-yellow-400/25 group-hover:to-purple-400/30 transition-all duration-300 flex items-center justify-center animate-pulse group-hover:animate-bounce">
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-2 text-white group-hover:text-blue-200 transition-colors duration-300 gradient-text">
          {title}
        </h3>
        <p className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
          {description}
        </p>
        
        {/* Decorative Elements */}
        <div className="absolute top-2 right-2 w-2 h-2 bg-yellow-400 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute bottom-2 left-2 w-1 h-1 bg-blue-400 rounded-full animate-bounce opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{animationDelay: '0.5s'}}></div>
      </div>
    </div>
  );
};

const ServicesSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  
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
  
  const services = [
    {
      icon: <Globe className="w-12 h-12 text-brand-blue" />,
      title: "WordPress Development",
      description: "Custom WordPress websites with powerful plugins and responsive designs for businesses of all sizes.",
      delay: 100
    },
    {
      icon: <Code className="w-12 h-12 text-brand-purple" />,
      title: "ReactJS Development",
      description: "Dynamic and interactive user interfaces with React's component-based architecture for modern web applications.",
      delay: 200
    },
    {
      icon: <Smartphone className="w-12 h-12 text-brand-orange" />,
      title: "Flutter & React Native",
      description: "Cross-platform mobile applications that deliver native performance and beautiful UIs across iOS and Android.",
      delay: 300
    },
    {
      icon: <Database className="w-12 h-12 text-brand-blue" />,
      title: "Django Backend",
      description: "Secure, scalable, and maintainable backend systems powered by Django's robust framework and Python.",
      delay: 400
    },
    {
      icon: <LineChart className="w-12 h-12 text-brand-purple" />,
      title: "Analytics Dashboards",
      description: "Data visualization and business intelligence solutions that transform complex data into actionable insights.",
      delay: 500
    },
    {
      icon: <Cpu className="w-12 h-12 text-brand-orange" />,
      title: "Industrial Automation",
      description: "Smart factory solutions and industrial IoT implementations to optimize operations and increase efficiency.",
      delay: 600
    },
    {
      icon: <Monitor className="w-12 h-12 text-brand-blue" />,
      title: "UI/UX Design",
      description: "User-centered design approaches that create intuitive, engaging, and accessible digital experiences.",
      delay: 700
    },
    {
      icon: <Layers className="w-12 h-12 text-brand-purple" />,
      title: "Full-Stack Solutions",
      description: "End-to-end development services from concept to deployment, ensuring seamless integration between all layers.",
      delay: 800
    }
  ];
  
  return (
    <section id="services" className="py-20 bg-gradient-to-br from-black via-gray-900 to-blue-900 relative overflow-hidden">
      {/* Decorative elements for visual distinction */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-transparent to-purple-600/5 pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-yellow-400/60 to-transparent"></div>
      <div className="container mx-auto px-4 md:px-6">
        <div className="reveal">
          <div className="text-center mb-16 relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white gradient-text">Our Services</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-brand-blue via-brand-yellow to-brand-purple mx-auto mb-6 animate-pulse"></div>
            <p className="max-w-2xl mx-auto text-gray-300 text-lg">
              We offer a comprehensive range of digital services to help your business 
              thrive in the digital landscape
            </p>
            
            {/* Visual Elements */}
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute -bottom-5 right-1/4 w-12 h-12 bg-gradient-to-r from-yellow-400/10 to-blue-400/10 rounded-full blur-lg animate-bounce" style={{animationDelay: '1s'}}></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <ServiceCard 
              key={index}
              icon={service.icon}
              title={service.title}
              description={service.description}
              delay={service.delay}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
