
import { useEffect } from 'react';

const ScrollReveal = () => {
  useEffect(() => {
    const handleScroll = () => {
      const revealElements = document.querySelectorAll('.reveal');
      
      revealElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        // Enhanced reveal with variable timing based on position
        if (elementTop < windowHeight * 0.85) {
          const delay = parseFloat((element as HTMLElement).dataset.delay || '0');
          setTimeout(() => {
            element.classList.add('active');
          }, delay);
        }
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    // Trigger once on load to reveal elements above the fold
    setTimeout(() => {
      handleScroll();
    }, 100);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Add staggered animations to containers with multiple items
    const staggeredContainers = document.querySelectorAll('[data-stagger]');
    
    staggeredContainers.forEach(container => {
      const items = container.querySelectorAll('[data-stagger-item]');
      const staggerDelay = parseFloat((container as HTMLElement).dataset.staggerDelay || '0.1');
      
      items.forEach((item, index) => {
        (item as HTMLElement).style.transitionDelay = `${index * staggerDelay}s`;
      });
    });
    
    // Add parallax scroll effect to elements with data-parallax attribute
    const handleParallaxScroll = () => {
      const parallaxElements = document.querySelectorAll('[data-parallax]');
      const scrollPosition = window.scrollY;
      
      parallaxElements.forEach(element => {
        const speed = parseFloat((element as HTMLElement).dataset.parallaxSpeed || '0.5');
        const direction = (element as HTMLElement).dataset.parallaxDirection || 'up';
        const yPos = direction === 'up' 
          ? scrollPosition * speed * -1 
          : scrollPosition * speed;
          
        (element as HTMLElement).style.transform = `translateY(${yPos}px)`;
      });
    };
    
    window.addEventListener('scroll', handleParallaxScroll);
    return () => window.removeEventListener('scroll', handleParallaxScroll);
  }, []);
  
  return null;
};

export default ScrollReveal;
