import React from "react";
import EmailSignUpForm from "@/components/EmailSignUpForm";

const CallToActionSection = () => {
  return (
    <section
      id="cta"
      className="py-16 md:py-24 bg-gradient-to-r from-blue-600 to-blue-700"
    >
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Spreadsheets aren&apos;t cutting it?
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Domari is almost here! Join the waitlist and we&apos;ll let you know
          when it&apos;s ready.
        </p>
        <EmailSignUpForm variant="secondary" />
      </div>
    </section>
  );
};

export default CallToActionSection;
