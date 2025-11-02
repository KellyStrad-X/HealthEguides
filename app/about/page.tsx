'use client';

import { HeaderProvider } from '@/lib/headerContext';
import SaleHeader from '@/components/SaleHeader';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <HeaderProvider>
      <div className="min-h-screen bg-[#0a0a0a]">
        <SaleHeader />
        <Header />

      <main className="pt-32 pb-20">
        <div className="section-container max-w-4xl">
          <h1 className="text-5xl sm:text-6xl font-bold mb-8 text-center">
            About Health E-Guides
          </h1>

          <div className="space-y-8 text-white/80 leading-relaxed">
            <div className="glass-card p-8">
              <h2 className="text-3xl font-bold mb-4 gradient-text">Our Mission</h2>
              <p className="text-lg">
                At Health E-Guides, we believe every woman deserves access to reliable,
                evidence-based health information. Our mission is to empower women with
                comprehensive, affordable digital health guides that make complex medical
                information easy to understand and apply to everyday life.
              </p>
            </div>

            <div className="glass-card p-8">
              <h2 className="text-3xl font-bold mb-4 gradient-text">What We Offer</h2>
              <p className="text-lg mb-4">
                Our guides cover a wide range of women's health topics, including hormone
                health, fertility, PCOS, perimenopause, and more. Each guide is:
              </p>
              <ul className="space-y-3 text-lg">
                <li className="flex items-start gap-3">
                  <span className="text-green-400 text-xl mt-1">✓</span>
                  <span><strong>Evidence-Based:</strong> Backed by current medical research and scientific studies</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 text-xl mt-1">✓</span>
                  <span><strong>Practical:</strong> Filled with actionable strategies you can implement today</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 text-xl mt-1">✓</span>
                  <span><strong>Accessible:</strong> Written in clear language, free from medical jargon</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 text-xl mt-1">✓</span>
                  <span><strong>Affordable:</strong> Priced to ensure everyone has access to quality health information</span>
                </li>
              </ul>
            </div>

            <div className="glass-card p-8">
              <h2 className="text-3xl font-bold mb-4 gradient-text">Why Digital Guides?</h2>
              <p className="text-lg">
                We've chosen digital formats because they offer instant access, easy searchability,
                and the ability to read on any device. Whether you're at home, at work, or on the go,
                your health information is always at your fingertips. Plus, digital guides are
                environmentally friendly and can be updated with the latest information.
              </p>
            </div>

            <div className="glass-card p-8">
              <h2 className="text-3xl font-bold mb-4 gradient-text">Our Commitment</h2>
              <p className="text-lg">
                We're committed to maintaining the highest standards of accuracy and staying
                current with the latest medical research. While our guides provide valuable
                educational information, they are not a replacement for professional medical
                advice. We always encourage you to work with your healthcare provider to make
                the best decisions for your individual health needs.
              </p>
            </div>

            <div className="text-center mt-12">
              <p className="text-xl text-white/70 italic">
                "Empowering women with knowledge for better health outcomes."
              </p>
            </div>
          </div>
        </div>
      </main>

        <Footer />
      </div>
    </HeaderProvider>
  );
}
