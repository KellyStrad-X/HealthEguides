export default function WhyChooseUs() {
  const benefits = [
    {
      emoji: "💎",
      title: "Research-Backed",
      description: "Based on current scientific research and medical literature"
    },
    {
      emoji: "💰",
      title: "Affordable",
      description: "Just $4.99 per guide - high-quality health information for everyone"
    },
    {
      emoji: "⚡",
      title: "Instant Access",
      description: "Download immediately after purchase, no waiting"
    },
    {
      emoji: "📱",
      title: "Mobile-Friendly",
      description: "Read on any device - phone, tablet, or computer"
    },
    {
      emoji: "🔒",
      title: "Privacy-First",
      description: "Your health journey is private and secure"
    },
    {
      emoji: "📚",
      title: "Comprehensive",
      description: "15+ pages of actionable advice and strategies"
    }
  ];

  return (
    <section className="py-20 bg-[#0a0a0a]">
      <div className="section-container">
        <h2 className="text-4xl sm:text-5xl font-bold text-center mb-16">
          Why Women Trust Our Guides
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="glass-card p-6 text-center hover-lift"
            >
              <div className="text-5xl mb-4">{benefit.emoji}</div>
              <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
