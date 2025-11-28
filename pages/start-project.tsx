import React from 'react';
import Head from 'next/head';
import ProjectRequestForm from '@/components/ProjectRequestForm';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const StartProjectPage = () => {
  return (
    <>
      <Head>
        <title>Start Your Project - Lavish Star Soft</title>
        <meta name="description" content="Tell us about your project requirements and get a custom quote from our expert team at Lavish Star Soft." />
        <meta name="keywords" content="project request, web development, mobile app, quote, Lavish Star Soft" />
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <main className="pt-20 pb-16">
          <ProjectRequestForm />
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default StartProjectPage;