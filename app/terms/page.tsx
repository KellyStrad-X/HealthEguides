'use client';

import { HeaderProvider } from '@/lib/headerContext';
import SaleHeader from '@/components/SaleHeader';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function TermsPage() {
  return (
    <HeaderProvider>
      <div className="min-h-screen bg-[#0a0a0a]">
        <SaleHeader />
        <Header />

      <main className="pt-32 pb-20">
        <div className="section-container max-w-4xl">
          <h1 className="text-5xl sm:text-6xl font-bold mb-8 text-center">
            Terms of Service
          </h1>

          <div className="text-white/60 text-center mb-12">
            <p>Last Updated: October 2025</p>
          </div>

          <div className="space-y-8 text-white/80 leading-relaxed">
            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold mb-4 text-white">1. Acceptance of Terms</h2>
              <p>
                By accessing or using Health E-Guides website and purchasing our digital products,
                you agree to be bound by these Terms of Service and all applicable laws and
                regulations. If you do not agree with any of these terms, you are prohibited from
                using or accessing this site.
              </p>
            </div>

            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold mb-4 text-white">2. Medical Disclaimer</h2>
              <p className="mb-4">
                <strong>IMPORTANT:</strong> Our guides provide educational information only and
                are not intended to replace professional medical advice, diagnosis, or treatment.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Always consult your healthcare provider before making any health-related decisions</li>
                <li>Never disregard professional medical advice or delay seeking it because of information in our guides</li>
                <li>If you have a medical emergency, call your doctor or emergency services immediately</li>
                <li>Individual results may vary, and we make no guarantees about specific outcomes</li>
              </ul>
            </div>

            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold mb-4 text-white">3. Digital Product Purchases</h2>
              <p className="mb-4">
                When you purchase our digital guides:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You will receive immediate access to download your purchased guide(s)</li>
                <li>All sales are final unless otherwise stated in our refund policy</li>
                <li>Products are for personal use only and may not be resold or redistributed</li>
                <li>We reserve the right to refuse service to anyone for any reason</li>
                <li>Prices are subject to change without notice</li>
              </ul>
            </div>

            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold mb-4 text-white">4. Refund Policy</h2>
              <p>
                We offer a money-back guarantee within 30 days of purchase. If you're not satisfied
                with your guide, contact us for a full refund. We may request feedback about your
                experience to help us improve our products. Refunds will be processed within 5-10
                business days.
              </p>
            </div>

            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold mb-4 text-white">5. Intellectual Property</h2>
              <p className="mb-4">
                All content, including text, graphics, logos, and images, is the property of
                Health E-Guides and is protected by copyright and intellectual property laws.
              </p>
              <p className="mb-4">You may not:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Reproduce, distribute, or publicly display our content without permission</li>
                <li>Share your purchased guides with others</li>
                <li>Use our content for commercial purposes</li>
                <li>Remove copyright or proprietary notices</li>
              </ul>
            </div>

            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold mb-4 text-white">6. User Accounts</h2>
              <p className="mb-4">
                If you create an account on our website:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You are responsible for maintaining the confidentiality of your account</li>
                <li>You must provide accurate and complete information</li>
                <li>You are responsible for all activities under your account</li>
                <li>You must notify us immediately of any unauthorized use</li>
                <li>We reserve the right to terminate accounts that violate these terms</li>
              </ul>
            </div>

            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold mb-4 text-white">7. Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by law, Health E-Guides shall not be liable for
                any indirect, incidental, special, consequential, or punitive damages resulting
                from your use or inability to use our products or services. This includes damages
                for loss of profits, data, or other intangible losses, even if we have been advised
                of the possibility of such damages.
              </p>
            </div>

            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold mb-4 text-white">8. Disclaimer of Warranties</h2>
              <p>
                Our digital guides are provided "as is" without any warranties, express or implied.
                We do not warrant that our products will meet your specific requirements or that
                they will be error-free, uninterrupted, or secure.
              </p>
            </div>

            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold mb-4 text-white">9. Third-Party Services</h2>
              <p>
                We use third-party services for payment processing, email delivery, and analytics.
                Your use of these services is subject to their respective terms and policies. We
                are not responsible for the practices of third-party service providers.
              </p>
            </div>

            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold mb-4 text-white">10. Modifications to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. Changes will be effective
                immediately upon posting to the website. Your continued use of our services after
                changes are posted constitutes acceptance of the modified terms.
              </p>
            </div>

            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold mb-4 text-white">11. Governing Law</h2>
              <p>
                These terms shall be governed by and construed in accordance with applicable laws,
                without regard to conflict of law provisions. Any disputes arising from these terms
                or your use of our services shall be resolved through binding arbitration.
              </p>
            </div>

            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold mb-4 text-white">12. Contact Information</h2>
              <p>
                If you have questions about these Terms of Service, please contact us through our
                contact form or email us directly. We aim to respond to all inquiries within 48 hours.
              </p>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mt-8">
              <p className="text-yellow-200 font-semibold mb-2">
                ⚠️ Important Notice
              </p>
              <p className="text-white/70 text-sm">
                By using our services and purchasing our products, you acknowledge that you have
                read, understood, and agree to be bound by these Terms of Service and our Privacy Policy.
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
