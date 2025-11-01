import type { Metadata } from "next";
import RentalYieldCalculatorClient from "./RentalYieldCalculatorClient";

export const metadata: Metadata = {
  title: "Free Rental Yield Calculator | Property Investment ROI Tool - Domari",
  description:
    "Calculate rental property yields instantly. Estimate gross yield, net yield, and monthly cash flow for your investment properties. Free tool for landlords and investors.",
  openGraph: {
    title:
      "Free Rental Yield Calculator | Property Investment ROI Tool - Domari",
    description:
      "Calculate rental property yields instantly. Estimate gross yield, net yield, and monthly cash flow for your investment properties.",
    type: "website",
    url: "https://domari.app/tools/rental-yield-calculator",
  },
  alternates: {
    canonical: "https://domari.app/tools/rental-yield-calculator",
  },
};

export default function RentalYieldCalculatorPage() {
  return (
    <main className="min-h-screen">
      <RentalYieldCalculatorClient />
    </main>
  );
}
