import { Guide } from '@/lib/guides';

interface GuideBenefitsProps {
  guide: Guide;
}

export default function GuideBenefits({ guide }: GuideBenefitsProps) {
  // Defensive guard for missing data
  const safeFeatures = Array.isArray(guide.features) ? guide.features : [];

  return (
    <section className="py-20 bg-gradient-to-b from-[#0a0a0a] to-[#1a1a2e]">
      <div className="section-container">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-center mb-6">
            What You&apos;ll Get Inside
          </h2>

          <p className="text-xl text-white/70 text-center mb-12">
            Everything you need to take control of your health journey
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {safeFeatures.map((feature, index) => (
              <div
                key={index}
                className="glass-card p-6 flex items-start gap-4 hover-lift"
              >
                <span className="text-2xl flex-shrink-0">✨</span>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{feature}</h3>
                  <p className="text-white/60 text-sm">
                    Evidence-based strategies you can implement immediately
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Additional benefits */}
          <div className="glass-card p-8 text-center">
            <h3 className="text-2xl font-bold mb-6">Plus, You&apos;ll Also Get:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <div className="text-4xl mb-2">📋</div>
                <p className="text-sm text-white/70">Actionable checklists</p>
              </div>
              <div>
                <div className="text-4xl mb-2">📊</div>
                <p className="text-sm text-white/70">Tracking templates</p>
              </div>
              <div>
                <div className="text-4xl mb-2">💡</div>
                <p className="text-sm text-white/70">Expert insights</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
