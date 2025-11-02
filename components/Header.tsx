'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useHeader } from '@/lib/headerContext';

export default function Header() {
  const pathname = usePathname();
  const { isCompressed } = useHeader();

  return (
    <header className={`sticky z-40 bg-[#0a0a0a]/80 backdrop-blur-lg border-b border-white/10 transition-all duration-300 ${isCompressed ? 'top-[48px]' : 'top-[72px]'}`}>
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
          </div>
        </div>
      </nav>
    </header>
  );
}
