export default function HowItWorks() {
  const steps = [
    {
      number: "1",
      emoji: "🎉",
      title: "Start Free Trial",
      description: "Begin your 7-day free trial with full access to all guides"
    },
    {
      number: "2",
      emoji: "📚",
      title: "Access Everything",
      description: "Explore our complete library of evidence-based health guides"
    },
    {
      number: "3",
      emoji: "💪",
      title: "Take Control",
      description: "Implement strategies and track your health journey"
    }
  ];

  return (
    <section className="py-20 bg-[#0a0a0a]">
      <div className="section-container">
        <h2 className="text-4xl sm:text-5xl font-bold text-center mb-16">
          How It Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting line - hidden on mobile */}
          <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

          {steps.map((step, index) => (
            <div
              key={index}
              className="glass-card p-8 text-center hover-lift hover:scale-105 relative z-10"
            >
              <div className="text-6xl mb-4">{step.emoji}</div>
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-purple text-sm font-bold mb-4">
                {step.number}
              </div>
              <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
              <p className="text-white/70 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
