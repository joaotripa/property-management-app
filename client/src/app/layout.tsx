import "./globals.css";
import { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { GeistSans } from "geist/font/sans";

import Script from "next/script";
import AuthProvider from "@/components/providers/AuthProvider";
import QueryProvider from "@/components/providers/QueryProvider";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={GeistSans.className}
    >
      <head>
        <Script
          defer
          src={process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL}
          data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
        ></Script>
      </head>
      <body suppressHydrationWarning>
        <QueryProvider>
          <AuthProvider>
            <Toaster richColors closeButton theme="light" />
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
