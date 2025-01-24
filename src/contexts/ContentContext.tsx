import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSiteContent } from '../lib/content';

interface SiteContent {
  id: string;
  type: 'menu' | 'text' | 'logo';
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

  const fetchContent = async () => {
    try {
      setLoading(true);
      const data = await getSiteContent();
      const contentMap = data.reduce((acc, item) => {
        acc[item.key] = item;
        return acc;
      }, {} as Record<string, SiteContent>);
      setContent(contentMap);
      setError(null);
    } catch (err) {
      console.error('Error fetching content:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch content'));
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

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  );
}