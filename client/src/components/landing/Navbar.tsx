"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, ArrowRight } from "lucide-react";
import Logo from "@/components/Logo";

const navItems = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Why Domari", href: "#why-domari" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-background backdrop-blur-sm shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-foreground">
              <Logo size="38px" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex">
            <div className="flex flex-row items-center gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-foreground text-md hover:text-primary px-3 py-2 transition-colors duration-200"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" passHref>
              <Button className="bg-white border border-border hover:bg-muted text-md text-foreground font-normal !px-8 !py-4 rounded-full group">
                Login{" "}
              </Button>
            </Link>
            <Link href="/signup" passHref>
              <Button className="bg-primary text-md hover:bg-primary/90 text-md text-primary-foreground !px-8 !py-4  rounded-full group">
                Sign Up
                <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-foreground hover:text-primary hover:bg-muted transition-colors duration-200"
          >
            {isOpen ? (
              <X className="block h-6 w-6" />
            ) : (
              <Menu className="block h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="md:hidden bg-background border-t border-border/20">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-foreground hover:text-primary block px-3 py-2 text-base font-medium transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex flex-row pt-4 gap-2 w-full items-center justify-center">
              <Link
                href="/login"
                className="w-1/2 text-foreground hover:text-primary text-base font-medium transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                <Button className="w-full bg-background hover:bg-muted border border-border text-foreground rounded-full">
                  Login
                </Button>
              </Link>
              <Link
                href="/signup"
                onClick={() => setIsOpen(false)}
                className="w-1/2"
              >
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
