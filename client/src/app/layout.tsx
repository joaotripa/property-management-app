import "./globals.css";
import { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { GeistSans } from "geist/font/sans";

import { AppProviders } from "@/providers";

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
