import { useState, useEffect } from 'react';

interface ContentItem {
  _id: string;
  type: string;
  section: string;
  title: string;
  content: string;
  imageUrl?: string;
  linkUrl?: string;
  metadata?: any;
  isActive: boolean;
}

export const useContent = (type?: string, section?: string) => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = async () => {
    try {
      setLoading(true);
      let url = '/api/content';
      const params = new URLSearchParams();
      
      if (type) params.append('type', type);
      if (section) params.append('section', section);
      
      if (params.toString()) {
        url += '?' + params.toString();
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        // Filter only active content
        const activeContent = data.data.filter((item: ContentItem) => item.isActive);
        setContent(activeContent);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch content');
      }
    } catch (err) {
      setError('Failed to fetch content');
      console.error('Content fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [type, section]);

  const getContent = (type: string, section?: string) => {
    if (section) {
      return content.find(item => item.type === type && item.section === section);
    }
    return content.find(item => item.type === type);
  };

  const getContentList = (type: string, section?: string) => {
    let filtered = content.filter(item => item.type === type);
    if (section) {
      filtered = filtered.filter(item => item.section === section);
    }
    return filtered;
  };

  return {
    content,
    loading,
    error,
    getContent,
    getContentList,
    refetch: fetchContent
  };
};

export default useContent;