import React from "react";
import Link from "next/link";
import { Building, Mail } from "lucide-react";
import Logo from "@/components/Logo";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-6 md:mb-0">
            <Logo />
            <span className="text-xl font-semibold">Domari</span>
          </div>
          <div className="flex flex-row text-xs gap-6">
            <nav className="flex flex-wrap items-center gap-6 mb-6 md:mb-0">
              <Link
                href="/contact"
                className="text-slate-400 hover:text-white transition-colors"
              >
                Contact
              </Link>
            </nav>
            <p className="text-slate-400">Copyright Domari {currentYear}</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
