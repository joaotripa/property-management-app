import type { Metadata } from "next";
import PrivacyPolicyClient from "./PrivacyPolicyClient";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy - GDPR and CCPA compliant. Learn how Domari protects your data, collects information, and handles your personal information when using our property investment tracker platform.",
  keywords: [
    "privacy policy",
    "GDPR compliant",
    "CCPA compliant",
    "data protection",
    "privacy rights",
    "data security",
    "personal information",
  ],
  openGraph: {
    title: "Privacy Policy | Domari",
    description:
      "Privacy Policy - GDPR and CCPA compliant. Learn how Domari protects your data and handles your personal information.",
    url: "https://domari.app/privacy-policy",
    type: "website",
    images: [
      {
        url: "/domari-logo-icon.png",
        width: 1200,
        height: 630,
        alt: "Domari Privacy Policy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | Domari",
    description:
      "Privacy Policy - GDPR and CCPA compliant. Learn how Domari protects your data and handles your personal information.",
    images: ["/domari-logo-icon.png"],
  },
  alternates: {
    canonical: "https://domari.app/privacy-policy",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyClient />;
}
