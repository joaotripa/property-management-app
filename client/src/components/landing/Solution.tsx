import { BarChart3, TrendingUp, Building2, ReceiptText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Solution = () => {
  const features = [
    {
      icon: ReceiptText,
      title: "Financial Transaction Tracking",
      subheadline: "Every dollar, perfectly organized",
      description:
        "Log rent, expenses, maintenance costs, repairs, and more in seconds. Built-in categories mean no more guessing where that repair bill should go.",
      color: "from-green-500 to-emerald-600",
    },
    {
      icon: Building2,
      title: "Property Portfolio Management",
      subheadline: "All your properties in one place",
      description:
        "Add your properties and see performance at a glance. Switch between properties instantly and track what matters most.",
      color: "from-green-500 to-emerald-600",
    },
    {
      icon: BarChart3,
      title: "Essential Reporting",
      subheadline: "Tax-ready reports in one click",
      description:
        "Generate profit & loss statements, export everything for your accountant, and see exactly which properties make you money.",
      color: "from-green-500 to-emerald-600",
    },
    {
      icon: TrendingUp,
      title: "Cash Flow Summary",
      subheadline: "Know your numbers instantly",
      description:
        "See total income, expenses, and profit across your entire portfolio. Monthly, yearly, or property-by-property views.",
      color: "from-green-500 to-emerald-600",
    },
  ];

  return (
    <section id="solution" className="py-24 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 mb-6">
              <span className="text-sm font-medium text-primary">Solution</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold mb-4 leading-snug">
              Everything you need to{" "}
              <span className="text-primary">track your property</span> finances
            </h2>
            <p className="text-lg text-balance">
              Track income, manage expenses, generate tax-ready reports from one
              simple dashboard and scale your portfolio effortlessly.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className={`rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group animate-fade-in`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="px-8 py-4 flex flex-row items-center gap-4">
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                >
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-8 mb-4">
                <p className="leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Solution;
