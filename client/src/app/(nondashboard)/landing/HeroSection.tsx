import React from "react";
import { Building, TrendingUp, DollarSign } from "lucide-react";
import EmailSignUpForm from "@/components/EmailSignUpForm";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden pt-28">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Rental Finances,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-700">
                Made Simple
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto lg:mx-0">
              Domari is a modern, lightweight platform that helps small property
              owners track income, expenses, and occupancy—all in one clean,
              mobile-friendly dashboard.
            </p>
            <EmailSignUpForm />
            <p className="text-sm text-slate-500 mt-3">
              Join the waitlist • No credit card required
            </p>
          </div>

          <div className="relative animate-scale-in">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-200/50">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Building className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      Property Dashboard
                    </h3>
                    <p className="text-sm text-slate-500">
                      3 properties managed
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">$4,200</p>
                  <p className="text-sm text-slate-500">Monthly Revenue</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-slate-700">
                      Occupancy
                    </span>
                  </div>
                  <p className="text-xl font-bold text-slate-900">94%</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-slate-700">
                      Profit
                    </span>
                  </div>
                  <p className="text-xl font-bold text-slate-900">$2,840</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">
                    Maple Street Apt
                  </span>
                  <span className="text-sm font-medium text-green-600">
                    +$1,400
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">
                    Oak Avenue House
                  </span>
                  <span className="text-sm font-medium text-green-600">
                    +$1,800
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">
                    Pine Street Condo
                  </span>
                  <span className="text-sm font-medium text-green-600">
                    +$1,000
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
