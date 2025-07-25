"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp } from "lucide-react";
import DashboardPreview from "./DashboardPreview";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-primary-light/60 pt-16 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center animate-fade-in">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 mb-6">
            <TrendingUp className="h-4 w-4 text-primary mr-2" />
            <span className="text-sm font-medium text-primary">
              Trusted by 500+ property owners
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
            Ditch the spreadsheets,{" "}
            <span className="text-primary text-shadow-sm text-shadow-primary">
              keep the profits
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-dark mb-8 leading-relaxed max-w-3xl mx-auto">
            Track income, expenses, and real profit margins in one clean
            dashboard. Make smarter investment decisions with complete financial
            visibility.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
            <Link href="/dashboard" passHref>
              <Button className="!p-8 bg-primary hover-scale hover:bg-primary/90 text-white text-lg rounded-full font-semibold group shadow-xl shadow-primary/30 hover:!shadow-2xl hover:!shadow-primary/60 transition-shadow duration-200">
                Try it for free
                <ArrowRight className="size-6 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
            </Link>
          </div>

          <div className="mt-12 flex items-center justify-center space-x-8 text-sm text-dark">
            <div className="flex items-center">
              <div className="h-2 w-2 bg-success rounded-full mr-2"></div>
              Free for up to 2 properties
            </div>
            <div className="flex items-center">
              <div className="h-2 w-2 bg-success rounded-full mr-2"></div>
              Set up in minutes
            </div>
            <div className="flex items-center">
              <div className="h-2 w-2 bg-success rounded-full mr-2"></div>
              No credit card required
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
