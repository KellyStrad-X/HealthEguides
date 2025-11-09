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
  const [editingGuide, setEditingGuide] = useState<Guide | null>(null);
  const [showGuideModal, setShowGuideModal] = useState(false);

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

  const handleSubscriptionAction = async (subscriptionId: string, action: string, confirmMessage: string) => {
    if (!confirm(confirmMessage)) {
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
          action,
        }),
      });

      if (response.ok) {
        alert(`Subscription ${action} successful`);
        fetchSubscriptions();
      } else {
        const error = await response.json();
        alert(`Failed to ${action} subscription: ${error.error}`);
      }
    } catch (error) {
    // Error log removed - TODO: Add proper error handling
      alert(`Failed to ${action} subscription`);
    }
  };

  const handleCreateGuide = () => {
    setEditingGuide(null);
    setShowGuideModal(true);
  };

  const handleEditGuide = (guide: Guide) => {
    setEditingGuide(guide);
    setShowGuideModal(true);
  };

  const handleDeleteGuide = async (guideId: string) => {
    if (!confirm('Are you sure you want to delete this guide? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetchWithAuth('/api/admin/guides', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ guideId }),
      });

      if (response.ok) {
        alert('Guide deleted successfully');
        window.location.reload();
      } else {
        const error = await response.json();
        alert(`Failed to delete guide: ${error.error}`);
      }
    } catch (error) {
      alert('Failed to delete guide');
    }
  };

  const handleSaveGuide = async (guideData: Guide) => {
    try {
      const isEditing = editingGuide !== null;
      const response = await fetchWithAuth('/api/admin/guides', {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(guideData),
      });

      if (response.ok) {
        alert(`Guide ${isEditing ? 'updated' : 'created'} successfully`);
        setShowGuideModal(false);
        setEditingGuide(null);
        window.location.reload();
      } else {
        const error = await response.json();
        alert(`Failed to save guide: ${error.error}`);
      }
    } catch (error) {
      alert('Failed to save guide');
    }
  };

  const handleUploadHTML = async (guideId: string, file: File) => {
    const formData = new FormData();
    formData.append('guideId', guideId);
    formData.append('file', file);

    try {
      const response = await fetch('/api/admin/upload-html', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-CSRF-Token': csrfToken,
        },
        body: formData,
      });

      if (response.ok) {
        alert('HTML guide uploaded successfully');
        window.location.reload();
      } else {
        const error = await response.json();
        alert(`Failed to upload HTML: ${error.error}`);
      }
    } catch (error) {
      alert('Failed to upload HTML');
    }
  };

  const handleUploadPDF = async (guideId: string, file: File) => {
    const formData = new FormData();
    formData.append('guideId', guideId);
    formData.append('file', file);

    try {
      const response = await fetch('/api/admin/upload-pdf', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-CSRF-Token': csrfToken,
        },
        body: formData,
      });

      if (response.ok) {
        alert('PDF guide uploaded successfully');
        window.location.reload();
      } else {
        const error = await response.json();
        alert(`Failed to upload PDF: ${error.error}`);
      }
    } catch (error) {
      alert('Failed to upload PDF');
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
              {activeTab === 'guides' && (
                <GuidesTab
                  guides={guides}
                  onCreate={handleCreateGuide}
                  onEdit={handleEditGuide}
                  onDelete={handleDeleteGuide}
                  onUploadHTML={handleUploadHTML}
                  onUploadPDF={handleUploadPDF}
                />
              )}
              {activeTab === 'requests' && <RequestsTab requests={guideRequests} />}
              {activeTab === 'feedback' && <FeedbackTab feedback={feedback} />}
              {activeTab === 'subscriptions' && <SubscriptionsTab subscriptions={subscriptions} onAction={handleSubscriptionAction} />}
            </>
          )}
        </div>
      </div>

      {showGuideModal && (
        <GuideModal
          guide={editingGuide}
          onClose={() => {
            setShowGuideModal(false);
            setEditingGuide(null);
          }}
          onSave={handleSaveGuide}
        />
      )}
    </div>
  );
}

