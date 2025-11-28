import React, { useState } from 'react';
import Head from 'next/head';
import { blogPosts } from '@/data/blogPosts';
import BlogCard from '@/components/BlogCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Filter } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const BlogPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState('all');
  
  const postsPerPage = 6;
  const categories = ['all', ...Array.from(new Set(blogPosts.map(post => post.category.toLowerCase())))];
  
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = activeCategory === 'all' || 
                           post.category.toLowerCase() === activeCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  
  return (
    <>
      <Head>
        <title>Blog - Lavishstar</title>
        <meta name="description" content="Latest articles, tutorials and insights on web development and technology" />
      </Head>
      
      <div className="min-h-screen flex flex-col relative">
        <Navbar />
        
        <main className="flex-grow pt-24 pb-18">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 mt-10">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 text-gradient leading-tight md:leading-tight">Our Blog</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Discover insights, tutorials, and thoughts on web development, design, and technology.
              </p>
            </div>
            
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
              <div className="relative flex-grow max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  type="text"
                  placeholder="Search articles..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Tabs defaultValue="all" className="w-full sm:w-auto" onValueChange={setActiveCategory}>
                <TabsList className="w-full sm:w-auto overflow-x-auto flex-nowrap">
                  {categories.map((category) => (
                    <TabsTrigger 
                      key={category} 
                      value={category}
                      className="capitalize"
                    >
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
            
            {/* Featured Post */}
            {currentPage === 1 && searchTerm === '' && activeCategory === 'all' && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Filter size={20} className="text-primary" />
                  Featured Article
                </h2>
                <div className="grid grid-cols-1">
                  <BlogCard post={blogPosts[0]} featured={true} />
                </div>
              </div>
            )}
            
            {/* Posts Grid */}
            <div className="mb-12">
              {filteredPosts.length > 0 ? (
                <>
                  <h2 className="text-2xl font-bold mb-6">Latest Articles</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentPosts.map((post) => (
                      <BlogCard key={post.id} post={post} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-16">
                  <h3 className="text-xl font-medium mb-2">No articles found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or filter to find what you're looking for.
                  </p>
                </div>
              )}
            </div>
            
            {/* Pagination */}
            {filteredPosts.length > 0 && (
              <Pagination className="my-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => paginate(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                    <PaginationItem key={number}>
                      <PaginationLink
                        onClick={() => paginate(number)}
                        isActive={currentPage === number}
                      >
                        {number}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
            
            {/* Newsletter Signup */}
            <div className="bg-dots rounded-xl p-8 shadow-lg mb-12">
              <div className="text-center max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold mb-3">Subscribe to Our Newsletter</h3>
                <p className="text-muted-foreground mb-6">
                  Get the latest articles, tutorials and updates delivered to your inbox.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="flex-grow" 
                  />
                  <button className="btn-primary">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
        
        {/* Enhanced animated decorative elements */}
        <div className="fixed -z-10 top-1/3 left-20 w-64 h-64 bg-weebix-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="fixed -z-10 bottom-1/4 right-20 w-80 h-80 bg-weebix-secondary/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="fixed -z-10 top-1/2 left-1/2 w-96 h-96 bg-weebix-accent/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
    </>
  );
};

export default BlogPage;