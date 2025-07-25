import { BarChart3, TrendingUp, Building2 } from "lucide-react";

const Solution = () => {
  const features = [
    {
      icon: TrendingUp,
      title: "Income & Expense Tracking",
      description:
        "Log rental income, maintenance costs, repairs, and all property expenses in one organized system.",
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-success/10",
    },
    {
      icon: Building2,
      title: "Multi-Property Management",
      description:
        "Add your properties and keep each one's finances completely separate and organized.",
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-success/10",
    },
    {
      icon: BarChart3,
      title: "Financial Reports",
      description:
        "Generate monthly summaries, profit/loss statements, and expense breakdowns with one click.",
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
              <span className="text-primary text-shadow-sm text-shadow-primary">
                Take completly control
              </span>{" "}
              of your property finances.
            </h2>
            <p className="text-xl text-muted">
              Track every transaction, generate instant reports, and scale your
              portfolio effortlessly.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
