'use client';

import { useState } from 'react';
import GuideRequestForm from './GuideRequestForm';
import FeedbackForm from './FeedbackForm';

export default function GuideRequestSection() {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  return (
    <>
      <section className="py-12 sm:py-20 px-4 bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100">
        <div className="max-w-4xl mx-auto text-center">
          {/* Icon or Emoji */}
          <div className="text-5xl sm:text-6xl mb-4 sm:mb-6">💡</div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-purple-700">
            Don't See What You Need?
          </h2>

          {/* Subheading */}
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Help us create the most valuable health guides for you. Request a topic, share feedback, or suggest improvements.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <button
              onClick={() => setShowRequestModal(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
            >
              Request a Guide
            </button>

            <button
              onClick={() => setShowFeedbackModal(true)}
              className="border-2 border-purple-600 text-purple-600 px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-purple-50 transition-all"
            >
              Send Feedback
            </button>
          </div>

          {/* Social Proof / Encouragement */}
          <p className="text-xs sm:text-sm text-gray-500 mt-6 sm:mt-8">
            🌟 Your suggestions help us prioritize which guides to create next
          </p>
        </div>
      </section>

      {/* Request Modal */}
      {showRequestModal && (
        <GuideRequestForm
          isModal={true}
          onClose={() => setShowRequestModal(false)}
        />
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <FeedbackForm
          isModal={true}
          onClose={() => setShowFeedbackModal(false)}
        />
      )}
    </>
  );
}
