import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Lock, Users, Shield } from 'lucide-react';
import { Button } from '../components/ui/Button';

type LoginMode = 'admin' | 'support';

export function WorkxPage() {
  const [mode, setMode] = useState<LoginMode>('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Check if user is already logged in and has appropriate role
    const checkUserRole = async () => {
      if (user) {
        try {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role_id, roles!inner(name)')
            .eq('id', user.id)
            .single();

          if (!userError) {
            if (userData?.roles?.name === 'admin') {
              navigate('/admin-dashboard', { replace: true });
            } else if (userData?.roles?.name === 'support') {
              navigate('/support-dashboard', { replace: true });
            }
          }
        } catch (err) {
          console.error('Error checking user role:', err);
        }
      }
    };

    checkUserRole();
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) throw signInError;

      // Check user role
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role_id, roles!inner(name)')
        .eq('id', user?.id)
        .single();

      if (userError) throw userError;

      const userRole = userData?.roles?.name;

      if (mode === 'admin' && userRole !== 'admin') {
        throw new Error('Unauthorized access. Admin privileges required.');
      }

      if (mode === 'support' && userRole !== 'support') {
        throw new Error('Unauthorized access. Support privileges required.');
      }

      // Redirect based on role
      if (userRole === 'admin') {
        navigate('/admin-dashboard', { replace: true });
      } else if (userRole === 'support') {
        navigate('/support-dashboard', { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Lock className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            Restricted Access
          </h2>
        </div>

        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={() => setMode('admin')}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              mode === 'admin'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Shield className="w-5 h-5 mr-2" />
            Admin
          </button>
          <button
            onClick={() => setMode('support')}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              mode === 'support'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Users className="w-5 h-5 mr-2" />
            Support
          </button>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-danger-50 border border-danger-200 text-danger-600 rounded-md p-4 text-sm">
              {error}
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Authenticating...
              </div>
            ) : (
              `Sign in as ${mode === 'admin' ? 'Administrator' : 'Support'}`
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}