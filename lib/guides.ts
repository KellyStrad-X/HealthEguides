export interface Guide {
  id: string;
  title: string;
  description: string;
  emoji: string;
  gradient: string;
  features: string[];
  price: number;
  slug: string;
  gumroadUrl: string;
  metaDescription: string;
  keywords: string[];
  category: string;
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
    gumroadUrl: "https://example.gumroad.com/l/perimenopause", // TODO: Replace with actual URL
    metaDescription: "Complete guide to navigating perimenopause with evidence-based strategies for symptom management, treatment options, and lifestyle changes.",
    keywords: ["perimenopause", "menopause", "hormone health", "women's health", "symptom management"],
    category: "Hormone Health"
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
    gumroadUrl: "https://example.gumroad.com/l/pcos", // TODO: Replace with actual URL
    metaDescription: "Comprehensive PCOS management guide with strategies for insulin resistance, fertility, and symptom control.",
    keywords: ["PCOS", "polycystic ovary syndrome", "fertility", "insulin resistance", "women's health"],
    category: "Women's Health"
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
    gumroadUrl: "https://example.gumroad.com/l/fertility", // TODO: Replace with actual URL
    metaDescription: "Natural fertility optimization guide with evidence-based strategies for preconception health and reproductive wellness.",
    keywords: ["fertility", "preconception", "conception", "reproductive health", "pregnancy planning"],
    category: "Fertility"
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
