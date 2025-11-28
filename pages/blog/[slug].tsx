import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { blogPosts } from '../../data/blogPosts';
import { BlogPost } from '../../types/blog';
import { 
  ChevronLeft, Calendar, Clock, Eye, MessageSquare, 
  Share, Bookmark, Facebook, Twitter, Linkedin, Copy,
  User, ThumbsUp, BookOpen, Mail
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import BlogCard from '../../components/BlogCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const BlogDetail = () => {
  const router = useRouter();
  const { slug } = router.query;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [activeTab, setActiveTab] = useState<string>('article');
  const [scrollProgress, setScrollProgress] = useState(0);
  
  useEffect(() => {
    if (!slug) return;
    
    // Find the post with matching slug
    const currentPost = blogPosts.find(post => post.slug === slug);
    
    if (currentPost) {
      setPost(currentPost);
      
      // Find related posts from the same category (excluding the current post)
      const related = blogPosts
        .filter(p => p.category === currentPost.category && p.id !== currentPost.id)
        .slice(0, 3);
      
      setRelatedPosts(related);
      
      // Scroll to top when post changes
      window.scrollTo(0, 0);
    }
  }, [slug]);
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      setScrollProgress(scrollPercent);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };
  
  const shareOnSocialMedia = (platform: string) => {
    let url = '';
    
    if (platform === 'facebook') {
      url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
    } else if (platform === 'twitter') {
      url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post?.title || '')}`;
    } else if (platform === 'linkedin') {
      url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
    }
    
    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }
  };
  
  if (!post) {
    return (
      <>
        <Head>
          <title>Post not found - Lavishstar</title>
        </Head>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Post not found</h1>
            <Link href="/blog" className="text-primary hover:underline">
              Return to blog
            </Link>
          </div>
        </div>
      </>
    );
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <>
      <Head>
        <title>{post.title} - Lavishstar Blog</title>
        <meta name="description" content={post.excerpt} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:image" content={post.featuredImage} />
      </Head>
      
      <div className="min-h-screen flex flex-col relative">
        <Navbar />
        
        {/* Progress Bar */}
        <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
          <div 
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-150"
            style={{ width: `${scrollProgress}%` }}
          ></div>
        </div>
        
        <main className="flex-grow pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-7xl">
            {/* Back to Blog */}
            <Link href="/blog" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors">
              <ChevronLeft size={20} className="mr-2" />
              Back to Blog
            </Link>
            
            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content - Left Side */}
              <div className="lg:col-span-2">
                {/* Article Header */}
                <article className="mb-12">
              <header className="mb-8">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary" className="capitalize">
                    {post.category}
                  </Badge>
                  {post.tags?.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                  {post.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-6">
                  <div className="flex items-center">
                    <Calendar size={18} className="mr-2" />
                    <time dateTime={post.publishedAt}>
                      {formatDate(post.publishedAt)}
                    </time>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock size={18} className="mr-2" />
                    <span>{post.readTime}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Eye size={18} className="mr-2" />
                    <span>1,234 views</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center">
                    <Avatar className="mr-3">
                      <AvatarImage src={post.author.avatar} alt={post.author.name} />
                      <AvatarFallback>
                        {post.author.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{post.author.name}</p>
                      <p className="text-sm text-muted-foreground">{post.author.role}</p>
                    </div>
                  </div>
                  
                  {/* Social Share */}
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => shareOnSocialMedia('facebook')}
                    >
                      <Facebook size={16} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => shareOnSocialMedia('twitter')}
                    >
                      <Twitter size={16} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => shareOnSocialMedia('linkedin')}
                    >
                      <Linkedin size={16} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                    >
                      <Copy size={16} />
                    </Button>
                  </div>
                </div>
              </header>
              
              {/* Featured Image */}
              <div className="mb-8">
                <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden shadow-lg">
                  <Image
                    src={post.featuredImage}
                    alt={post.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                    priority
                  />
                </div>
              </div>
              
              {/* Article Content */}
              <div className="prose prose-lg max-w-none">
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
              </div>
            </article>
            
            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <BlogCard key={relatedPost.id} post={relatedPost} />
                  ))}
                </div>
              </section>
            )}
            
            {/* Comments Section */}
            <section className="mb-12">
              <Tabs defaultValue="comments" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="comments">Comments (12)</TabsTrigger>
                  <TabsTrigger value="write">Write Comment</TabsTrigger>
                </TabsList>
                
                <TabsContent value="comments" className="space-y-6 mt-6">
                  {/* Sample Comments */}
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="p-4">
                        <div className="flex items-start space-x-3">
                          <Avatar>
                            <AvatarFallback>JD</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">John Doe</h4>
                              <span className="text-sm text-muted-foreground">2 hours ago</span>
                            </div>
                            <p className="text-muted-foreground mb-2">
                              This is a great article! Very informative and well written. Thanks for sharing.
                            </p>
                            <div className="flex items-center space-x-4 text-sm">
                              <Button variant="ghost" size="sm">
                                <ThumbsUp size={14} className="mr-1" />
                                Like (5)
                              </Button>
                              <Button variant="ghost" size="sm">
                                <MessageSquare size={14} className="mr-1" />
                                Reply
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="write" className="mt-6">
                  <Card className="p-6">
                    <form className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input placeholder="Your name" />
                        <Input type="email" placeholder="Your email" />
                      </div>
                      <Textarea 
                        placeholder="Write your comment..." 
                        className="min-h-[120px]"
                      />
                      <Button type="submit" className="w-full">
                        Post Comment
                      </Button>
                    </form>
                  </Card>
                </TabsContent>
              </Tabs>
            </section>
          </div>
          
          {/* Sidebar - Right Side */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Author Card */}
              <Card className="p-6">
                <div className="text-center">
                  <Avatar className="w-20 h-20 mx-auto mb-4">
                    <AvatarImage src={post.author.avatar} alt={post.author.name} />
                    <AvatarFallback className="text-lg">
                      {post.author.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg mb-2">{post.author.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{post.author.role}</p>
                  <p className="text-sm leading-relaxed">
                    Passionate developer and UI/UX designer with 5+ years of experience in creating digital solutions.
                  </p>
                </div>
              </Card>
              
              {/* Table of Contents */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <BookOpen size={18} />
                  Table of Contents
                </h3>
                <nav className="space-y-2">
                  <a href="#introduction" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                    1. Introduction
                  </a>
                  <a href="#principles" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                    2. Key Principles
                  </a>
                  <a href="#implementation" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                    3. Implementation
                  </a>
                  <a href="#conclusion" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                    4. Conclusion
                  </a>
                </nav>
              </Card>
              
              {/* Popular Posts */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Eye size={18} />
                  Popular Posts
                </h3>
                <div className="space-y-4">
                  {blogPosts.slice(0, 3).map((popularPost) => (
                    <Link 
                      key={popularPost.id} 
                      href={`/blog/${popularPost.slug}`}
                      className="block group"
                    >
                      <div className="flex gap-3">
                        <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                          <Image 
                            src={popularPost.featuredImage} 
                            alt={popularPost.title}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">
                            {popularPost.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(popularPost.publishedAt)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </Card>
              
              {/* Newsletter Signup */}
              <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Mail size={18} />
                  Stay Updated
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get the latest articles and insights delivered to your inbox.
                </p>
                <div className="space-y-3">
                  <Input placeholder="Your email" type="email" />
                  <Button className="w-full">Subscribe</Button>
                </div>
              </Card>
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

export default BlogDetail;