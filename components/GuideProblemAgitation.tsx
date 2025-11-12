import { Guide } from '@/lib/guides';

interface GuideProblemAgitationProps {
  guide: Guide;
}

export default function GuideProblemAgitation({ guide }: GuideProblemAgitationProps) {
  // Content would be customized per guide - this is a template
  const getProblems = (slug: string) => {
    const problemMap: Record<string, string[]> = {
      'perimenopause': [
        'Struggling with unpredictable hot flashes that disrupt your day?',
        'Losing sleep due to night sweats and insomnia?',
        'Feeling anxious, irritable, or not like yourself?',
        'Confused about treatment options and what really works?'
      ],
      'pcos': [
        'Dealing with irregular periods and hormonal imbalances?',
        'Struggling with weight gain despite your best efforts?',
        'Concerned about fertility and future health complications?',
        'Overwhelmed by conflicting information about PCOS management?'
      ],
      'fertility': [
        'Trying to conceive but feeling lost about where to start?',
        'Worried about your fertility and biological clock?',
        'Confused about the best lifestyle changes for conception?',
        'Want to optimize your chances naturally before medical intervention?'
      ]
    };

    return problemMap[slug] || [
      'Searching for evidence-based health information?',
      'Tired of conflicting advice from the internet?',
      'Want reliable information in an affordable format?',
      'Ready to take control of your health journey?'
    ];
  };

  const problems = getProblems(guide.slug);

  return (
    <section className="py-12 sm:py-20 bg-[#0a0a0a]">
      <div className="section-container">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-center mb-8 sm:mb-12">
            Does This Sound Familiar?
          </h2>

          <div className="space-y-3 sm:space-y-4">
            {problems.map((problem, index) => (
              <div
                key={index}
                className="glass-card p-4 sm:p-6 flex items-start gap-3 sm:gap-4 hover-lift"
              >
                <span className="text-xl sm:text-2xl flex-shrink-0">❌</span>
                <p className="text-base sm:text-lg text-white/80">{problem}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 sm:mt-12 text-center">
            <p className="text-base sm:text-xl text-white/70 mb-4 sm:mb-6">
              You&apos;re not alone. Thousands of women face these challenges every day.
            </p>
            <p className="text-xl sm:text-2xl font-semibold gradient-text">
              But it doesn&apos;t have to be this way.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
