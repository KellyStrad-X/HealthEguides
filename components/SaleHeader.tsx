'use client';

import { useState, useEffect } from 'react';

export default function SaleHeader() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
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

  const formatTime = (num: number) => String(num).padStart(2, '0');

  const handleClaimOffer = () => {
    const offerSection = document.getElementById('bundle-offer');
    if (offerSection) {
      offerSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 text-white py-3 shadow-lg">
      <div className="section-container">
        <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <span className="font-bold text-lg">SPECIAL OFFER:</span>
            <span className="text-lg">3 E-Books for $10!</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">ENDS IN:</span>
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

          <button
            onClick={handleClaimOffer}
            className="px-6 py-2 bg-white text-pink-600 font-bold rounded-full hover:bg-pink-50 transition-all duration-300 hover:scale-105 shadow-lg text-sm"
          >
            Claim Offer →
          </button>
        </div>
      </div>
    </div>
  );
}
