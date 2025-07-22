"use client";

import Link from "next/link";
import { Building2, Mail, MapPin, Phone } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">Domari</span>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Stay on top of your property finances without spreadsheets or
              accounting headaches.
            </p>
            <div className="flex space-x-4">
              {["f", "t", "in"].map((icon) => (
                <div
                  key={icon}
                  className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center hover:bg-primary/30 transition-colors cursor-pointer"
                >
                  <span className="text-primary font-semibold">{icon}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Links</h3>
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
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-center">
                <Mail className="h-4 w-4 mr-3 text-primary" />
                <a
                  href="mailto:support@domari.app"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  support@domari.app
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-300 text-sm">
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
                  className="text-gray-300 hover:text-white transition-colors"
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
