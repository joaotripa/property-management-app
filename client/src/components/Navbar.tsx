"use client";

import React from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-6">
      <div className="container mx-auto">
        <div className="bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-2xl shadow-lg px-6 py-4">
          <div className="flex items-center justify-between">
            <div id="brand" className="flex items-center">
              <Link
                href="/"
                className="flex items-center gap-2 text-2xl font-heading font-semibold text-slate-900"
              >
                <Logo />
                Domari
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link
                href="/landing#how-it-works"
                className="font-body text-slate-600 hover:text-blue-600 transition-colors font-medium"
              >
                How it works
              </Link>
              <Link
                href="/landing#benefits"
                className="text-slate-600 hover:text-blue-600 transition-colors font-medium"
              >
                Benefits
              </Link>
              <Link
                href="/landing#about"
                className="text-slate-600 hover:text-blue-600 transition-colors font-medium"
              >
                About
              </Link>
              <Link href="/landing#cta">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium">
                  Join Now
                </Button>
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 text-slate-600 hover:text-blue-600 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <nav className="md:hidden mt-4 pt-4 border-t border-slate-200/50 animate-fade-in">
              <div className="flex flex-col gap-4">
                <Link
                  href="/landing#how-it-works"
                  className="text-slate-600 hover:text-blue-600 transition-colors py-2 font-medium"
                  onClick={closeMobileMenu}
                >
                  How it works
                </Link>
                <Link
                  href="/landing#benefits"
                  className="text-slate-600 hover:text-blue-600 transition-colors py-2 font-medium"
                  onClick={closeMobileMenu}
                >
                  Benefits
                </Link>
                <Link
                  href="/landing#about"
                  className="text-slate-600 hover:text-blue-600 transition-colors py-2 font-medium"
                  onClick={closeMobileMenu}
                >
                  About
                </Link>
              </div>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
