"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import Logo from "@/components/Logo";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-light/40 text-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 mt-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="flex items-center text-foreground">
              <Logo />
            </div>
            <p className="text-primary leading-relaxed">
              Stay on top of your property finances without spreadsheets or
              accounting headaches.
            </p>
          </div>
          <div>
            <h3 className="text-lg text-primary font-semibold mb-6">Links</h3>
            <ul className="space-y-4">
              {[
                { label: "Features", href: "#how-it-works" },
                { label: "Pricing", href: "#pricing" },
                { label: "Integrations", href: "#" },
                { label: "API", href: "#" },
                { label: "Mobile App", href: "#" },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-primary hover:text-primary/60 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg text-primary font-semibold mb-6">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-center">
                <Mail className="h-4 w-4 mr-3 text-primary" />
                <a
                  href="mailto:support@domari.app"
                  className="text-primary hover:text-primary/60 transition-colors"
                >
                  support@domari.app
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-primary text-sm">
              © {currentYear} Domari. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              {[
                { label: "Terms of Service", href: "/terms" },
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Cookie Policy", href: "/cookies" },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-primary hover:text-primary/60 transition-colors"
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
