import "./globals.css";
import { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";

import { AppProviders } from "@/providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://domari.app"),
  title: {
    default: "Domari - Track Your Rental Property Investments",
    template: "%s | Domari",
  },
  description:
    "Track income, expenses, and cash flow for your rental properties. Understand ROI, profitability, and make smarter investment decisions with clear analytics.",
  keywords: [
    "rental property",
    "investment tracking",
    "cash flow",
    "ROI",
    "property investment",
    "real estate",
    "landlord",
    "rental income",
    "property management",
    "rental analytics",
  ],
  authors: [{ name: "Domari" }],
  creator: "Domari",
  publisher: "Domari",
  alternates: {
    canonical: "https://domari.app",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google:
      "google-site-verification=kfCJvoSFRKE59kAr_7bNt7KxjOn2yZHblwaenqrYojc",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://domari.app",
    siteName: "Domari",
    title: "Domari - Track Your Rental Property Investments",
    description:
      "Track income, expenses, and cash flow for your rental properties. Understand ROI, profitability, and make smarter investment decisions.",
    images: [
      {
        url: "/domari-logo-icon.png",
        width: 1200,
        height: 630,
        alt: "Domari Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Domari - Track Your Rental Property Investments",
    description:
      "Track income, expenses, and cash flow for your rental properties. Understand ROI, profitability, and make smarter investment decisions.",
    images: ["/domari-logo-icon.png"],
    creator: "@joaotripaa",
    site: "@joaotripaa",
  },
  icons: {
    icon: "/domari-logo-icon.png",
    shortcut: "/domari-logo-icon.png",
    apple: "/domari-logo-icon.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={GeistSans.className}
    >
      <head>
        <script
          defer
          src={process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL}
          data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
        />
      </head>
      <body suppressHydrationWarning>
        <AppProviders>
          <Toaster richColors closeButton theme="light" />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
