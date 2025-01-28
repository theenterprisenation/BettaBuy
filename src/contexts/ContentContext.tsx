import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSiteContent } from '../lib/content';

interface SiteContent {
  id: string;
  type: 'menu' | 'text' | 'logo' | 'youtube';
  key: string;
  value: any;
}

interface ContentContextType {
  content: Record<string, SiteContent>;
  loading: boolean;
  error: Error | null;
  refreshContent: () => Promise<void>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function useContent() {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
}

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<Record<string, SiteContent>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const fetchContent = async () => {
    try {
      setLoading(true);
      const data = await getSiteContent();
      if (!data) {
        throw new Error('Failed to fetch content');
      }
      const contentMap = data.reduce((acc, item) => {
        acc[item.key] = item;
        return acc;
      }, {} as Record<string, SiteContent>);
      setContent(contentMap);
      setError(null);
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      console.error('Error fetching content:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch content'));
      
      // Implement retry logic
      if (retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        setTimeout(fetchContent, 1000 * Math.pow(2, retryCount)); // Exponential backoff
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const value = {
    content,
    loading,
    error,
    refreshContent: fetchContent
  };

  // Provide fallback content if loading fails
  if (error && Object.keys(content).length === 0) {
    const fallbackContent = {
      main_menu: {
        id: 'fallback',
        type: 'menu' as const,
        key: 'main_menu',
        value: [
          { label: 'Home', path: '/' },
          { label: 'Products', path: '/products' },
          { label: 'Contact', path: '/contact' },
          { label: 'FAQ', path: '/faq' }
        ]
      }
    };
    return (
      <ContentContext.Provider value={{ ...value, content: fallbackContent }}>
        {children}
      </ContentContext.Provider>
    );
  }

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  );
}