import React from "react";
import { Users, Smartphone, LayoutDashboard, BarChart2 } from "lucide-react";

const WhyDomariSection = () => {
  return (
    <section
      id="benefits"
      className="py-16 md:py-24 bg-gradient-to-br from-slate-50 to-blue-50"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Here’s Why Landlords Like You Will Love Domari
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Built for small landlords and property managers
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200/50 hover:shadow-xl transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Designed for independent landlords
                </h3>
                <p className="text-slate-600">
                  No complex enterprise features you don't need. Just the
                  essentials to manage your rentals effectively.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200/50 hover:shadow-xl transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Mobile-friendly, always
                </h3>
                <p className="text-slate-600">
                  Track everything on the go — whether you're at a property or
                  in line for coffee.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200/50 hover:shadow-xl transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <LayoutDashboard className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Everything in one place
                </h3>
                <p className="text-slate-600">
                  No more scattered notes or half-finished spreadsheets. Domari
                  keeps it organized, automatically.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200/50 hover:shadow-xl transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <BarChart2 className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Visual clarity, without the noise
                </h3>
                <p className="text-slate-600">
                  Clean dashboards, simple charts, and just the right level of
                  detail you need.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyDomariSection;
