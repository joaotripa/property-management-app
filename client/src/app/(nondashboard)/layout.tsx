"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full w-full">
      <Navbar />
      <main className="h-full flex w-full flex-col">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
