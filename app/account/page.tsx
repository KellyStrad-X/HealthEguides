'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { HeaderProvider } from '@/lib/headerContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AccountPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
    // Error log removed - TODO: Add proper error handling
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <HeaderProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="[&>header]:!top-0">
          <Header />
        </div>

        <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Account</h1>
            <p className="text-gray-600">Manage your profile and subscription</p>
          </div>

          {/* Profile card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
            <div className="space-y-3">
              {user.displayName && (
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium text-gray-900">{user.displayName}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="font-medium text-gray-900">
                  {user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <button
              onClick={() => router.push('/account/subscription')}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-left hover:border-indigo-300 transition-colors group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-indigo-600">Manage Subscription</h3>
                  <p className="text-sm text-gray-600">View your subscription status and billing information</p>
                </div>
                <svg className="w-6 h-6 text-gray-400 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            <button
              onClick={() => router.push('/catalog')}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-left hover:border-indigo-300 transition-colors group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-indigo-600">Browse Guides</h3>
                  <p className="text-sm text-gray-600">Explore all available health guides</p>
                </div>
                <svg className="w-6 h-6 text-gray-400 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>

          {/* Logout button */}
          <div className="flex justify-center">
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
        </main>

        <Footer />
      </div>
    </HeaderProvider>
  );
}
