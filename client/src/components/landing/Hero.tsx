"use client";

import CTAButton from "./CTAButton";

const Hero = () => {
  return (
    <section className="relative overflow-visible py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center animate-fade-in">
          <h1 className="text-5xl font-medium leading-tight mb-6">
            See exactly how your{" "}
            <span className="text-primary">properties make money</span>
          </h1>

          <h2 className="text-lg sm:text-xl mb-8 leading-relaxed max-w-3xl mx-auto text-balance">
            Track income, expenses, and cash flow in one simple dashboard.
            No more spreadsheets, no more guesswork. Just clear numbers that
            help you invest smarter.
          </h2>

          <div className="flex flex-col items-center gap-2">
            <CTAButton />
            <p className="text-sm">No credit card required.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
