import { BarChart3, FileText, Building2, ReceiptText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Solution = () => {
  const features = [
    {
      icon: ReceiptText,
      title: "Track Every Transaction",
      description:
        "Log income and expenses in seconds with built-in categories. Search and filter any transaction instantly. Everything organized in one place, not scattered across spreadsheets.",
      color: "from-primary/80 to-primary",
    },
    {
      icon: Building2,
      title: "Manage Multiple Properties",
      description:
        "Track each property's income and expenses separately. See profit margins at a glance and identify which properties perform best. All your portfolio data in one dashboard.",
      color: "from-primary/80 to-primary",
    },
    {
      icon: BarChart3,
      title: "Visualize Your Performance",
      description:
        "Charts show your income and expenses over time. Track monthly trends and see exactly where your money goes with category breakdowns. Clear insights, no spreadsheet formulas.",
      color: "from-primary/80 to-primary",
    },
    {
      icon: FileText,
      title: "Export for Tax Time",
      description:
        "Export all transactions with categories, dates, and amounts in a clean format. Give your accountant organized data instead of scattered receipts and bank statements.",
      color: "from-primary/80 to-primary",
    },
  ];

  return (
    <section id="solution" className="py-24 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full mb-2">
              <span className="text-sm font-medium text-primary uppercase">
                Solution
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold mb-4 leading-snug">
              Everything you need to{" "}
              <span className="text-primary">track your property</span> finances
            </h2>
            <p className="text-lg text-balance">
              Track every rent payment and expense, see which properties make
              you money, and have everything organized for tax season. All in
              one place, without the Excel headaches.
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
