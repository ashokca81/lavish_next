
import React, { useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from 'lucide-react';

const projects = [
  {
    title: "E-commerce Platform",
    category: "Web Development",
    description: "A fully responsive e-commerce platform with advanced product filtering, real-time inventory, and secure payment processing.",
    image: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' fill='none' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23f8fafc'/%3E%3Cpath fill='%23e2e8f0' d='M234 130h140v30H234zM234 180h80v15h-80zM234 210h120v15H234zM234 240h60v30h-60zM314 240h60v30h-60z'/%3E%3Cpath fill='%23cbd5e1' d='M274 90a20 20 0 1 1-40 0 20 20 0 0 1 40 0zM354 90a20 20 0 1 1-40 0 20 20 0 0 1 40 0z'/%3E%3Cpath stroke='%23cbd5e1' stroke-width='8' d='M254 90h80'/%3E%3C/svg%3E",
    delay: 100
  },
  {
    title: "Factory Monitoring Dashboard",
    category: "Industrial Automation",
    description: "Real-time monitoring system for manufacturing facilities with predictive maintenance alerts and production analytics.",
    image: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' fill='none' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23f8fafc'/%3E%3Cpath fill='%23e2e8f0' d='M150 100h300v200H150z'/%3E%3Cpath fill='%23cbd5e1' d='M170 120h100v60h-100zM170 200h100v80h-100zM290 120h140v160H290z'/%3E%3Cpath stroke='%2394a3b8' stroke-width='4' d='M310 200h100M310 230h100M310 260h100'/%3E%3Cpath fill='%2394a3b8' d='M200 150c-5 0-10 5-10 10s5 10 10 10 10-5 10-10-5-10-10-10zM200 230c-5 0-10 5-10 10s5 10 10 10 10-5 10-10-5-10-10-10zM200 260c-5 0-10 5-10 10s5 10 10 10 10-5 10-10-5-10-10-10z'/%3E%3C/svg%3E",
    delay: 200
  },
  {
    title: "Mobile Banking App",
    category: "Mobile Development",
    description: "Secure and intuitive banking application with real-time transactions, expense tracking, and personalized financial insights.",
    image: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' fill='none' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23f8fafc'/%3E%3Crect width='200' height='380' x='200' y='10' fill='%23e2e8f0' rx='20'/%3E%3Crect width='180' height='300' x='210' y='50' fill='%23cbd5e1' rx='10'/%3E%3Cpath fill='%2394a3b8' d='M240 80h120v40H240zM240 140h120v20H240zM240 180h120v20H240zM240 220h50v20h-50zM310 220h50v20h-50zM240 260h120v40H240z'/%3E%3Ccircle cx='300' cy='30' r='10' fill='%2394a3b8'/%3E%3C/svg%3E",
    delay: 300
  },
  {
    title: "Healthcare Management System",
    category: "Web Application",
    description: "Comprehensive healthcare platform for clinics and hospitals with appointment scheduling, patient records, and billing management.",
    image: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' fill='none' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23f8fafc'/%3E%3Cpath fill='%23e2e8f0' d='M150 100h300v200H150z'/%3E%3Cpath fill='%23cbd5e1' d='M180 130h240v30H180zM180 180h100v30H180zM180 230h100v30H180zM300 180h120v80H300z'/%3E%3Cpath stroke='%2394a3b8' stroke-width='6' d='M360 220v-20M350 210h20'/%3E%3C/svg%3E",
    delay: 400
  }
];

const ProjectCard = ({ project, index }: { project: typeof projects[0]; index: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('active');
            }, project.delay);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    
    if (cardRef.current) {
      observer.observe(cardRef.current);
    }
    
    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, [project.delay]);
  
  return (
    <div ref={cardRef} className="reveal bg-gradient-to-br from-indigo-800/60 via-purple-700/50 to-slate-800/60 backdrop-blur-sm border border-indigo-400/30 hover:border-indigo-300/50 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col h-full group hover:transform hover:scale-105">
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-600/30 to-slate-800/50">
        <div className="w-full h-48 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 object-cover transition-transform duration-500 ease-in-out group-hover:scale-105">
          <img 
            src={project.image} 
            alt={project.title}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-90 transition-opacity duration-300"
          />
        </div>
        <div className="absolute top-4 left-4 bg-gradient-to-r from-indigo-500/90 to-purple-500/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-white border border-indigo-300/30">
          {project.category}
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-grow bg-gradient-to-br from-slate-800/60 to-indigo-900/40">
        <h3 className="text-xl font-bold mb-2 text-white group-hover:text-indigo-200 transition-colors duration-300">{project.title}</h3>
        <p className="text-gray-300 group-hover:text-gray-200 mb-4 flex-grow transition-colors duration-300">{project.description}</p>
        <Button variant="outline" className="w-full group/btn bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-indigo-400/50 text-white hover:from-indigo-500/30 hover:to-purple-500/30 hover:border-indigo-300/70 transition-all duration-300">
          View Project
          <ArrowUpRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
};

const ProjectsSection = () => {
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
  
  return (
    <section id="projects" className="py-20 bg-gradient-to-br from-purple-900 via-slate-800 to-indigo-900 relative overflow-hidden">
      {/* Hexagonal grid pattern overlay for visual distinction */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 200 200" fill="none">
          <defs>
            <pattern id="hexagons" x="0" y="0" width="50" height="43.4" patternUnits="userSpaceOnUse">
              <polygon points="25,8.7 43.3,21.7 43.3,34.6 25,43.3 6.7,34.6 6.7,21.7" stroke="rgba(255,255,255,0.1)" fill="none" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hexagons)"/>
        </svg>
      </div>
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-yellow-400/60 to-transparent"></div>
      <div className="container mx-auto px-4 md:px-6">
        <div ref={sectionRef} className="text-center mb-12 reveal relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Featured Projects</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-brand-blue via-brand-yellow to-brand-purple mx-auto mb-6"></div>
          <p className="max-w-2xl mx-auto text-gray-300 text-lg">
            Take a look at some of our recent work that showcases our expertise and creativity
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {projects.map((project, index) => (
            <ProjectCard key={index} project={project} index={index} />
          ))}
        </div>
        
        <div className="text-center mt-12 relative z-10">
          <Button size="lg" className="bg-gradient-to-r from-blue-600 via-yellow-500 to-purple-600 hover:from-blue-700 hover:via-yellow-400 hover:to-purple-700 text-white shadow-lg hover:shadow-yellow-400/20 transition-all duration-300">
            View All Projects
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
