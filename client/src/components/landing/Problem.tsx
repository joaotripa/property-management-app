import { FileStack, Target, CalendarClock, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Problem = () => {
  const features = [
    {
      icon: FileStack,
      title: "Spreadsheet Hell",
      description:
        "You're wrestling with multiple Excel files, losing data, and spending weekends fixing formulas instead of growing your portfolio.",
      color: "from-destructive/70 to-rose-500",
    },
    {
      icon: CalendarClock,
      title: "Tax Season Nightmare",
      description:
        'Scrambling through receipts and bank statements because your "system" is actually just a folder of random documents.',
      color: "from-destructive/70 to-rose-500",
    },
    {
      icon: Target,
      title: "Missing Money",
      description:
        "Without clear tracking, you're losing track of expenses, making poor investment decisions and leaving deductions on the table.",
      color: "from-destructive/70 to-rose-500",
    },
    {
      icon: EyeOff,
      title: "Zero Visibility",
      description:
        "No idea which properties are actually profitable or where your money is going each month.",
      color: "from-destructive/70 to-rose-500",
    },
  ];

  return (
    <section id="why-domari" className="py-24 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 mb-6">
              <span className="text-sm font-medium text-primary">Problem</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold mb-4 leading-snug">
              <span className="text-primary">Rental finances </span>
              shouldn&apos;t be this hard
            </h2>
            <p className="text-lg text-balance">
              Most landlords are drowning in spreadsheet chaos, missing
              deductions, and wasting hours on basic bookkeeping that should
              take minutes.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className={`rounded-3xl transition-all duration-300 hover:-translate-y-2 group animate-fade-in`}
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
              <CardContent className="px-8 mb-4 ">
                <p className="leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Problem;
