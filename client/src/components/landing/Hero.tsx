"use client";

import { Dot } from "lucide-react";
import CTAButton from "./CTAButton";

const Hero = () => {
  return (
    <section className="relative overflow-visible pt-16 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center animate-fade-in">
          <h1 className="text-5xl font-medium leading-tight mb-6">
            See exactly how your{" "}
            <span className="text-primary">properties perform</span>
          </h1>

          <h2 className="text-lg sm:text-xl mb-8 leading-relaxed max-w-3xl mx-auto text-balance">
            Track income, expenses, and real profit margins in one clean
            dashboard. Make smarter investment decisions with complete financial
            visibility.
          </h2>

          <CTAButton />

          <div className="flex flex-row mt-12 justify-center items-center gap-8 text-sm">
            <div className="flex items-center">
              <Dot className="size-12 text-success" />
              Free for up to 2 properties
            </div>
            <div className="flex items-center">
              <Dot className="size-12 text-success  " />
              Set up in minutes
            </div>
            <div className="flex items-center">
              <Dot className="size-12  text-success" />
              No credit card required
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