function GuidesTab({
  guides,
  onCreate,
  onEdit,
  onDelete,
  onUploadHTML,
  onUploadPDF,
}: {
  guides: Guide[];
  onCreate: () => void;
  onEdit: (guide: Guide) => void;
  onDelete: (guideId: string) => void;
  onUploadHTML: (guideId: string, file: File) => void;
  onUploadPDF: (guideId: string, file: File) => void;
}) {
  const handleFileUpload = (guideId: string, type: 'html' | 'pdf') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'html' ? '.html' : '.pdf';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        if (type === 'html') {
          onUploadHTML(guideId, file);
        } else {
          onUploadPDF(guideId, file);
        }
      }
    };
    input.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Manage Guides</h2>
        <button
          onClick={onCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Create New Guide
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Files</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {guides.map((guide) => (
              <tr key={guide.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{guide.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{guide.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    guide.comingSoon
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {guide.comingSoon ? 'Coming Soon' : 'Available'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleFileUpload(guide.id, 'html')}
                      className="text-blue-600 hover:text-blue-800 text-xs"
                    >
                      {guide.hasHtmlGuide ? '✓ HTML' : '+ HTML'}
                    </button>
                    <button
                      onClick={() => handleFileUpload(guide.id, 'pdf')}
                      className="text-blue-600 hover:text-blue-800 text-xs"
                    >
                      + PDF
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(guide)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(guide.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{request.topic}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.email || 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(request.submittedAt).toLocaleDateString()}
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
              {new Date(item.submittedAt).toLocaleDateString()}
            </p>
          </div>
          <p className="text-sm font-medium text-gray-700 mb-1">{item.subject}</p>
          <p className="text-gray-700">{item.message}</p>
        </div>
      ))}
    </div>
  );
}

function SubscriptionsTab({ subscriptions, onAction }: { subscriptions: any[]; onAction: (id: string, action: string, message: string) => void }) {
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
                <div className="flex flex-col gap-1">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    sub.status === 'active' ? 'bg-green-100 text-green-800' :
                    sub.status === 'trialing' ? 'bg-blue-100 text-blue-800' :
                    sub.status === 'canceled' ? 'bg-red-100 text-red-800' :
                    sub.status === 'past_due' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {sub.status}
                  </span>
                  {sub.cancelAtPeriodEnd && (
                    <span className="text-xs text-orange-600">Cancels at period end</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${(sub.planAmount / 100).toFixed(2)}/{sub.planInterval}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex flex-col gap-1">
                  {(sub.status === 'active' || sub.status === 'trialing') && !sub.cancelAtPeriodEnd && (
                    <>
                      <button
                        onClick={() => onAction(sub.id, 'cancel', 'Cancel this subscription at the end of the billing period?')}
                        className="text-orange-600 hover:text-orange-900 text-left"
                      >
                        Cancel at period end
                      </button>
                      <button
                        onClick={() => onAction(sub.id, 'cancel_immediately', 'Cancel this subscription IMMEDIATELY? User will lose access right away.')}
                        className="text-red-600 hover:text-red-900 text-left"
                      >
                        Cancel immediately
                      </button>
                    </>
                  )}
                  {(sub.status === 'active' || sub.status === 'trialing') && sub.cancelAtPeriodEnd && (
                    <button
                      onClick={() => onAction(sub.id, 'reactivate', 'Reactivate this subscription?')}
                      className="text-green-600 hover:text-green-900 text-left"
                    >
                      Reactivate
                    </button>
                  )}
                  {sub.status === 'past_due' && (
                    <span className="text-xs text-gray-500">Payment failed - awaiting retry</span>
                  )}
                  {sub.status === 'canceled' && (
                    <span className="text-xs text-gray-500">Canceled</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GuideModal({
  guide,
  onClose,
  onSave,
}: {
  guide: Guide | null;
  onClose: () => void;
  onSave: (guide: Guide) => void;
}) {
  const [formData, setFormData] = useState<Guide>(
    guide || {
      id: '',
      title: '',
      description: '',
      emoji: '',
      gradient: '',
      features: [''],
      slug: '',
      metaDescription: '',
      keywords: [''],
      category: '',
      comingSoon: false,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  const updateKeyword = (index: number, value: string) => {
    const newKeywords = [...formData.keywords];
    newKeywords[index] = value;
    setFormData({ ...formData, keywords: newKeywords });
  };

  const addKeyword = () => {
    setFormData({ ...formData, keywords: [...formData.keywords, ''] });
  };

  const removeKeyword = (index: number) => {
    setFormData({
      ...formData,
      keywords: formData.keywords.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            {guide ? 'Edit Guide' : 'Create New Guide'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                required
                disabled={guide !== null}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Emoji
              </label>
              <input
                type="text"
                value={formData.emoji}
                onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gradient (CSS)
            </label>
            <input
              type="text"
              value={formData.gradient}
              onChange={(e) => setFormData({ ...formData, gradient: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Features
            </label>
            {formData.features.map((feature, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => updateFeature(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  placeholder="Feature description"
                />
                <button
                  type="button"
                  onClick={() => removeFeature(index)}
                  className="px-3 py-2 text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addFeature}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              + Add Feature
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SEO Keywords
            </label>
            {formData.keywords.map((keyword, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => updateKeyword(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  placeholder="keyword"
                />
                <button
                  type="button"
                  onClick={() => removeKeyword(index)}
                  className="px-3 py-2 text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addKeyword}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              + Add Keyword
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta Description
            </label>
            <textarea
              value={formData.metaDescription}
              onChange={(e) =>
                setFormData({ ...formData, metaDescription: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              rows={2}
              placeholder="SEO meta description"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="comingSoon"
              checked={formData.comingSoon || false}
              onChange={(e) =>
                setFormData({ ...formData, comingSoon: e.target.checked })
              }
              className="mr-2"
            />
            <label htmlFor="comingSoon" className="text-sm font-medium text-gray-700">
              Coming Soon (not available yet)
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {guide ? 'Update Guide' : 'Create Guide'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
