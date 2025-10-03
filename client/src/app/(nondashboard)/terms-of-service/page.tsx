"use client";

import { useEffect, useState } from "react";
import { ChevronRight, List } from "lucide-react";
import Link from "next/link";

const sections = [
  { id: "agreement", title: "1. Agreement to Terms" },
  { id: "description", title: "2. Description of Service" },
  { id: "registration", title: "3. Account Registration" },
  { id: "subscription", title: "4. Subscription & Billing" },
  { id: "refund", title: "5. Refund Policy" },
  { id: "responsibilities", title: "6. User Responsibilities" },
  { id: "intellectual-property", title: "7. Intellectual Property" },
  { id: "data-ownership", title: "8. Data Ownership" },
  { id: "limitations", title: "9. Service Limitations" },
  { id: "termination", title: "10. Termination" },
  { id: "disclaimers", title: "11. Disclaimers & Liability" },
  { id: "changes", title: "12. Changes to Terms" },
  { id: "contact", title: "13. Contact Information" },
];

const TermsOfService = () => {
  const [activeSection, setActiveSection] = useState("agreement");
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
    <div className="bg-slate-50 flex-grow">
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Terms of Service
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
                      className={`w-full text-left px-4 py-2.5 rounded-lg transition-all flex items-center justify-between group ${
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
              <section id="agreement" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  1. Agreement to Terms
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing or using Domari, you agree to be bound by these
                  Terms of Service and all applicable laws and regulations. If
                  you do not agree with any part of these terms, you may not use
                  our service.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  These Terms constitute a legally binding agreement between you
                  and Domari. Please read them carefully before using our
                  platform.
                </p>
              </section>

              <section id="description" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  2. Description of Service
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Domari is a property finance management platform that enables
                  landlords and property managers to:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                  <li>Track rental properties and occupancy status</li>
                  <li>Record and categorize income and expenses</li>
                  <li>Generate financial reports and analytics</li>
                  <li>Monitor cash flow and monthly metrics</li>
                  <li>Manage property images and documentation</li>
                  <li>Export tax-ready reports</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  We reserve the right to modify, suspend, or discontinue any
                  part of the service at any time with reasonable notice to
                  users.
                </p>
              </section>

              <section id="registration" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  3. Account Registration
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  To use Domari, you must:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Be at least 18 years of age</li>
                  <li>
                    Provide accurate and complete registration information
                  </li>
                  <li>Maintain the security of your account credentials</li>
                  <li>
                    Accept responsibility for all activities under your account
                  </li>
                  <li>Notify us immediately of any unauthorized access</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  You may register using email/password or through Google OAuth.
                  You are responsible for maintaining the confidentiality of
                  your account information and for all activities that occur
                  under your account.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  We reserve the right to refuse service, terminate accounts, or
                  remove content at our sole discretion, particularly if we
                  suspect fraudulent activity or violation of these terms.
                </p>
              </section>

              <section id="subscription" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  4. Subscription & Billing
                </h2>

                <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
                  Subscription Plans
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Domari offers the following subscription plans:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
                  <li>
                    <strong>Starter:</strong> For landlords managing a small
                    portfolio
                  </li>
                  <li>
                    <strong>Pro:</strong> For growing property managers with
                    advanced needs
                  </li>
                  <li>
                    <strong>Business:</strong> For professional property
                    management operations
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
                  Trial Period
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  New users receive a 14-day free trial to explore Domari before
                  any payment is required. During the trial:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
                  <li>You have full access to Business plan features</li>
                  <li>No credit card is required to start</li>
                  <li>You may cancel anytime without charge</li>
                  <li>Trial ends automatically after 14 days</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
                  Billing
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  By subscribing to a paid plan, you agree to:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
                  <li>Pay all applicable fees for your selected plan</li>
                  <li>Authorize automatic recurring billing through Stripe</li>
                  <li>Maintain valid payment information</li>
                  <li>Pay any applicable taxes</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Subscriptions automatically renew at the end of each billing
                  period unless cancelled. You will be charged at the beginning
                  of each billing cycle.
                </p>

                <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
                  Property Limits
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Each plan includes a specific property limit. Exceeding your
                  plan's property limit requires upgrading to a higher tier. We
                  will notify you when approaching your limit.
                </p>

                <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
                  Price Changes
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to change subscription prices with 30
                  days' advance notice. Price changes will not affect your
                  current billing cycle.
                </p>
              </section>

              <section id="refund" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  5. Refund Policy
                </h2>

                <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
                  14-Day Trial Period
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  We offer a 14-day free trial that enables you to fully explore
                  Domari before making any financial commitment. This trial
                  period is designed to give you ample time to evaluate whether
                  our service meets your needs.
                </p>

                <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
                  No Refunds Policy
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Once a subscription is purchased after the trial period,{" "}
                  <strong>all purchases are non-refundable</strong>. This
                  includes:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
                  <li>Monthly subscription fees</li>
                  <li>Annual subscription fees</li>
                  <li>Plan upgrades</li>
                  <li>Partial billing periods</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  You may cancel your subscription at any time to prevent future
                  charges, but you will not receive a refund for the current
                  billing period. Your access will continue until the end of the
                  paid period.
                </p>

                <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
                  Billing Errors
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  If you believe you were charged in error, including cases of:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
                  <li>Accidental subscription renewal</li>
                  <li>Duplicate charges</li>
                  <li>Incorrect billing amounts</li>
                  <li>Technical payment processing errors</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Please contact us immediately at{" "}
                  <a
                    href="mailto:support@domari.app"
                    className="text-primary hover:underline"
                  >
                    support@domari.app
                  </a>{" "}
                  or through our{" "}
                  <a href="/contact" className="text-primary hover:underline">
                    contact form
                  </a>
                  . We will review your case and, if we determine the charge was
                  made in error, we will process a refund within 5-10 business
                  days.
                </p>

                <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
                  Cancellation
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  You can cancel your subscription at any time from your account
                  settings or by contacting support. Upon cancellation:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
                  <li>
                    You retain access until the end of your current billing
                    period
                  </li>
                  <li>No refund will be issued for the remaining time</li>
                  <li>Automatic renewal will be disabled</li>
                  <li>
                    Your data will be retained according to our data retention
                    policy
                  </li>
                </ul>
              </section>

              <section id="responsibilities" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  6. User Responsibilities
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You agree to:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Use Domari only for lawful purposes</li>
                  <li>Provide accurate property and financial information</li>
                  <li>
                    Maintain the security and confidentiality of your account
                  </li>
                  <li>Not share your account with others</li>
                  <li>
                    Not attempt to reverse engineer, decompile, or hack the
                    service
                  </li>
                  <li>
                    Not upload malicious content or attempt to disrupt the
                    service
                  </li>
                  <li>
                    Not use the service to violate any laws or regulations
                  </li>
                  <li>
                    Comply with all applicable tax and financial reporting
                    requirements
                  </li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  You are solely responsible for the accuracy of data you enter
                  into Domari. We are not responsible for any financial, tax, or
                  legal consequences resulting from inaccurate data entry.
                </p>
              </section>

              <section
                id="intellectual-property"
                className="mb-12 scroll-mt-24"
              >
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  7. Intellectual Property
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  All content, features, and functionality of Domari, including
                  but not limited to text, graphics, logos, icons, images,
                  software, and design, are the exclusive property of Domari and
                  are protected by international copyright, trademark, and other
                  intellectual property laws.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  You are granted a limited, non-exclusive, non-transferable
                  license to access and use Domari for your personal or business
                  property management needs. This license does not include any
                  right to:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                  <li>Resell or commercially exploit the service</li>
                  <li>Modify or create derivative works</li>
                  <li>Use the service to build a competitive product</li>
                  <li>Remove any copyright or proprietary notices</li>
                </ul>
              </section>

              <section id="data-ownership" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  8. Data Ownership
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  <strong>
                    You retain full ownership of all data you enter into Domari
                  </strong>
                  , including property information, financial transactions,
                  images, and reports. We do not claim any ownership rights to
                  your data.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  By using Domari, you grant us a limited license to:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                  <li>Store and process your data to provide the service</li>
                  <li>Display your data within your account</li>
                  <li>
                    Create backups for data protection and disaster recovery
                  </li>
                  <li>
                    Use anonymized, aggregated data for service improvement
                  </li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  You may export your data at any time in machine-readable
                  formats. Upon account termination, we will delete your data
                  according to our data retention policy outlined in our Privacy
                  Policy.
                </p>
              </section>

              <section id="limitations" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  9. Service Limitations
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Domari is provided as a property management tool and:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>
                    <strong>Is not financial, legal, or tax advice:</strong>{" "}
                    Always consult with qualified professionals for financial,
                    legal, or tax matters
                  </li>
                  <li>
                    <strong>Does not guarantee accuracy:</strong> You are
                    responsible for verifying all calculations and reports
                  </li>
                  <li>
                    <strong>May experience downtime:</strong> We strive for high
                    availability but cannot guarantee uninterrupted service
                  </li>
                  <li>
                    <strong>Has usage limits:</strong> Subscription plans
                    include specific property and storage limits
                  </li>
                  <li>
                    <strong>Requires internet connection:</strong> Domari is a
                    cloud-based service requiring internet access
                  </li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  We reserve the right to impose reasonable limits on service
                  usage to ensure fair access for all users and to protect
                  service performance.
                </p>
              </section>

              <section id="termination" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  10. Termination
                </h2>

                <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
                  Termination by You
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  You may terminate your account at any time through your
                  account settings. Upon termination:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
                  <li>Your subscription will be cancelled</li>
                  <li>
                    Access will continue until the end of the current billing
                    period
                  </li>
                  <li>No refunds will be issued for partial periods</li>
                  <li>
                    Your data will be retained for 30 days (soft delete) before
                    permanent deletion
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
                  Termination by Domari
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to suspend or terminate your account if:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
                  <li>You violate these Terms of Service</li>
                  <li>Your payment fails or your account becomes delinquent</li>
                  <li>You engage in fraudulent or illegal activity</li>
                  <li>You abuse or attempt to harm the service</li>
                  <li>We are required to do so by law</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  We will provide reasonable notice before termination unless
                  immediate action is required for security or legal reasons.
                </p>
              </section>

              <section id="disclaimers" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  11. Disclaimers & Liability
                </h2>

                <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
                  Service Disclaimer
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Domari is provided "as is" and "as available" without
                  warranties of any kind, either express or implied, including
                  but not limited to warranties of merchantability, fitness for
                  a particular purpose, or non-infringement.
                </p>

                <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
                  Limitation of Liability
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  To the maximum extent permitted by law, Domari and its
                  affiliates shall not be liable for:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
                  <li>
                    Any indirect, incidental, special, or consequential damages
                  </li>
                  <li>
                    Loss of profits, revenue, data, or business opportunities
                  </li>
                  <li>Financial or tax penalties resulting from service use</li>
                  <li>
                    Damages resulting from service interruptions or data loss
                  </li>
                  <li>Third-party actions or content</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Our total liability shall not exceed the amount you paid to
                  Domari in the 12 months preceding the claim.
                </p>

                <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
                  Indemnification
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  You agree to indemnify and hold Domari harmless from any
                  claims, damages, liabilities, and expenses arising from your
                  use of the service, violation of these terms, or infringement
                  of any rights of another party.
                </p>
              </section>

              <section id="changes" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  12. Changes to Terms
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to modify these Terms of Service at any
                  time. When we make material changes, we will:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                  <li>
                    Update the "Last updated" date at the top of this page
                  </li>
                  <li>
                    Send you an email notification (for significant changes)
                  </li>
                  <li>
                    Provide at least 30 days' notice for changes affecting
                    pricing or core functionality
                  </li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Your continued use of Domari after any changes indicates your
                  acceptance of the updated Terms. If you do not agree to the
                  changes, you must discontinue use of the service.
                </p>
              </section>

              <section id="contact" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  13. Contact Information
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  If you have any questions, concerns, or feedback regarding
                  these Terms of Service, please contact us:
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

export default TermsOfService;
