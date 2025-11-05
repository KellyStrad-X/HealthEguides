'use client';

import Link from 'next/link';
import { useState } from 'react';
import GuideRequestForm from './GuideRequestForm';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [showRequestModal, setShowRequestModal] = useState(false);

  return (
    <>
      <footer className="py-16 bg-[#0a0a0a] border-t border-white/10">
        <div className="section-container">
          <div className="text-center space-y-6">
            {/* Brand */}
            <div>
              <h3 className="text-2xl font-bold mb-2">Health E-Guides</h3>
              <p className="text-white/60 text-sm">
                Evidence-based health guides for women
              </p>
            </div>

            {/* Links */}
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link href="/about" className="text-white/70 hover:text-white transition-colors">
                About
              </Link>
              <button
                onClick={() => setShowRequestModal(true)}
                className="text-white/70 hover:text-white transition-colors"
              >
                Request a Guide
              </button>
              <Link href="/privacy" className="text-white/70 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-white/70 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/contact" className="text-white/70 hover:text-white transition-colors">
                Contact
              </Link>
            </div>

          {/* Copyright */}
          <div className="text-white/50 text-sm">
            © {currentYear} Health E-Guides. All rights reserved.
          </div>

          {/* Medical Disclaimer */}
          <div className="max-w-3xl mx-auto text-xs text-white/40 italic leading-relaxed">
            Medical Disclaimer: Our guides provide educational information only and
            are not intended to replace professional medical advice, diagnosis, or
            treatment. Always consult your healthcare provider before making any
            health-related decisions.
          </div>
        </div>
      </div>
    </footer>

    {/* Request Modal */}
    {showRequestModal && (
      <GuideRequestForm
        isModal={true}
        onClose={() => setShowRequestModal(false)}
      />
    )}
  </>
  );
}
