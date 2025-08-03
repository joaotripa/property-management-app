import { FileStack, Target, CalendarClock, EyeOff } from "lucide-react";

const Problem = () => {
  const features = [
    {
      icon: FileStack,
      title: "Spreadsheet Hell",
      description:
        "You're wrestling with multiple Excel files, losing data, and spending weekends fixing formulas instead of growing your portfolio.",
      color: "from-destructive/70 to-rose-500",
      bgColor: "bg-destructive/10",
    },
    {
      icon: CalendarClock,
      title: "Tax Season Nightmare",
      description:
        'Scrambling through receipts and bank statements because your "system" is actually just a folder of random documents.',
      color: "from-destructive/70 to-rose-500",
      bgColor: "bg-destructive/10",
    },
    {
      icon: Target,
      title: "Missing Money",
      description:
        "Without clear tracking, you're losing track of expenses, making poor investment decisions and leaving deductions on the table.",
      color: "from-destructive/70 to-rose-500",
      bgColor: "bg-destructive/10",
    },
    {
      icon: EyeOff,
      title: "Zero Visibility",
      description:
        "No idea which properties are actually profitable or where your money is going each month.",
      color: "from-destructive/70 to-rose-500",
      bgColor: "bg-destructive/10",
    },
  ];

  return (
    <section id="why-domari" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 mb-6">
              <span className="text-sm font-medium text-primary">Problem</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-snug">
              <span className="text-primary text-shadow-sm text-shadow-primary">
                Rental finances{" "}
              </span>
              shouldn't be this hard
            </h2>
            <p className="text-xl text-muted">
              Most landlords are drowning in spreadsheet chaos, missing
              deductions, and wasting hours on basic bookkeeping that should
              take minutes.
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

export default Problem;
