import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTA = () => {
  return (
    <section className="pb-12 pt-24 bg-background overflow-visible relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-background rounded-[3.2rem] shadow-lg py-12 backdrop-blur-sm border border-primary/10 mb-[-6rem] relative z-20">
          <div className="text-center animate-fade-in">
            <div className="flex flex-row items-center justify-between px-16">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl py-6 font-bold text-foreground justify-start leading-snug">
                Domari organizes finances for you.
              </h3>
              <div className="flex items-center justify-center">
                <Link href="/dashboard" passHref>
                  <Button className="!p-8 bg-primary hover-scale hover:bg-primary/90 text-white text-lg rounded-full font-semibold group shadow-xl shadow-primary/30 hover:!shadow-2xl hover:!shadow-primary/60 transition-shadow duration-200">
                    Try it for free
                    <ArrowRight className="size-6 group-hover:translate-x-1 transition-transform duration-200" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
