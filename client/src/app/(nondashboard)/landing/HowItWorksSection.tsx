import React from "react";
import {
  ChartNoAxesCombined,
  Euro,
  FileText,
  PieChart,
  Puzzle,
} from "lucide-react";

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Managing Rentals Doesn’t Have to Be Messy
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Three simple steps to take control of your rental finances
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center group hover:scale-105 transition-transform duration-300">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-shadow">
              <Puzzle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">
              Add your properties
            </h3>
            <p className="text-slate-600">
              Quickly set up long-term or short-term rentals in minutes — no
              complex setup or accounting required.
            </p>
          </div>

          <div className="text-center group hover:scale-105 transition-transform duration-300">
            <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-green-700 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-shadow">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">
              Log income and expenses
            </h3>
            <p className="text-slate-600">
              Capture maintenance costs, repairs, and operating expenses on the
              go
            </p>
          </div>

          <div className="text-center group hover:scale-105 transition-transform duration-300">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-shadow">
              <ChartNoAxesCombined className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">
              See your performance at a glance
            </h3>
            <p className="text-slate-600">
              Get a clear, real-time view of profits, occupancy, and performance
              without digging through spreadsheets.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
