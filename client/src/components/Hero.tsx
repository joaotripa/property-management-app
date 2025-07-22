"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-white to-blue-50 pt-16 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center animate-fade-in">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 mb-6">
            <TrendingUp className="h-4 w-4 text-primary mr-2" />
            <span className="text-sm font-medium text-primary">
              Trusted by 10,000+ property owners
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
            Smart Property <span className="text-gradient">Finance</span>{" "}
            Management
          </h1>

          <p className="text-lg sm:text-xl text-dark mb-8 leading-relaxed max-w-3xl mx-auto">
            Transform your rental business with intelligent tracking, automated
            bookings, and real-time financial insights. Maximize your income
            while minimizing the hassle.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
            <Link href="/dashboard" passHref>
              <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg font-semibold group">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-white px-8 py-4 text-lg font-semibold"
            >
              Watch Demo
            </Button>
          </div>

          <div className="mt-12 flex items-center justify-center space-x-8 text-sm text-dark">
            <div className="flex items-center">
              <div className="h-2 w-2 bg-success rounded-full mr-2"></div>
              No setup fees
            </div>
            <div className="flex items-center">
              <div className="h-2 w-2 bg-success rounded-full mr-2"></div>
              Cancel anytime
            </div>
            <div className="flex items-center">
              <div className="h-2 w-2 bg-success rounded-full mr-2"></div>
              Free support
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
