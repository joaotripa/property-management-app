import React from "react";

const AboutSection = () => {
  return (
    <section id="about" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
            Making Rentals Easier — for Everyone
          </h2>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            We started Domari because we've been there — managing a few rentals
            while juggling everything else. Spreadsheets worked... until they
            didn't. Tracking expenses, figuring out profitability, and staying
            organized became a constant headache. Domari is our way of fixing
            that. A clean, smart, and actually enjoyable tool — built for small
            landlords who want clarity without complexity.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
