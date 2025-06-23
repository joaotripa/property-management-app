import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import WhyDomariSection from "@/components/landing/WhyDomariSection";
import AboutSection from "@/components/landing/AboutSection";
import CallToActionSection from "@/components/landing/CallToActionSection";

export default function Home() {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 h-full w-full">
      <Navbar />
      <main className={`h-full flex w-full flex-col`}>
        <HeroSection />
        <HowItWorksSection />
        <WhyDomariSection />
        <AboutSection />
        <CallToActionSection />
      </main>
      <Footer />
    </div>
  );
}
