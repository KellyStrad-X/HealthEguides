export default function Stats() {
  const benefits = [
    {
      title: "30-Day Guarantee",
      description: "Money back if you're not satisfied",
      emoji: "💰"
    },
    {
      title: "Instant Access",
      description: "Download immediately after purchase",
      emoji: "⚡"
    },
    {
      title: "Research-Backed",
      description: "Based on current medical literature",
      emoji: "📚"
    }
  ];

  return (
    <section className="py-16 bg-[#0a0a0a]">
      <div className="section-container">
        <div className="glass-card p-8 sm:p-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl mb-4">{benefit.emoji}</div>
                <div className="text-xl sm:text-2xl font-bold mb-2">
                  {benefit.title}
                </div>
                <div className="text-sm sm:text-base text-white/70">
                  {benefit.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
