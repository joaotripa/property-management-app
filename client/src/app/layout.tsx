import "./globals.css";
import { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Montserrat } from "next/font/google";
import Script from "next/script";
import AuthProvider from "@/components/providers/AuthProvider";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${montserrat.variable}`}>
      <head>
        <Script
          defer
          src={process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL}
          data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
        ></Script>
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>
          <Toaster richColors closeButton theme="light" />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
