'use client';

import { useState, useEffect } from 'react';
import { guides } from '@/lib/guides';
import type { Guide } from '@/lib/guides';

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Check if already authenticated
  useEffect(() => {
    const isAuth = sessionStorage.getItem('admin_authenticated') === 'true';
    setAuthenticated(isAuth);
    setLoading(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        sessionStorage.setItem('admin_authenticated', 'true');
        sessionStorage.setItem('admin_password', password);
        setAuthenticated(true);
      } else {
        setError('Invalid password');
      }
    } catch (err) {
      setError('Authentication failed');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_authenticated');
    sessionStorage.removeItem('admin_password');
    setAuthenticated(false);
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
      <AdminDashboard onLogout={handleLogout} />
    </div>
  );
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<'guides' | 'requests' | 'feedback'>('guides');
  const [guidesList, setGuidesList] = useState<Guide[]>([]);
  const [guideRequests, setGuideRequests] = useState<any[]>([]);
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [editingGuide, setEditingGuide] = useState<Guide | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [uploadingHtml, setUploadingHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyingToFeedback, setReplyingToFeedback] = useState<any | null>(null);

  // Fetch data based on active tab
  useEffect(() => {
    if (activeTab === 'guides') {
      fetchGuides();
    } else if (activeTab === 'requests') {
      fetchGuideRequests();
    } else if (activeTab === 'feedback') {
      fetchFeedback();
    }
  }, [activeTab]);

  const fetchGuides = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/guides');
      if (response.ok) {
        const data = await response.json();
        setGuidesList(data);
      } else {
        // Fallback to hardcoded guides if API fails
        setGuidesList(guides);
      }
    } catch (error) {
      console.error('Failed to fetch guides:', error);
      setGuidesList(guides);
    } finally {
      setLoading(false);
    }
  };

  const fetchGuideRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/guide-requests');
      if (response.ok) {
        const data = await response.json();
        setGuideRequests(data);
      }
    } catch (error) {
      console.error('Failed to fetch guide requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/feedback');
      if (response.ok) {
        const data = await response.json();
        setFeedbackList(data);
      }
    } catch (error) {
      console.error('Failed to fetch feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGuide = async (guideId: string) => {
    if (!confirm('Are you sure you want to delete this guide?')) return;

    try {
      const response = await fetch('/api/admin/guides', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guideId }),
      });

      if (response.ok) {
        setGuidesList(guidesList.filter(g => g.id !== guideId));
      } else {
        alert('Failed to delete guide');
      }
    } catch (err) {
      alert('Error deleting guide');
    }
  };

  const handleUploadHtml = async (guideId: string, file: File) => {
    setUploadingHtml(guideId);
    const formData = new FormData();
    formData.append('html', file);
    formData.append('guideId', guideId);

    try {
      const response = await fetch('/api/admin/upload-html', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('HTML guide uploaded successfully!');
        // Refresh the guides list to show updated hasHtmlGuide status
        await fetchGuides();
      } else {
        const error = await response.json();
        alert('Failed to upload HTML guide: ' + (error.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Error uploading HTML guide');
    } finally {
      setUploadingHtml(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <button
            onClick={onLogout}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('guides')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'guides'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Manage Guides ({guidesList.length})
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'requests'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Guide Requests ({guideRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'feedback'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Feedback ({feedbackList.length})
            </button>
          </nav>
        </div>

        {/* Manage Guides Tab Content */}
        {activeTab === 'guides' && (
          <>
            {/* Actions */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">Manage Guides</h2>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                + Create New Guide
              </button>
            </div>

        {/* Create/Edit Form */}
        {(showCreateForm || editingGuide) && (
          <GuideForm
            guide={editingGuide}
            onClose={() => {
              setShowCreateForm(false);
              setEditingGuide(null);
            }}
            onSave={(guide) => {
              if (editingGuide) {
                setGuidesList(guidesList.map(g => g.id === guide.id ? guide : g));
              } else {
                setGuidesList([...guidesList, guide]);
              }
              setShowCreateForm(false);
              setEditingGuide(null);
            }}
          />
        )}

        {/* Guides List */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mb-4"></div>
            <p>Loading guides...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
          {guidesList.map((guide) => {
            // Defensive guard for missing data
            const safePrice = typeof guide.price === 'number' && !isNaN(guide.price) ? guide.price : 0;

            return (
            <div key={guide.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{guide.emoji}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{guide.title}</h3>
                      <p className="text-sm text-gray-500">{guide.category} • ${safePrice.toFixed(2)}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{guide.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Slug: /{guide.slug}</span>
                    <span>ID: {guide.id}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".html,.htm"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadHtml(guide.id, file);
                      }}
                      disabled={uploadingHtml === guide.id}
                    />
                    <span className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium">
                      {uploadingHtml === guide.id ? 'Uploading...' : 'Upload HTML'}
                    </span>
                  </label>
                  <button
                    onClick={() => setEditingGuide(guide)}
                    className="px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteGuide(guide.id)}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
            );
          })}
          </div>
        )}

        {!loading && guidesList.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No guides yet. Create your first guide to get started!
          </div>
        )}
          </>
        )}

        {/* Guide Requests Tab Content */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : guideRequests.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No guide requests yet.</div>
            ) : (
              guideRequests.map((request: any) => (
                <div key={request.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{request.topic}</h3>
                      {request.description && (
                        <p className="text-gray-600 text-sm mb-3">{request.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {request.email && <span>Email: {request.email}</span>}
                        <span>Submitted: {new Date(request.submittedAt).toLocaleDateString()}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          request.status === 'new' ? 'bg-blue-100 text-blue-800' :
                          request.status === 'reviewed' ? 'bg-yellow-100 text-yellow-800' :
                          request.status === 'planned' ? 'bg-purple-100 text-purple-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={request.status}
                        onChange={async (e) => {
                          const newStatus = e.target.value;
                          const response = await fetch('/api/guide-requests', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: request.id, status: newStatus }),
                          });
                          if (response.ok) {
                            fetchGuideRequests();
                          }
                        }}
                        className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-900"
                      >
                        <option value="new">New</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="planned">Planned</option>
                        <option value="completed">Completed</option>
                      </select>
                      <button
                        onClick={async () => {
                          if (confirm('Delete this request?')) {
                            const response = await fetch('/api/guide-requests', {
                              method: 'DELETE',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ id: request.id }),
                            });
                            if (response.ok) {
                              fetchGuideRequests();
                            }
                          }
                        }}
                        className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Feedback Tab Content */}
        {activeTab === 'feedback' && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : feedbackList.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No feedback yet.</div>
            ) : (
              feedbackList.map((feedback: any) => (
                <div key={feedback.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">{feedback.subject}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          feedback.status === 'new' ? 'bg-blue-100 text-blue-800' :
                          feedback.status === 'reviewed' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {feedback.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mb-3">
                        From: <span className="font-medium">{feedback.name}</span> ({feedback.email})
                      </div>
                      <p className="text-gray-700 text-sm mb-3 whitespace-pre-wrap">{feedback.message}</p>
                      <div className="text-xs text-gray-400">
                        Submitted: {new Date(feedback.submittedAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={feedback.status}
                        onChange={async (e) => {
                          const newStatus = e.target.value;
                          const response = await fetch('/api/feedback', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: feedback.id, status: newStatus }),
                          });
                          if (response.ok) {
                            fetchFeedback();
                          }
                        }}
                        className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-900"
                      >
                        <option value="new">New</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="responded">Responded</option>
                      </select>
                      <button
                        onClick={() => setReplyingToFeedback(feedback)}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Reply
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm('Delete this feedback?')) {
                            const response = await fetch('/api/feedback', {
                              method: 'DELETE',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ id: feedback.id }),
                            });
                            if (response.ok) {
                              fetchFeedback();
                            }
                          }
                        }}
                        className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {replyingToFeedback && (
        <ReplyModal
          feedback={replyingToFeedback}
          onClose={() => setReplyingToFeedback(null)}
          onSuccess={() => {
            setReplyingToFeedback(null);
            fetchFeedback();
          }}
        />
      )}
    </div>
  );
}

function GuideForm({
  guide,
  onClose,
  onSave
}: {
  guide: Guide | null;
  onClose: () => void;
  onSave: (guide: Guide) => void;
}) {
  const [formData, setFormData] = useState<Partial<Guide>>(
    guide || {
      id: '',
      title: '',
      description: '',
      emoji: '📚',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      features: [],
      price: 4.99,
      slug: '',
      metaDescription: '',
      keywords: [],
      category: 'Health',
      comingSoon: true
    }
  );
  const [featureInput, setFeatureInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/admin/guides', {
        method: guide ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const savedGuide = await response.json();
        onSave(savedGuide);
      } else {
        alert('Failed to save guide');
      }
    } catch (err) {
      alert('Error saving guide');
    }
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setFormData({
        ...formData,
        features: [...(formData.features || []), featureInput.trim()]
      });
      setFeatureInput('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features?.filter((_, i) => i !== index) || []
    });
  };

  const addKeyword = () => {
    if (keywordInput.trim()) {
      setFormData({
        ...formData,
        keywords: [...(formData.keywords || []), keywordInput.trim()]
      });
      setKeywordInput('');
    }
  };

  const removeKeyword = (index: number) => {
    setFormData({
      ...formData,
      keywords: formData.keywords?.filter((_, i) => i !== index) || []
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">
            {guide ? 'Edit Guide' : 'Create New Guide'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID (unique identifier)
              </label>
              <input
                type="text"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                required
                disabled={!!guide}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug (URL path)
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Emoji
              </label>
              <input
                type="text"
                value={formData.emoji}
                onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                required
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                required
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Features
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="Add a feature"
              />
              <button
                type="button"
                onClick={addFeature}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            <div className="space-y-1">
              {formData.features?.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-md">
                  <span className="flex-1 text-sm text-gray-700">{feature}</span>
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta Description
            </label>
            <textarea
              value={formData.metaDescription}
              onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Keywords
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="Add a keyword"
              />
              <button
                type="button"
                onClick={addKeyword}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.keywords?.map((keyword, index) => (
                <div key={index} className="flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-full text-sm">
                  <span className="text-gray-700">{keyword}</span>
                  <button
                    type="button"
                    onClick={() => removeKeyword(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              {guide ? 'Update Guide' : 'Create Guide'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ReplyModal({
  feedback,
  onClose,
  onSuccess
}: {
  feedback: any;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [replyMessage, setReplyMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!replyMessage.trim()) {
      setError('Please enter a reply message');
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch('/api/feedback/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedbackId: feedback.id,
          replyMessage: replyMessage.trim(),
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to send reply');
      }
    } catch (err) {
      setError('Error sending reply. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Reply to Feedback</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
            disabled={isSending}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Original Feedback */}
          <div className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Original Feedback:</h3>
            <div className="space-y-2 text-sm">
              <p className="text-gray-600">
                <strong>From:</strong> {feedback.name} ({feedback.email})
              </p>
              <p className="text-gray-600">
                <strong>Subject:</strong> {feedback.subject}
              </p>
              <p className="text-gray-600">
                <strong>Date:</strong> {new Date(feedback.submittedAt).toLocaleString()}
              </p>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-gray-800 whitespace-pre-wrap">{feedback.message}</p>
              </div>
            </div>
          </div>

          {/* Reply Message */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Reply
            </label>
            <textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 resize-none"
              rows={8}
              placeholder="Type your reply here..."
              required
              disabled={isSending}
            />
            <p className="text-xs text-gray-500 mt-2">
              This will be sent to {feedback.email} from support@healtheguides.com via SendGrid
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isSending}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {isSending ? 'Sending...' : 'Send Reply'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSending}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
