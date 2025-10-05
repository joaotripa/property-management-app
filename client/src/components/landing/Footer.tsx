"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import Logo from "@/components/branding/Logo";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-light/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="flex items-center text-xl text-foreground">
              <Logo />
            </div>
            <p className="leading-relaxed text-muted-foreground">
              Stay on top of your property finances without spreadsheets or
              accounting headaches.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-6">Links</h3>
            <ul className="space-y-4 text-muted-foreground">
              {[
                { label: "Features", href: "/#solution" },
                { label: "Pricing", href: "/#pricing" },
                { label: "FAQ", href: "/#faq" },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-6">Contact</h3>
            <ul className="flex flex-col gap-4">
              <li className="flex items-center">
                <Mail className="h-4 w-4 mr-3 text-muted-foreground" />
                <a
                  href="mailto:support@domari.app"
                  className="hover:text-primary  transition-colors text-muted-foreground"
                >
                  support@domari.app
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-muted-foreground mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
            <div className="text-sm text-muted-foreground">
              © {currentYear} Domari. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              {[
                { label: "Terms of Service", href: "/terms-of-service" },
                { label: "Privacy Policy", href: "/privacy-policy" },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
