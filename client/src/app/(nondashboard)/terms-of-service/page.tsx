import type { Metadata } from "next";
import TermsOfServiceClient from "./TermsOfServiceClient";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of Service - User agreement including 14-day free trial, refund policy, subscription billing, and user responsibilities for Domari property investment tracker platform.",
  keywords: [
    "terms of service",
    "user agreement",
    "refund policy",
    "subscription terms",
    "service agreement",
    "user responsibilities",
    "trial period",
  ],
  openGraph: {
    title: "Terms of Service | Domari",
    description:
      "Terms of Service - User agreement including 14-day free trial, refund policy, and subscription billing.",
    url: "https://domari.app/terms-of-service",
    type: "website",
    images: [
      {
        url: "/domari-logo-icon.png",
        width: 1200,
        height: 630,
        alt: "Domari Terms of Service",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service | Domari",
    description:
      "Terms of Service - User agreement including 14-day free trial, refund policy, and subscription billing.",
    images: ["/domari-logo-icon.png"],
  },
  alternates: {
    canonical: "https://domari.app/terms-of-service",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsOfServicePage() {
  return <TermsOfServiceClient />;
}
