'use client';

import { useState, useEffect } from 'react';
import { guides } from '@/lib/guides';
import type { Guide } from '@/lib/guides';

export default function AdminClient() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [csrfToken, setCsrfToken] = useState('');

  // Check if already authenticated via session
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'GET',
        credentials: 'include', // Important for cookies
      });

      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          setAuthenticated(true);
          setCsrfToken(data.csrfToken || '');
        }
      }
    } catch (err) {
    // Error log removed - TODO: Add proper error handling
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Important for cookies
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAuthenticated(true);
        setCsrfToken(data.csrfToken || '');
        setPassword(''); // Clear password from memory
      } else {
        setError(data.error || 'Invalid password');
      }
    } catch (err) {
      setError('Authentication failed');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'logout' }),
      });
    } catch (err) {
    // Error log removed - TODO: Add proper error handling
    }

    setAuthenticated(false);
    setCsrfToken('');
    setPassword('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Access</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="Enter admin password"
                required
                autoComplete="current-password"
              />
            </div>
            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminDashboard onLogout={handleLogout} csrfToken={csrfToken} />
    </div>
  );
}

function AdminDashboard({ onLogout, csrfToken }: { onLogout: () => void; csrfToken: string }) {
  const [activeTab, setActiveTab] = useState<'guides' | 'requests' | 'feedback' | 'subscriptions'>('guides');
  const [guideRequests, setGuideRequests] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'requests') {
      fetchGuideRequests();
    } else if (activeTab === 'feedback') {
      fetchFeedback();
    } else if (activeTab === 'subscriptions') {
      fetchSubscriptions();
    }
  }, [activeTab]);

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    return fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        ...options.headers,
        'X-CSRF-Token': csrfToken,
      },
    });
  };

  const fetchGuideRequests = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth('/api/guide-requests');
      if (response.ok) {
        const data = await response.json();
        setGuideRequests(data);
      }
    } catch (error) {
    // Error log removed - TODO: Add proper error handling
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth('/api/feedback?admin=true');
      if (response.ok) {
        const data = await response.json();
        // Handle both paginated and non-paginated responses
        setFeedback(data.feedback || data);
      }
    } catch (error) {
    // Error log removed - TODO: Add proper error handling
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth('/api/admin/subscriptions');
      if (response.ok) {
        const data = await response.json();
        setSubscriptions(data.subscriptions || []);
      }
    } catch (error) {
    // Error log removed - TODO: Add proper error handling
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (!confirm('Are you sure you want to cancel this subscription at the end of the billing period?')) {
      return;
    }

    try {
      const response = await fetchWithAuth('/api/admin/subscriptions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId,
          action: 'cancel',
        }),
      });

      if (response.ok) {
        alert('Subscription scheduled for cancellation');
        fetchSubscriptions();
      } else {
        const error = await response.json();
        alert(`Failed to cancel subscription: ${error.error}`);
      }
    } catch (error) {
    // Error log removed - TODO: Add proper error handling
      alert('Failed to cancel subscription');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <button
          onClick={onLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('guides')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'guides'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Guides
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'requests'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Guide Requests
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'feedback'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Feedback
            </button>
            <button
              onClick={() => setActiveTab('subscriptions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'subscriptions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Subscriptions
            </button>
          </nav>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8 text-gray-600">Loading...</div>
          ) : (
            <>
              {activeTab === 'guides' && <GuidesTab guides={guides} />}
              {activeTab === 'requests' && <RequestsTab requests={guideRequests} />}
              {activeTab === 'feedback' && <FeedbackTab feedback={feedback} />}
              {activeTab === 'subscriptions' && <SubscriptionsTab subscriptions={subscriptions} onCancel={handleCancelSubscription} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function GuidesTab({ guides }: { guides: Guide[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {guides.map((guide) => (
            <tr key={guide.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{guide.title}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{guide.id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${guide.price}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  guide.comingSoon
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {guide.comingSoon ? 'Coming Soon' : 'Available'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RequestsTab({ requests }: { requests: any[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guide Title</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {requests.map((request, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{request.guideTitle}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(request.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FeedbackTab({ feedback }: { feedback: any[] }) {
  return (
    <div className="space-y-4">
      {feedback.map((item, index) => (
        <div key={index} className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="font-medium text-gray-900">{item.name}</p>
              <p className="text-sm text-gray-500">{item.email}</p>
            </div>
            <p className="text-sm text-gray-500">
              {new Date(item.createdAt).toLocaleDateString()}
            </p>
          </div>
          <p className="text-gray-700 mt-2">{item.message}</p>
        </div>
      ))}
    </div>
  );
}

function SubscriptionsTab({ subscriptions, onCancel }: { subscriptions: any[]; onCancel: (id: string) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {subscriptions.map((sub) => (
            <tr key={sub.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sub.userName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sub.userEmail}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  sub.status === 'active' ? 'bg-green-100 text-green-800' :
                  sub.status === 'trialing' ? 'bg-blue-100 text-blue-800' :
                  sub.status === 'canceled' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {sub.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${(sub.planAmount / 100).toFixed(2)}/{sub.planInterval}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                {sub.status === 'active' && (
                  <button
                    onClick={() => onCancel(sub.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Cancel
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
