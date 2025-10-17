"use client";

import { useEffect, useState } from "react";
import { ChevronRight, List } from "lucide-react";
import Link from "next/link";

const sections = [
  { id: "introduction", title: "1. Introduction" },
  { id: "information-collected", title: "2. Information We Collect" },
  { id: "how-we-use", title: "3. How We Use Your Information" },
  { id: "data-storage", title: "4. Data Storage & Security" },
  { id: "third-party", title: "5. Third-Party Services" },
  { id: "your-rights", title: "6. Your Rights & Choices" },
  { id: "data-retention", title: "7. Data Retention" },
  { id: "children", title: "8. Children&apos;s Privacy" },
  { id: "changes", title: "9. Changes to This Policy" },
  { id: "contact", title: "10. Contact Us" },
];

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState("introduction");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i].id);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.offsetTop - offset;
      window.scrollTo({ top: elementPosition, behavior: "smooth" });
      setMenuOpen(false);
    }
  };

  return (
    <div className="bg-background flex-grow">
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-muted-foreground">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden fixed top-20 right-4 z-50 bg-card rounded-lg px-4 py-2 flex items-center gap-2 border border-border hover:bg-muted transition-colors"
            aria-label="Toggle menu"
          >
            <List className="w-5 h-5" />
            <span className="text-sm font-medium">Contents</span>
          </button>

          <aside
            className={`${
              menuOpen ? "translate-x-0" : "-translate-x-full"
            } lg:translate-x-0 fixed lg:sticky top-24 lg:top-24 left-0 h-[calc(100vh-8rem)] lg:h-fit w-72 bg-card rounded-r-3xl lg:rounded-3xl border border-border p-6 transition-transform duration-300 z-40 lg:z-auto overflow-y-auto`}
          >
            <nav>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Contents
              </h2>
              <ul className="space-y-1">
                {sections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full text-left px-4 py-2.5 rounded-full transition-all flex items-center justify-between group ${
                        activeSection === section.id
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <span className="text-sm">{section.title}</span>
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          activeSection === section.id
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100"
                        }`}
                      />
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {menuOpen && (
            <div
              onClick={() => setMenuOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
            />
          )}

          <main className="flex-1 bg-card rounded-3xl border border-border p-6 md:p-10">
            <div className="prose prose-slate max-w-none">
              <section id="introduction" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  1. Introduction
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Welcome to Domari. We are committed to protecting your
                  personal information and your right to privacy. This Privacy
                  Policy explains how we collect, use, disclose, and safeguard
                  your information when you use our property finance management
                  platform.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  By using Domari, you agree to the collection and use of
                  information in accordance with this policy. If you have any
                  questions or concerns about our policy or practices, please
                  contact us.
                </p>
              </section>

              <section
                id="information-collected"
                className="mb-12 scroll-mt-24"
              >
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  2. Information We Collect
                </h2>

                <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
                  Account Information
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  When you create an account, we collect:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
                  <li>Email address (required for authentication)</li>
                  <li>Name and phone number (optional)</li>
                  <li>Password (securely hashed and stored)</li>
                  <li>Profile image (if you choose to upload one)</li>
                  <li>
                    Authentication provider information (if using Google OAuth)
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
                  Property Data
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  To help you manage your properties, we collect:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
                  <li>
                    Property details (name, address, city, state, zip code,
                    country)
                  </li>
                  <li>Property type and occupancy status</li>
                  <li>
                    Financial information (purchase price, market value, rent
                    amount)
                  </li>
                  <li>Property images you upload</li>
                  <li>Tenant count and property status</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
                  Financial Data
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  To provide financial tracking and reporting, we collect:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
                  <li>Transaction amounts, dates, and descriptions</li>
                  <li>Income and expense categorization</li>
                  <li>Monthly financial metrics and cash flow data</li>
                  <li>Transaction recurrence patterns</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
                  User Preferences
                </h3>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Currency and timezone settings</li>
                  <li>Dashboard customization preferences</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
                  Subscription & Payment Data
                </h3>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Stripe customer ID and subscription ID</li>
                  <li>Subscription plan and status</li>
                  <li>Billing period and payment history</li>
                  <li>Trial period information</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
                  Usage Analytics
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  We use Umami for product analytics to understand how users
                  interact with our platform. Umami collects:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
                  <li>User interactions and feature usage patterns</li>
                  <li>Page views and navigation paths</li>
                  <li>
                    User account identifiers (email, user ID) to track
                    authenticated users
                  </li>
                  <li>Browser and device information</li>
                  <li>Session recordings and user behavior analytics</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-2">
                  Umami is GDPR and CCPA compliant. You can opt out of analytics
                  tracking by contacting us at support@domari.app.
                </p>
              </section>

              <section id="how-we-use" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  3. How We Use Your Information
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We use the information we collect to:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>
                    Provide, operate, and maintain our property management
                    platform
                  </li>
                  <li>Process your transactions and manage your properties</li>
                  <li>Generate financial reports and analytics</li>
                  <li>Manage your subscription and billing</li>
                  <li>
                    Send you service updates, security alerts, and support
                    messages
                  </li>
                  <li>
                    Respond to your comments, questions, and customer service
                    requests
                  </li>
                  <li>Improve our services and develop new features</li>
                  <li>Monitor usage patterns to optimize performance</li>
                  <li>Protect against fraudulent or illegal activity</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section id="data-storage" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  4. Data Storage & Security
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We implement industry-standard security measures to protect
                  your data:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>All data is encrypted in transit using SSL/TLS</li>
                  <li>Passwords are securely hashed using bcrypt</li>
                  <li>Database access is restricted and monitored</li>
                  <li>Regular security audits and updates</li>
                  <li>Secure authentication with NextAuth.js</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Your data is stored on secure servers provided by Supabase
                  (PostgreSQL database) with AWS S3 for file storage. These
                  providers maintain SOC 2 Type II compliance and implement
                  robust security measures.
                </p>
              </section>

              <section id="third-party" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  5. Third-Party Services
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We use the following third-party services to operate Domari:
                </p>

                <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
                  Supabase
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Database hosting and file storage. View their privacy policy
                  at{" "}
                  <a
                    href="https://supabase.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    supabase.com/privacy
                  </a>
                </p>

                <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
                  AWS S3
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Property image storage through Supabase integration. View AWS
                  privacy policy at{" "}
                  <a
                    href="https://aws.amazon.com/privacy/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    aws.amazon.com/privacy
                  </a>
                </p>

                <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
                  Stripe
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Payment processing and subscription management. We do not
                  store credit card information. View Stripe&apos;s privacy
                  policy at{" "}
                  <a
                    href="https://stripe.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    stripe.com/privacy
                  </a>
                </p>

                <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
                  Google OAuth
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Optional authentication provider. View Google&apos;s privacy
                  policy at{" "}
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    policies.google.com/privacy
                  </a>
                </p>

                <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
                  Umami
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Product analytics and user behavior tracking to improve our
                  services. Collects user identifiers, feature usage, and
                  behavioral data. Privacy policy:{" "}
                  <a
                    href="https://umami.is/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    umami.is/privacy
                  </a>
                </p>
              </section>

              <section id="your-rights" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  6. Your Rights & Choices
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You have the following rights regarding your personal
                  information:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>
                    <strong>Access:</strong> Request a copy of the personal data
                    we hold about you
                  </li>
                  <li>
                    <strong>Correction:</strong> Update or correct inaccurate
                    information through your account settings
                  </li>
                  <li>
                    <strong>Deletion:</strong> Request deletion of your account
                    and associated data
                  </li>
                  <li>
                    <strong>Export:</strong> Download your property and
                    transaction data
                  </li>
                  <li>
                    <strong>Objection:</strong> Object to processing of your
                    personal information
                  </li>
                  <li>
                    <strong>Portability:</strong> Receive your data in a
                    machine-readable format
                  </li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  To exercise these rights, please contact us through the
                  contact information provided below. We will respond to your
                  request within 30 days.
                </p>
              </section>

              <section id="data-retention" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  7. Data Retention
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We retain your personal information for as long as necessary
                  to:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Provide our services to you</li>
                  <li>
                    Comply with legal obligations (e.g., tax and accounting
                    requirements)
                  </li>
                  <li>Resolve disputes and enforce our agreements</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  When you delete your account, we use soft deletion to maintain
                  data integrity for 30 days before permanent deletion. You can
                  request immediate permanent deletion by contacting us.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Financial records may be retained longer to comply with legal
                  and tax requirements.
                </p>
              </section>

              <section id="children" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  8. Children&apos;s Privacy
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Domari is not intended for use by individuals under the age of
                  18. We do not knowingly collect personal information from
                  children under 18. If you become aware that a child has
                  provided us with personal information, please contact us, and
                  we will take steps to delete such information.
                </p>
              </section>

              <section id="changes" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  9. Changes to This Policy
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may update this Privacy Policy from time to time to reflect
                  changes in our practices or for legal, operational, or
                  regulatory reasons. We will notify you of any material changes
                  by:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                  <li>
                    Posting the updated policy on this page with a new
                    &quot;Last updated&quot; date
                  </li>
                  <li>
                    Sending you an email notification (for significant changes)
                  </li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Your continued use of Domari after any changes indicates your
                  acceptance of the updated Privacy Policy.
                </p>
              </section>

              <section id="contact" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  10. Contact Us
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  If you have any questions, concerns, or requests regarding
                  this Privacy Policy or our data practices, please contact us:
                </p>
                <p className="text-muted-foreground">
                  <span className="text-muted-foreground">Email:</span>{" "}
                  <Link
                    href="mailto:support@domari.app"
                    className="text-primary hover:underline"
                  >
                    support@domari.app
                  </Link>
                </p>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
