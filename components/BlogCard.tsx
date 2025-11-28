
import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MessageSquare, Eye } from "lucide-react";
import { BlogPost } from '../types/blog';

interface BlogCardProps {
  post: BlogPost;
  featured?: boolean;
}

const BlogCard = ({ post, featured = false }: BlogCardProps) => {
  return (
    <Card className={`h-full overflow-hidden transition-all duration-300 hover:shadow-lg ${featured ? 'border-2 border-primary' : ''}`}>
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="relative overflow-hidden">
          <img 
            src={post.featuredImage} 
            alt={post.title} 
            className="w-full h-48 object-cover transition-transform duration-500 hover:scale-105"
          />
          <Badge className="absolute top-2 right-2 bg-primary hover:bg-primary/90">
            {post.category}
          </Badge>
        </div>
        
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <img 
              src={post.author.avatar} 
              alt={post.author.name} 
              className="w-6 h-6 rounded-full object-cover"
            />
            <span>{post.author.name}</span>
          </div>
          <h3 className="text-xl font-bold leading-tight line-clamp-2 hover:text-primary transition-colors">
            {post.title}
          </h3>
        </CardHeader>
        
        <CardContent className="pb-2">
          <p className="text-muted-foreground line-clamp-3 text-sm">
            {post.excerpt}
          </p>
        </CardContent>
        
        <CardFooter className="flex flex-wrap items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{post.readTime} min read</span>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-2 sm:mt-0">
            <div className="flex items-center gap-1">
              <Eye size={14} />
              <span>{post.views}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare size={14} />
              <span>{post.comments}</span>
            </div>
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
};

export default BlogCard;
