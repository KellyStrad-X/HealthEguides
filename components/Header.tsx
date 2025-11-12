'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useHeader } from '@/lib/headerContext';
import { useAuth } from '@/contexts/AuthContext';
import UserProfileButton from './UserProfileButton';
import AuthModal from './AuthModal';

export default function Header() {
  const pathname = usePathname();
  const { isCompressed } = useHeader();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0a0a0a]/80 backdrop-blur-lg border-b border-white/10 transition-all duration-300">
        <nav className="section-container py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <img
                src="/logo.png"
                alt="Health E-Guides"
                className="h-12 md:h-14 w-auto"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/"
                className={`font-medium transition-colors ${
                  pathname === '/' ? 'text-primary' : 'text-white/70 hover:text-white'
                }`}
              >
                Home
              </Link>
              <Link
                href="/catalog"
                className={`font-medium transition-colors ${
                  pathname === '/catalog' ? 'text-primary' : 'text-white/70 hover:text-white'
                }`}
              >
                Catalog
              </Link>

              {/* My Guides link - only show when logged in */}
              {user && (
                <Link
                  href="/account/guides"
                  className={`font-medium transition-colors ${
                    pathname === '/account/guides' ? 'text-primary' : 'text-white/70 hover:text-white'
                  }`}
                >
                  My Guides
                </Link>
              )}

              {/* Auth section */}
              {user ? (
                <UserProfileButton />
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  Log In
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-white hover:text-primary transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-white/10 pt-4">
              <div className="flex flex-col gap-4">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`font-medium transition-colors ${
                    pathname === '/' ? 'text-primary' : 'text-white/70 hover:text-white'
                  }`}
                >
                  Home
                </Link>
                <Link
                  href="/catalog"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`font-medium transition-colors ${
                    pathname === '/catalog' ? 'text-primary' : 'text-white/70 hover:text-white'
                  }`}
                >
                  Catalog
                </Link>

                {user && (
                  <Link
                    href="/account/guides"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`font-medium transition-colors ${
                      pathname === '/account/guides' ? 'text-primary' : 'text-white/70 hover:text-white'
                    }`}
                  >
                    My Guides
                  </Link>
                )}

                {user ? (
                  <Link
                    href="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="font-medium text-white/70 hover:text-white transition-colors"
                  >
                    My Account
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setShowAuthModal(true);
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors text-left"
                  >
                    Log In
                  </button>
                )}
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}
