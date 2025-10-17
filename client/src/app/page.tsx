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
  return (
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
  );
}
