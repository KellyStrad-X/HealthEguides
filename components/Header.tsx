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

  return (
    <>
      <header className={`sticky z-40 bg-[#0a0a0a]/80 backdrop-blur-lg border-b border-white/10 transition-all duration-300 ${isCompressed ? 'top-[36px] md:top-[42px]' : 'top-[72px]'}`}>
        <nav className="section-container py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold gradient-text">
              Health E-Guides
            </Link>

            <div className="flex items-center gap-6">
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
          </div>
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
