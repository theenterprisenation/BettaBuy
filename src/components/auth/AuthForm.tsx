import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, UserPlus, LogIn, Store } from 'lucide-react';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';

type AuthMode = 'user' | 'vendor';
type FormMode = 'signin' | 'signup';

export function AuthForm() {
  const [authMode, setAuthMode] = useState<AuthMode>('user');
  const [formMode, setFormMode] = useState<FormMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (formMode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { data: { user }, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;

        // If vendor login, check if user is actually a vendor
        if (authMode === 'vendor') {
          const { data: vendorData, error: vendorError } = await supabase
            .from('vendors')
            .select('id')
            .eq('user_id', user?.id)
            .single();

          if (vendorError || !vendorData) {
            throw new Error('Account not found. Please sign up as a vendor first.');
          }
        }
      }
      
      // Redirect based on auth mode
      if (authMode === 'vendor') {
        navigate('/vendor');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="flex justify-center space-x-4 mb-6">
            <button
              onClick={() => setAuthMode('user')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                authMode === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Mail className="inline-block w-5 h-5 mr-2" />
              User
            </button>
            <button
              onClick={() => setAuthMode('vendor')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                authMode === 'vendor'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Store className="inline-block w-5 h-5 mr-2" />
              Vendor
            </button>
          </div>

          <h2 className="text-3xl font-extrabold text-gray-900">
            {formMode === 'signup' 
              ? `Create your ${authMode} account` 
              : `Sign in to your ${authMode} account`}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {formMode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
            {authMode === 'vendor' && formMode === 'signup' ? (
              <a
                href="/vend"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Register as vendor
              </a>
            ) : (
              <button
                onClick={() => setFormMode(formMode === 'signup' ? 'signin' : 'signup')}
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                {formMode === 'signup' ? 'Sign in' : 'Sign up'}
              </button>
            )}
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-danger-50 border border-danger-200 text-danger-600 rounded-md p-4 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full flex justify-center items-center"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : formMode === 'signup' ? (
                    <>
                      <UserPlus className="w-5 h-5 mr-2" />
                      Sign Up
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5 mr-2" />
                      Sign In
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}