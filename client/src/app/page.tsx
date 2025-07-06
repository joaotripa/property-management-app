import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/app/(nondashboard)/(landing)/HeroSection";
import HowItWorksSection from "@/app/(nondashboard)/(landing)/HowItWorksSection";
import WhyDomariSection from "@/app/(nondashboard)/(landing)/WhyDomariSection";
import AboutSection from "@/app/(nondashboard)/(landing)/AboutSection";
import CallToActionSection from "@/app/(nondashboard)/(landing)/CallToActionSection";

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
