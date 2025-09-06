import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import CTAButton from "./CTAButton";

const CTA = () => {
  return (
    <section className="pb-12 pt-24 bg-background overflow-visible relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-background rounded-[3.2rem] shadow-lg py-12 backdrop-blur-sm border border-primary/10 mb-[-6rem] relative z-20">
          <div className="text-center animate-fade-in">
            <div className="flex sm:flex-row flex-col items-center justify-between px-16 gap-4">
              <h3 className="text-3xl sm:text-4xl text-balance py-6 font-bold text-foreground justify-start leading-snug">
                Domari organizes finances for you.
              </h3>
              <CTAButton />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
