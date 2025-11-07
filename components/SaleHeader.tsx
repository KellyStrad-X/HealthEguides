'use client';

import { useState, useEffect } from 'react';
import { useHeader } from '@/lib/headerContext';
import { useAuth } from '@/contexts/AuthContext';

interface SaleHeaderProps {
  onClaimClick?: () => void;
}

export default function SaleHeader({ onClaimClick }: SaleHeaderProps = {}) {
  const { user } = useAuth();
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [mounted, setMounted] = useState(false);
  const { isCompressed, setIsCompressed } = useHeader();
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    // Mark as mounted to prevent hydration mismatch
    setMounted(true);

    // Calculate time until midnight
    const calculateTimeLeft = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);

      const difference = midnight.getTime() - now.getTime();

      return {
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    // Update immediately
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Only expand when at the very top (scrollY === 0)
      // Otherwise stay compressed once scrolled
      if (currentScrollY === 0) {
        setIsCompressed(false);
      } else if (currentScrollY > 50) {
        setIsCompressed(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, setIsCompressed]);

  const formatTime = (num: number) => String(num).padStart(2, '0');

  const handleClaimOffer = () => {
    if (onClaimClick) {
      onClaimClick();
    } else {
      const offerSection = document.getElementById('subscription');
      if (offerSection) {
        offerSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Hide banner for logged-in users
  if (user) {
    return null;
  }

  return (
    <div className={`sticky top-0 z-50 bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 text-white shadow-lg transition-all duration-300 ${isCompressed ? 'py-1 md:py-1' : 'py-3'}`}>
      <div className="section-container">
        <div className={`flex flex-col md:flex-row items-center justify-center transition-all duration-300 ${isCompressed ? 'gap-0 md:gap-6' : 'gap-3 md:gap-6'}`}>
          <div className={`flex items-center gap-2 ${isCompressed ? 'text-sm' : ''}`}>
            <span className={isCompressed ? 'text-lg' : 'text-2xl'}>🎉</span>
            <span className="font-bold">FREE TRIAL:</span>
            <span>7 Days Free + All Guides $5/month!</span>
          </div>

          {mounted && (
            <div className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ${isCompressed ? 'max-h-0 opacity-0 scale-95' : 'max-h-20 opacity-100 scale-100'}`}>
              <span className="text-sm font-semibold whitespace-nowrap">ENDS IN:</span>
              <div className="flex gap-2">
                <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded min-w-[40px] text-center">
                  <div className="font-bold">{formatTime(timeLeft.hours)}</div>
                  <div className="text-[10px] opacity-80">HRS</div>
                </div>
                <div className="flex items-center font-bold">:</div>
                <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded min-w-[40px] text-center">
                  <div className="font-bold">{formatTime(timeLeft.minutes)}</div>
                  <div className="text-[10px] opacity-80">MIN</div>
                </div>
                <div className="flex items-center font-bold">:</div>
                <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded min-w-[40px] text-center">
                  <div className="font-bold">{formatTime(timeLeft.seconds)}</div>
                  <div className="text-[10px] opacity-80">SEC</div>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleClaimOffer}
            className={`px-6 py-2 bg-white text-pink-600 font-bold rounded-full hover:bg-pink-50 transition-all duration-300 hover:scale-105 shadow-lg text-sm overflow-hidden ${isCompressed ? 'hidden md:block md:max-h-20 md:opacity-100' : 'max-h-20 opacity-100'}`}
          >
            Start Free Trial →
          </button>
        </div>
      </div>
    </div>
  );
}
