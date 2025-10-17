import { FileStack, Coins, CalendarClock, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Problem = () => {
  const features = [
    {
      icon: FileStack,
      title: "Spreadsheet Chaos",
      description:
        "Multiple Excel files, broken formulas, and no idea which version is current. More time fixing spreadsheets than actually managing properties.",
      color: "from-destructive/70 to-rose-500",
    },
    {
      icon: CalendarClock,
      title: "Tax Season Panic",
      description:
        "Scrambling through receipts and bank statements at the last minute because your 'system' is just a folder of random PDFs.",
      color: "from-destructive/70 to-rose-500",
    },
    {
      icon: Coins,
      title: "Unclear Profitability",
      description:
        "Rent comes in, but after repairs, taxes, insurance, and fees, you're not sure what's actually left. Are you building wealth or breaking even?",
      color: "from-destructive/70 to-rose-500",
    },
    {
      icon: EyeOff,
      title: "Flying Blind",
      description:
        "No idea which properties make money or if this month was better than last. Running a business on gut feeling instead of real numbers.",
      color: "from-destructive/70 to-rose-500",
    },
  ];

  return (
    <section id="why-domari" className="py-24 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 mb-6">
              <span className="text-sm font-medium text-primary">
                Challenges
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold mb-4 leading-snug">
              <span className="text-primary">Property finances</span>{" "}
              shouldn&apos;t be this hard
            </h2>
            <p className="text-lg text-balance">
              If you&apos;ve ever scrambled to find a receipt at tax time, stared at
              a spreadsheet wondering where your profit went, or realized you
              have no idea which property actually makes money. You&apos;re exactly
              who we built this for.
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
