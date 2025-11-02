'use client';

import { HeaderProvider } from '@/lib/headerContext';
import SaleHeader from '@/components/SaleHeader';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <HeaderProvider>
      <div className="min-h-screen bg-[#0a0a0a]">
        <SaleHeader />
        <Header />

      <main className="pt-32 pb-20">
        <div className="section-container max-w-4xl">
          <h1 className="text-5xl sm:text-6xl font-bold mb-8 text-center">
            Privacy Policy
          </h1>

          <div className="text-white/60 text-center mb-12">
            <p>Last Updated: October 2025</p>
          </div>

          <div className="space-y-8 text-white/80 leading-relaxed">
            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold mb-4 text-white">1. Information We Collect</h2>
              <p className="mb-4">
                We collect information that you provide directly to us when you:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Purchase our digital guides</li>
                <li>Create an account on our website</li>
                <li>Subscribe to our newsletter or marketing communications</li>
                <li>Contact us with questions or feedback</li>
                <li>Participate in surveys or promotions</li>
              </ul>
              <p className="mt-4">
                This information may include your name, email address, payment information,
                and any other information you choose to provide.
              </p>
            </div>

            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold mb-4 text-white">2. How We Use Your Information</h2>
              <p className="mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Process and fulfill your orders</li>
                <li>Send you order confirmations and delivery information</li>
                <li>Provide customer support and respond to your inquiries</li>
                <li>Send you marketing communications (with your consent)</li>
                <li>Improve our website and services</li>
                <li>Detect and prevent fraud or abuse</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>

            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold mb-4 text-white">3. Information Sharing</h2>
              <p className="mb-4">
                We do not sell your personal information. We may share your information with:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Payment Processors:</strong> To process your transactions securely</li>
                <li><strong>Email Service Providers:</strong> To send you communications</li>
                <li><strong>Analytics Providers:</strong> To understand how our website is used</li>
                <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
              </ul>
            </div>

            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold mb-4 text-white">4. Cookies and Tracking</h2>
              <p>
                We use cookies and similar tracking technologies to collect information about
                your browsing activities. You can control cookies through your browser settings.
                Note that disabling cookies may affect your ability to use certain features of
                our website.
              </p>
            </div>

            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold mb-4 text-white">5. Data Security</h2>
              <p>
                We implement reasonable security measures to protect your personal information
                from unauthorized access, alteration, disclosure, or destruction. However, no
                method of transmission over the internet or electronic storage is 100% secure,
                and we cannot guarantee absolute security.
              </p>
            </div>

            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold mb-4 text-white">6. Your Rights</h2>
              <p className="mb-4">
                You have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your information (subject to legal obligations)</li>
                <li>Opt-out of marketing communications at any time</li>
                <li>Object to processing of your information</li>
              </ul>
            </div>

            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold mb-4 text-white">7. Third-Party Links</h2>
              <p>
                Our website may contain links to third-party websites. We are not responsible
                for the privacy practices of these websites. We encourage you to read their
                privacy policies before providing any information.
              </p>
            </div>

            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold mb-4 text-white">8. Children's Privacy</h2>
              <p>
                Our services are not directed to children under 18. We do not knowingly collect
                personal information from children. If you believe we have collected information
                from a child, please contact us immediately.
              </p>
            </div>

            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold mb-4 text-white">9. Changes to This Policy</h2>
              <p>
                We may update this privacy policy from time to time. We will notify you of any
                significant changes by posting the new policy on this page and updating the
                "Last Updated" date.
              </p>
            </div>

            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold mb-4 text-white">10. Contact Us</h2>
              <p>
                If you have questions about this privacy policy or our privacy practices,
                please contact us through our contact form or email us directly.
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
