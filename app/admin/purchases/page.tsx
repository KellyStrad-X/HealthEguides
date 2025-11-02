'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Guide {
  id: string;
  guideId: string;
  guideName: string;
  accessToken: string;
  accessCount: number;
  lastAccessedAt: string | null;
}

interface Purchase {
  sessionId: string;
  email: string;
  purchasedAt: string;
  status: string;
  amount: number;
  currency: string;
  isBundle: boolean;
  stripePaymentIntentId: string;
  refundedAt?: string;
  guides: Guide[];
}

export default function PurchasesPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [filteredPurchases, setFilteredPurchases] = useState<Purchase[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [refundingSessionId, setRefundingSessionId] = useState<string | null>(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);

  // Check if already authenticated
  useEffect(() => {
    const isAuth = sessionStorage.getItem('admin_authenticated') === 'true';
    if (!isAuth) {
      router.push('/admin');
      return;
    }
    setAuthenticated(isAuth);
    setLoading(false);
  }, [router]);

  // Fetch purchases
  useEffect(() => {
    if (authenticated) {
      fetchPurchases();
    }
  }, [authenticated]);

  // Filter purchases based on search and status
  useEffect(() => {
    let filtered = [...purchases];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        p =>
          p.email.toLowerCase().includes(query) ||
          p.guides.some(g => g.guideName.toLowerCase().includes(query)) ||
          p.sessionId.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    setFilteredPurchases(filtered);
  }, [purchases, searchQuery, statusFilter]);

  const fetchPurchases = async () => {
    try {
      const password = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || sessionStorage.getItem('admin_password');
      const response = await fetch('/api/admin/purchases', {
        headers: {
          Authorization: `Bearer ${password}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPurchases(data.purchases);
        setFilteredPurchases(data.purchases);
      } else {
        console.error('Failed to fetch purchases');
      }
    } catch (error) {
      console.error('Error fetching purchases:', error);
    }
  };

  const handleRefundClick = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setShowRefundModal(true);
  };

  const confirmRefund = async () => {
    if (!selectedPurchase) return;

    setRefundingSessionId(selectedPurchase.sessionId);
    setShowRefundModal(false);

    try {
      const password = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || sessionStorage.getItem('admin_password');
      const response = await fetch('/api/admin/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${password}`,
        },
        body: JSON.stringify({
          paymentIntentId: selectedPurchase.stripePaymentIntentId,
          reason: 'requested_by_customer',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Refund successful! Refund ID: ${data.refundId}`);
        // Refresh purchases to show updated status
        await fetchPurchases();
      } else {
        const error = await response.json();
        alert(`Refund failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Refund error:', error);
      alert('Failed to process refund. Please try again.');
    } finally {
      setRefundingSessionId(null);
      setSelectedPurchase(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      refunded: 'bg-red-100 text-red-800',
      revoked: 'bg-gray-100 text-gray-800',
    };

    const color = statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin')}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Purchase Management</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by email, guide, or session ID..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="refunded">Refunded</option>
                <option value="revoked">Revoked</option>
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
            <span>Total: {purchases.length}</span>
            <span>Showing: {filteredPurchases.length}</span>
            <span>Active: {purchases.filter(p => p.status === 'active').length}</span>
            <span>Refunded: {purchases.filter(p => p.status === 'refunded').length}</span>
          </div>
        </div>

        {/* Purchases Table */}
        {filteredPurchases.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-500">
              {searchQuery || statusFilter !== 'all'
                ? 'No purchases match your filters.'
                : 'No purchases yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPurchases.map((purchase) => (
              <div
                key={purchase.sessionId}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">{purchase.email}</h3>
                      {getStatusBadge(purchase.status)}
                      {purchase.isBundle && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                          BUNDLE
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Purchased: {formatDate(purchase.purchasedAt)}</p>
                      {purchase.refundedAt && (
                        <p className="text-red-600">Refunded: {formatDate(purchase.refundedAt)}</p>
                      )}
                      <p>Amount: {formatAmount(purchase.amount, purchase.currency)}</p>
                      <p className="text-xs text-gray-500">
                        Session: {purchase.sessionId}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://dashboard.stripe.com/payments/${purchase.stripePaymentIntentId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm font-medium"
                    >
                      View in Stripe
                    </a>
                    {purchase.status === 'active' && (
                      <button
                        onClick={() => handleRefundClick(purchase)}
                        disabled={refundingSessionId === purchase.sessionId}
                        className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {refundingSessionId === purchase.sessionId ? 'Processing...' : 'Refund'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Guides */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Guides ({purchase.guides.length})
                  </h4>
                  <div className="space-y-2">
                    {purchase.guides.map((guide) => (
                      <div
                        key={guide.id}
                        className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md text-sm"
                      >
                        <span className="text-gray-800">{guide.guideName}</span>
                        <div className="flex items-center gap-4 text-gray-600">
                          <span>Accessed: {guide.accessCount}x</span>
                          {guide.lastAccessedAt && (
                            <span className="text-xs">
                              Last: {formatDate(guide.lastAccessedAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Refund Confirmation Modal */}
      {showRefundModal && selectedPurchase && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Confirm Refund</h2>
            <div className="space-y-3 mb-6">
              <p className="text-gray-700">
                Are you sure you want to refund this purchase?
              </p>
              <div className="bg-gray-50 p-4 rounded-md space-y-2 text-sm">
                <p>
                  <span className="font-medium">Customer:</span> {selectedPurchase.email}
                </p>
                <p>
                  <span className="font-medium">Amount:</span>{' '}
                  {formatAmount(selectedPurchase.amount, selectedPurchase.currency)}
                </p>
                <p>
                  <span className="font-medium">Guides:</span>{' '}
                  {selectedPurchase.guides.map(g => g.guideName).join(', ')}
                </p>
              </div>
              <p className="text-sm text-red-600">
                This action will process a full refund via Stripe and revoke customer access to the guide(s).
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={confirmRefund}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
              >
                Yes, Refund
              </button>
              <button
                onClick={() => {
                  setShowRefundModal(false);
                  setSelectedPurchase(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
