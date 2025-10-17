"use client";

import { useEffect, useRef } from "react";
import { PricingCards } from "@/components/pricing/PricingCards";
import { trackEvent } from "@/lib/analytics/tracker";
import { BILLING_EVENTS } from "@/lib/analytics/events";

const Pricing = () => {
  const pricingRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          trackEvent(BILLING_EVENTS.PRICING_VIEWED, {
            source: "landing",
            billing_period: "monthly",
          });
          observer.disconnect();
        }
      },
      {
        threshold: 0.5,
        rootMargin: "0px",
      }
    );

    if (pricingRef.current) {
      observer.observe(pricingRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={pricingRef} id="pricing" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 mb-6">
            <span className="text-sm font-medium text-primary">Pricing</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold">
            <span className="text-primary">Stay in control</span> of your
            property finances
          </h2>
          <p className="text-lg max-w-3xl mx-auto mt-4 mb-8">
            Choose the perfect plan for your property portfolio.
          </p>
        </div>

        <PricingCards showToggle={true} defaultHref="/dashboard" />
      </div>
    </section>
  );
};

export default Pricing;
