import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface VendorRouteProps {
  children: React.ReactNode;
}

export function VendorRoute({ children }: VendorRouteProps) {
  const { user, loading, isVendor, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user || (!isVendor && !isAdmin)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}