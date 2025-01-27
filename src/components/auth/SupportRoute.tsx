import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface SupportRouteProps {
  children: React.ReactNode;
}

export function SupportRoute({ children }: SupportRouteProps) {
  const { user, loading, isSupport } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user || !isSupport) {
    return <Navigate to="/worx" replace />;
  }

  return <>{children}</>;
}