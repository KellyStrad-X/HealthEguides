'use client';

import { useState } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        const data = await response.json();
        setErrorMessage(data.error || 'Failed to send message');
        setStatus('error');
      }
    } catch (error) {
      setErrorMessage('Failed to send message. Please try again.');
      setStatus('error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-[#4ECDC4] hover:opacity-80 transition">
            Health eGuides
          </Link>
          <Link
            href="/"
            className="text-gray-600 hover:text-gray-800 transition-colors text-sm"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Get in <span className="text-gradient">Touch</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have a question, need help with your purchase, or want to request a refund? We're here to help!
          </p>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12">
          {status === 'success' ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Message Sent!</h2>
              <p className="text-gray-600 mb-6">
                Thanks for contacting us. We've received your message and will get back to you within 24 hours.
              </p>
              <button
                onClick={() => setStatus('idle')}
                className="px-6 py-3 bg-gradient-to-r from-[#4ECDC4] to-[#556FB5] text-white rounded-lg font-semibold hover:opacity-90 transition"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent text-gray-900 transition"
                  placeholder="Jane Smith"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent text-gray-900 transition"
                  placeholder="jane@example.com"
                />
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent text-gray-900 transition"
                  placeholder="How can we help?"
                />
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent text-gray-900 transition resize-none"
                  placeholder="Tell us what you need help with..."
                />
              </div>

              {/* Error Message */}
              {status === 'error' && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {errorMessage}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full px-6 py-4 bg-gradient-to-r from-[#4ECDC4] to-[#556FB5] text-white rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                {status === 'sending' ? 'Sending...' : 'Send Message'}
              </button>

              <p className="text-sm text-gray-500 text-center">
                We typically respond within 24 hours during business days
              </p>
            </form>
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-12 grid md:grid-cols-3 gap-6 text-center">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-3xl mb-3">📧</div>
            <h3 className="font-semibold text-gray-800 mb-2">Email</h3>
            <a
              href="mailto:support@healtheguides.com"
              className="text-[#4ECDC4] hover:underline text-sm"
            >
              support@healtheguides.com
            </a>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-3xl mb-3">⏱️</div>
            <h3 className="font-semibold text-gray-800 mb-2">Response Time</h3>
            <p className="text-gray-600 text-sm">Within 24 hours</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-3xl mb-3">💯</div>
            <h3 className="font-semibold text-gray-800 mb-2">Refunds</h3>
            <p className="text-gray-600 text-sm">Satisfaction guaranteed</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
