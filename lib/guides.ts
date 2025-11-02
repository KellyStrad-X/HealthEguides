export interface Guide {
  id: string;
  title: string;
  description: string;
  emoji: string;
  gradient: string;
  features: string[];
  price: number;
  slug: string;
  metaDescription: string;
  keywords: string[];
  category: string;
  comingSoon?: boolean;
  hasHtmlGuide?: boolean;
  htmlUrl?: string;
}

export const guides: Guide[] = [
  {
    id: "perimenopause-playbook",
    title: "The Perimenopause Playbook",
    description: "Navigate perimenopause with confidence. Evidence-based strategies for managing symptoms and thriving during this transition.",
    emoji: "🌸",
    gradient: "linear-gradient(135deg, #4ECDC4 0%, #556FB5 100%)",
    features: [
      "Complete symptom management guide",
      "Evidence-based treatment options",
      "Lifestyle & nutrition strategies",
      "Sleep optimization techniques"
    ],
    price: 4.99,
    slug: "perimenopause",
    metaDescription: "Complete guide to navigating perimenopause with evidence-based strategies for symptom management, treatment options, and lifestyle changes.",
    keywords: ["perimenopause", "menopause", "hormone health", "women's health", "symptom management"],
    category: "Hormone Health",
    comingSoon: true
  },
  {
    id: "pcos-guide",
    title: "PCOS Management Guide",
    description: "Take control of PCOS with comprehensive strategies for managing symptoms, optimizing fertility, and improving overall health.",
    emoji: "💜",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    features: [
      "Insulin resistance management",
      "Fertility optimization strategies",
      "Evidence-based supplement guide",
      "Exercise & nutrition protocols"
    ],
    price: 4.99,
    slug: "pcos",
    metaDescription: "Comprehensive PCOS management guide with strategies for insulin resistance, fertility, and symptom control.",
    keywords: ["PCOS", "polycystic ovary syndrome", "fertility", "insulin resistance", "women's health"],
    category: "Women's Health",
    comingSoon: true
  },
  {
    id: "fertility-boost",
    title: "Natural Fertility Boost",
    description: "Optimize your fertility naturally with evidence-based strategies for preconception health and reproductive wellness.",
    emoji: "🌱",
    gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    features: [
      "Cycle tracking & optimization",
      "Preconception nutrition guide",
      "Lifestyle factors for fertility",
      "Partner health strategies"
    ],
    price: 4.99,
    slug: "fertility",
    metaDescription: "Natural fertility optimization guide with evidence-based strategies for preconception health and reproductive wellness.",
    keywords: ["fertility", "preconception", "conception", "reproductive health", "pregnancy planning"],
    category: "Fertility",
    comingSoon: true
  },
  {
    id: "stress-cortisol",
    title: "Stress & Cortisol Management",
    description: "Learn to balance cortisol and reduce stress for better health and energy.",
    emoji: "🧘‍♀️",
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    features: [
      "Cortisol regulation strategies",
      "Stress reduction techniques",
      "Sleep & recovery protocols",
      "Mindfulness practices"
    ],
    price: 4.99,
    slug: "stress-cortisol",
    metaDescription: "Comprehensive guide to managing stress and balancing cortisol levels for optimal health.",
    keywords: ["stress management", "cortisol", "adrenal health", "wellness", "mental health"],
    category: "Wellness",
    comingSoon: true
  },
  {
    id: "sleep-optimization",
    title: "Sleep Optimization Guide",
    description: "Evidence-based strategies for deep, restorative sleep every night.",
    emoji: "😴",
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    features: [
      "Sleep hygiene protocols",
      "Circadian rhythm optimization",
      "Natural sleep supplements",
      "Environmental factors"
    ],
    price: 4.99,
    slug: "sleep-optimization",
    metaDescription: "Science-backed strategies for improving sleep quality and achieving restorative rest.",
    keywords: ["sleep", "insomnia", "sleep quality", "wellness", "rest"],
    category: "Wellness",
    comingSoon: true
  },
  {
    id: "gut-health",
    title: "Gut Health Revolution",
    description: "Heal your gut and transform your overall health with proven protocols.",
    emoji: "🌿",
    gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    features: [
      "Microbiome optimization",
      "Elimination diet protocols",
      "Digestive health strategies",
      "Supplement recommendations"
    ],
    price: 4.99,
    slug: "gut-health",
    metaDescription: "Complete guide to healing your gut and optimizing digestive health naturally.",
    keywords: ["gut health", "microbiome", "digestive health", "IBS", "wellness"],
    category: "Digestive Health",
    comingSoon: true
  },
  {
    id: "energy-vitality",
    title: "Energy & Vitality Boost",
    description: "Combat fatigue and reclaim your energy with natural solutions.",
    emoji: "⚡",
    gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    features: [
      "Energy-boosting nutrition",
      "Fatigue root cause analysis",
      "Exercise optimization",
      "Supplement protocols"
    ],
    price: 4.99,
    slug: "energy-vitality",
    metaDescription: "Natural strategies to overcome fatigue and boost your energy levels sustainably.",
    keywords: ["energy", "fatigue", "vitality", "wellness", "adrenal fatigue"],
    category: "Wellness",
    comingSoon: true
  },
  {
    id: "retinol-guide",
    title: "Retinol Guide: Anti-Aging Essentials",
    description: "Master retinol for youthful, radiant skin. Evidence-based protocols for beginners to advanced users.",
    emoji: "✨",
    gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
    features: [
      "Step-by-step retinol introduction",
      "Product recommendations by strength",
      "Side effect management strategies",
      "Complete anti-aging protocol"
    ],
    price: 4.99,
    slug: "retinol-guide",
    metaDescription: "Complete retinol guide for anti-aging with evidence-based protocols, product recommendations, and side effect management.",
    keywords: ["retinol", "anti-aging", "skincare", "skin health", "retinoids"],
    category: "Skincare",
    comingSoon: true
  }
];

export function getGuideBySlug(slug: string): Guide | undefined {
  return guides.find(guide => guide.slug === slug);
}

export function getAllGuideSlugs(): string[] {
  return guides.map(guide => guide.slug);
}

export function getAllCategories(): string[] {
  const categories = guides.map(guide => guide.category);
  return Array.from(new Set(categories)).sort();
}
