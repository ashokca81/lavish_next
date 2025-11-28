import React from 'react';
import Head from 'next/head';
import ContactForm from '@/components/ContactForm';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const ContactPage = () => {
  return (
    <>
      <Head>
        <title>Contact Us - Lavish Star Soft</title>
        <meta name="description" content="Get in touch with Lavish Star Soft. We'd love to hear about your project and provide expert consultation." />
        <meta name="keywords" content="contact, consultation, web development, mobile app, Lavish Star Soft" />
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <main className="pt-20 pb-16">
          <ContactForm />
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default ContactPage;