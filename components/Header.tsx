'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-[72px] z-40 bg-[#0a0a0a]/80 backdrop-blur-lg border-b border-white/10">
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
