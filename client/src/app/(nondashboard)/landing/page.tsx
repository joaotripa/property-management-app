"use client";

import HeroSection from "@/app/(nondashboard)/landing/HeroSection";
import HowItWorksSection from "@/app/(nondashboard)/landing/HowItWorksSection";
import WhyDomariSection from "@/app/(nondashboard)/landing/WhyDomariSection";
import AboutSection from "@/app/(nondashboard)/landing/AboutSection";
import CallToActionSection from "@/app/(nondashboard)/landing/CallToActionSection";
import Footer from "@/components/Footer";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <main>
        <HeroSection />
        <HowItWorksSection />
        <WhyDomariSection />
        <AboutSection />
        <CallToActionSection />
      </main>
      <Footer />
    </div>
  );
};

export default Landing;
