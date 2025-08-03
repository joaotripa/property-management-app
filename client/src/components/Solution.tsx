import { BarChart3, TrendingUp, Building2, ReceiptText } from "lucide-react";

const Solution = () => {
  const features = [
    {
      icon: ReceiptText,
      title: "Financial Transaction Tracking",
      subheadline: "Every dollar, perfectly organized",
      description:
        "Log rent, expenses, maintenance costs, repairs, and more in seconds. Built-in categories mean no more guessing where that repair bill should go.",
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-success/10",
    },
    {
      icon: Building2,
      title: "Property Portfolio Management",
      subheadline: "All your properties in one place",
      description:
        "Add your properties and see performance at a glance. Switch between properties instantly and track what matters most.",
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-success/10",
    },
    {
      icon: BarChart3,
      title: "Essential Reporting",
      subheadline: "Tax-ready reports in one click",
      description:
        "Generate profit & loss statements, export everything for your accountant, and see exactly which properties make you money.",
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-success/10",
    },
    {
      icon: TrendingUp,
      title: "Cash Flow Summary",
      subheadline: "Know your numbers instantly",
      description:
        "See total income, expenses, and profit across your entire portfolio. Monthly, yearly, or property-by-property views.",
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-success/10",
    },
  ];

  return (
    <section id="why-domari" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 mb-6">
              <span className="text-sm font-medium text-primary">Solution</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-snug">
              Everything you need to track your{" "}
              <span className="text-primary text-shadow-sm text-shadow-primary">
                property finances.
              </span>
            </h2>
            <p className="text-xl text-muted">
              Track income, manage expenses, generate tax-ready reports from one
              simple dashboard and scale your portfolio effortlessly.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`bg-gradient-to-br ${feature.bgColor} p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-border/20 group animate-fade-in`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
              >
                <feature.icon className="h-8 w-8 text-white" />
              </div>

              <h3 className="text-xl font-semibold text-foreground mb-4">
                {feature.title}
              </h3>

              <p className="text-dark leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Solution;
