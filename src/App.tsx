import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Hero } from './components/home/Hero';
import { YoutubeExplainer } from './components/home/YoutubeExplainer';
import { AuthForm } from './components/auth/AuthForm';
import { AuthCallback } from './components/auth/AuthCallback';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { BulkOrderPage } from './pages/BulkOrderPage';
import { VendorDashboard } from './pages/VendorDashboard';
import { UserDashboard } from './pages/UserDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { SupportDashboard } from './pages/SupportDashboard';
import { ContactPage } from './pages/ContactPage';
import { FAQPage } from './pages/FAQPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { VendorOnboardingPage } from './pages/VendorOnboardingPage';
import { VendorTermsPage } from './pages/VendorTermsPage';
import { WorkxPage } from './pages/WorkxPage';
import { PrivateRoute } from './components/auth/PrivateRoute';
import { AdminRoute } from './components/auth/AdminRoute';
import { VendorRoute } from './components/auth/VendorRoute';
import { SupportRoute } from './components/auth/SupportRoute';
import { useContent } from './contexts/ContentContext';
import { Button } from './components/ui/Button';

const Layout = ({ children }: { children: React.ReactNode }) => (
  <>
    <Navbar />
    <main className="flex-grow">{children}</main>
    <Footer />
  </>
);

export default function App() {
  const { loading } = useContent();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Routes>
        {/* Hidden admin/support routes - no layout */}
        <Route path="/worx" element={<WorkxPage />} />
        <Route path="/admin" element={<Navigate to="/worx" replace />} />
        
        {/* Routes with layout */}
        <Route path="/" element={<Layout><Hero /><YoutubeExplainer /></Layout>} />
        <Route path="/auth" element={<Layout><AuthForm /></Layout>} />
        <Route path="/auth/callback" element={<Layout><AuthCallback /></Layout>} />
        <Route path="/products" element={<Layout><ProductsPage /></Layout>} />
        <Route path="/products/:id" element={<Layout><ProductDetailPage /></Layout>} />
        <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
        <Route path="/faq" element={<Layout><FAQPage /></Layout>} />
        <Route path="/privacy" element={<Layout><PrivacyPage /></Layout>} />
        <Route path="/terms" element={<Layout><TermsPage /></Layout>} />
        <Route path="/vend" element={<Layout><VendorOnboardingPage /></Layout>} />
        <Route path="/vendor-terms" element={<Layout><VendorTermsPage /></Layout>} />

        {/* Protected routes with layout */}
        <Route path="/checkout" element={<Layout><PrivateRoute><CheckoutPage /></PrivateRoute></Layout>} />
        <Route path="/bulk-order" element={<Layout><PrivateRoute><BulkOrderPage /></PrivateRoute></Layout>} />
        <Route path="/dashboard" element={<Layout><PrivateRoute><UserDashboard /></PrivateRoute></Layout>} />
        <Route path="/vendor" element={<Layout><VendorRoute><VendorDashboard /></VendorRoute></Layout>} />
        <Route path="/admin-dashboard" element={<Layout><AdminRoute><AdminDashboard /></AdminRoute></Layout>} />
        <Route path="/support-dashboard" element={<Layout><SupportRoute><SupportDashboard /></SupportRoute></Layout>} />

        {/* 404 catch-all route */}
        <Route path="*" element={
          <Layout>
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404 - Page Not Found</h1>
                <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
                <Button onClick={() => window.location.href = '/'}>
                  Return Home
                </Button>
              </div>
            </div>
          </Layout>
        } />
      </Routes>
    </div>
  );
}