import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTAButton = () => {
  return (
    <div className="flex justify-center">
      <Link href="/dashboard" passHref>
        <Button className="!p-6 bg-primary text-md hover:bg-primary/90 text-white rounded-full group">
          Start 14-day free trial
          <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform duration-200" />
        </Button>
      </Link>
    </div>
  );
};

export default CTAButton;
