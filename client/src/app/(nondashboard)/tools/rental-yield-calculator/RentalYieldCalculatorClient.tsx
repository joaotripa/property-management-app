"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  rentalYieldSchema,
  type RentalYieldFormData,
} from "@/lib/validations/rentalYield";
import { Info } from "lucide-react";
import { PieChart, Pie, Cell, Label } from "recharts";
import { createChartTooltipFormatter } from "@/lib/utils/analytics";
import { formatCurrency, formatCompactCurrency } from "@/lib/utils/formatting";
import CTAButton from "@/components/landing/CTAButton";

export default function RentalYieldCalculatorClient() {
  const form = useForm<RentalYieldFormData>({
    resolver: zodResolver(rentalYieldSchema),
    defaultValues: {
      purchasePrice: 250000,
      monthlyRent: 1200,
      monthlyExpenses: 150,
      annualPropertyTax: 450,
      vacancyRate: 5,
      managementFee: 8,
    },
    mode: "onChange",
  });

  const watchedValues = form.watch();

  const annualRent =
    watchedValues.monthlyRent * 12 * (1 - watchedValues.vacancyRate / 100);
  const annualExpenses =
    watchedValues.monthlyExpenses * 12 +
    watchedValues.annualPropertyTax +
    (annualRent * watchedValues.managementFee) / 100;
  const grossYield = (annualRent / watchedValues.purchasePrice) * 100;
  const netYield =
    ((annualRent - annualExpenses) / watchedValues.purchasePrice) * 100;
  const monthlyCashFlow = (annualRent - annualExpenses) / 12;

  const chartConfig = {
    income: {
      label: "Income",
      color: "var(--color-chart-2)",
    },
    expenses: {
      label: "Expenses",
      color: "var(--color-chart-4)",
    },
  } as const;

  const pieData = [
    { name: "income", value: annualRent, fill: chartConfig.income.color },
    {
      name: "expenses",
      value: annualExpenses,
      fill: chartConfig.expenses.color,
    },
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-background py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Rental Yield Calculator
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mt-4 max-w-2xl mx-auto">
            Calculate gross yield, net yield, and monthly cash flow for any
            rental property. Enter your numbers and get instant projections to
            evaluate investment opportunities.
          </p>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <Form {...form}>
          <form className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Inputs */}
              <div className="border border-border rounded-xl bg-card shadow-sm p-6">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
                  Property Information
                </h2>

                <div className="grid gap-4">
                  {/* Purchase Price */}
                  <FormField
                    control={form.control}
                    name="purchasePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Purchase Price (€)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="250000"
                            className="min-h-[44px]"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Monthly Rent */}
                  <FormField
                    control={form.control}
                    name="monthlyRent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Monthly Rent (€)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="1200"
                            className="min-h-[44px]"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Monthly Expenses */}
                  <FormField
                    control={form.control}
                    name="monthlyExpenses"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Monthly Expenses (€)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="150"
                            className="min-h-[44px]"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Annual Property Tax */}
                  <FormField
                    control={form.control}
                    name="annualPropertyTax"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Annual Property Tax (€)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="450"
                            className="min-h-[44px]"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Vacancy Rate Slider */}
                  <FormField
                    control={form.control}
                    name="vacancyRate"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-sm font-medium">
                            Vacancy Rate
                            <Tooltip>
                              <TooltipTrigger>
                                <Info
                                  size={20}
                                  className="text-muted-foreground"
                                />
                              </TooltipTrigger>
                              <TooltipContent>
                                <span>
                                  Percentage of time the property may be empty.
                                </span>
                              </TooltipContent>
                            </Tooltip>
                          </FormLabel>
                          <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold">
                            {field.value}%
                          </span>
                        </div>
                        <FormControl>
                          <Slider
                            min={0}
                            max={20}
                            step={1}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Management Fee Slider */}
                  <FormField
                    control={form.control}
                    name="managementFee"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-sm font-medium">
                            Management Fee
                            <Tooltip>
                              <TooltipTrigger>
                                <Info
                                  size={20}
                                  className="text-muted-foreground"
                                />
                              </TooltipTrigger>
                              <TooltipContent>
                                <span>
                                  Cost of property management, usually a % of
                                  the rent.
                                </span>
                              </TooltipContent>
                            </Tooltip>
                          </FormLabel>
                          <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold">
                            {field.value}%
                          </span>
                        </div>
                        <FormControl>
                          <Slider
                            min={0}
                            max={20}
                            step={1}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Right Column - Chart */}
              <div className="flex flex-col gap-8">
                <Card className="p-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
                    Annual Income vs Expenses Breakdown
                  </h2>
                  <ChartContainer
                    config={chartConfig}
                    className="h-[280px] md:h-[320px]"
                  >
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        label={(entry) => formatCurrency(entry.value)}
                        innerRadius="40%"
                        outerRadius="75%"
                        paddingAngle={2}
                        strokeWidth={1}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                        <Label
                          content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              return (
                                <text
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                >
                                  <tspan
                                    x={viewBox.cx}
                                    y={viewBox.cy}
                                    className="text-muted-foreground text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold"
                                  >
                                    {formatCompactCurrency(
                                      annualRent - annualExpenses
                                    )}
                                  </tspan>
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 20}
                                    className="text-muted-foreground flex text-xs sm:text-sm"
                                  >
                                    Annual Profit
                                  </tspan>
                                </text>
                              );
                            }
                          }}
                        />
                      </Pie>
                      <ChartTooltip
                        cursor={false}
                        content={
                          <ChartTooltipContent
                            formatter={createChartTooltipFormatter(
                              formatCurrency,
                              chartConfig
                            )}
                          />
                        }
                      />
                      <ChartLegend content={<ChartLegendContent />} />
                    </PieChart>
                  </ChartContainer>
                </Card>
              </div>
            </div>

            {/* Results Section - KPI Cards */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
                Your Calculated Results
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Gross Yield */}
                <Card className="px-6 py-4">
                  <div className="flex flex-col gap-2">
                    <p className="text-base text-muted-foreground">
                      Gross Yield
                    </p>
                    <p className="text-3xl font-semibold text-foreground tabular-nums">
                      {grossYield.toFixed(1)}%
                    </p>
                  </div>
                </Card>

                {/* Net Yield */}
                <Card className="px-6 py-4">
                  <div className="flex flex-col gap-2">
                    <p className="text-base text-muted-foreground">Net Yield</p>
                    <p className="text-3xl font-semibold text-primary tabular-nums">
                      {netYield.toFixed(1)}%
                    </p>
                  </div>
                </Card>

                {/* Monthly Cash Flow */}
                <Card className="px-6 py-4">
                  <div className="flex flex-col gap-2">
                    <p className="text-base text-muted-foreground">
                      Monthly Cash Flow
                    </p>
                    <p
                      className={`text-3xl font-semibold tabular-nums ${
                        monthlyCashFlow >= 0
                          ? "text-success dark:text-success/80"
                          : "text-destructive dark:text-destructive/80"
                      }`}
                    >
                      {monthlyCashFlow >= 0 ? "+" : ""}
                      {formatCurrency(monthlyCashFlow)}
                    </p>
                  </div>
                </Card>
              </div>
            </div>

            {/* Explanations & Formulas Section */}
            <div className="border-t border-border pt-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
                Understanding Your Results
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Gross Yield Explanation */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">
                    Gross Yield
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    The total rental income as a percentage of the purchase
                    price, before expenses.
                  </p>
                  <div className="bg-muted/50 rounded-lg p-4 font-mono text-xs">
                    <p className="text-muted-foreground mb-2">Formula:</p>
                    <p className="text-foreground">
                      (Annual Rent / Purchase Price) × 100
                    </p>
                  </div>
                </div>

                {/* Net Yield Explanation */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">
                    Net Yield
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    The actual return after deducting all expenses, taxes, and
                    fees.
                  </p>
                  <div className="bg-muted/50 rounded-lg p-4 font-mono text-xs">
                    <p className="text-muted-foreground mb-2">Formula:</p>
                    <p className="text-foreground">
                      ((Annual Rent - Annual Expenses) / Purchase Price) × 100
                    </p>
                  </div>
                </div>

                {/* Monthly Cash Flow Explanation */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">
                    Monthly Cash Flow
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Your monthly profit or loss after all expenses are paid.
                  </p>
                  <div className="bg-muted/50 rounded-lg p-4 font-mono text-xs">
                    <p className="text-muted-foreground mb-2">Formula:</p>
                    <p className="text-foreground">
                      (Annual Rent - Annual Expenses) / 12
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </section>

      {/* CTA Section */}
      <section className="bg-background py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Track Your Entire Property Portfolio
          </h2>
          <p className="text-base md:text-lg text-muted-foreground mb-8">
            Domari calculates rental yields, cash flow, and ROI for your entire
            property portfolio. Stop managing spreadsheets and see which
            properties are profitable at a glance.
          </p>
          <CTAButton />
        </div>
      </section>
    </div>
  );
}
