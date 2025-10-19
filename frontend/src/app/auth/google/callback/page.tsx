'use client';

import { useUserStore } from '@/src/store/useUserStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const GoogleCallbackPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const getCurrentUser = useUserStore(state => state.getCurrentUser);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const errorParam = searchParams.get('error');
        const success = searchParams.get('success');

        if (errorParam) {
          const errorMessages: { [key: string]: string } = {
            'access_denied': 'Google authentication was cancelled',
            'no_code': 'No authorization code received from Google',
            'token_exchange_failed': 'Failed to exchange authorization code',
            'profile_fetch_failed': 'Failed to fetch user profile from Google',
            'email_not_verified': 'Google email is not verified. Please verify your email with Google first.',
            'auth_failed': 'Google authentication failed',
          };
          setError(errorMessages[errorParam] || 'Google authentication failed');
          setLoading(false);
          return;
        }

        // If backend redirected with success flag, just pull current user and go home
        if (success) {
          await getCurrentUser();
          router.replace('/');
          return;
        }

        // If Google redirected here (unexpected), forward code to backend callback
        if (code) {
          const backendBase = process.env.NEXT_PUBLIC_API_BACKEND_URL;
          if (backendBase) {
            const redirectUrl = `${backendBase}/api/auth/google/callback?code=${encodeURIComponent(code)}${state ? `&state=${encodeURIComponent(state)}` : ''}`;
            window.location.replace(redirectUrl);
            return;
          }
        }

        // Fallback: no flags present
        setError('No authorization code received from Google');
        setLoading(false);
      } catch (err) {
        console.error('Google callback error:', err);
        setError('Failed to complete Google authentication');
        setLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, router, getCurrentUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Completing Google authentication...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Failed</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default GoogleCallbackPage;
