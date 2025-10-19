"use client";

import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import DashboardPreview from "@/components/landing/DashboardPreview";
import Problem from "@/components/landing/Problem";
import Solution from "@/components/landing/Solution";
import Footer from "@/components/landing/Footer";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";
import CTA from "@/components/landing/CTA";

export default function Home() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Domari",
    description:
      "Track income, expenses, and cash flow for your rental properties. Understand ROI, profitability, and make smarter investment decisions with clear analytics.",
    url: "https://domari.app",
    logo: "https://domari.app/domari-logo-icon.png",
    sameAs: [
      "https://www.linkedin.com/in/joaotripa/",
      "https://x.com/joaotripaa",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      email: "support@domari.app",
      contactType: "customer service",
    },
  };

  const softwareAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Domari",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web Browser",
    offers: [
      {
        "@type": "Offer",
        name: "Starter Plan",
        price: "8.99",
        priceCurrency: "EUR",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: "8.99",
          priceCurrency: "EUR",
          billingDuration: "P1M",
        },
      },
      {
        "@type": "Offer",
        name: "Pro Plan",
        price: "24.99",
        priceCurrency: "EUR",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: "24.99",
          priceCurrency: "EUR",
          billingDuration: "P1M",
        },
      },
      {
        "@type": "Offer",
        name: "Business Plan",
        price: "44.99",
        priceCurrency: "EUR",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: "44.99",
          priceCurrency: "EUR",
          billingDuration: "P1M",
        },
      },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "127",
    },
    description:
      "Track income, expenses, and cash flow for your rental properties. Understand ROI, profitability, and make smarter investment decisions with clear analytics.",
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How does the 14-day free trial work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Start using Domari immediately with full access to all Business plan features. No credit card required. After 14 days, choose a paid plan that fits your portfolio size, or your account will be automatically downgraded.",
        },
      },
      {
        "@type": "Question",
        name: "What happens if I exceed my property limit?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We'll notify you when you reach your plan's property limit. You can easily upgrade to the next tier (Starter: 10 properties, Pro: 50 properties, Business: unlimited) or remove unused properties from your account.",
        },
      },
      {
        "@type": "Question",
        name: "Can I switch plans or cancel anytime?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! Upgrade or downgrade your subscription anytime through your billing settings. Changes take effect immediately with prorated adjustments. You can cancel your subscription at any time with no penalties.",
        },
      },
      {
        "@type": "Question",
        name: "How is my financial data stored and secured?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Your data is securely stored in encrypted PostgreSQL databases with enterprise-grade security. You retain full ownership of your data. We never share your information with third parties.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            organizationSchema,
            softwareAppSchema,
            faqSchema,
          ]),
        }}
      />
      <div className="h-full w-full">
        <Navbar />
        <main className="flex flex-col">
          <Hero />
          <DashboardPreview />
          <Problem />
          <Solution />
          <Pricing />
          <FAQ />
          <CTA />
          <Footer />
        </main>
      </div>
    </>
  );
}
