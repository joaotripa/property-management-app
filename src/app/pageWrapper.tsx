import React from "react";
import Navbar from "@/app/(components)/Navbar";
import Sidebar from "@/app/(components)/Sidebar";

const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="light flex bg-gray-50 text-gray-900 w-full min-h-screen">
      <Sidebar />
      <main className="flex flex-col w-full h-full py-7 bg-gray-50 pl-96">
        <Navbar></Navbar>
        {children}
      </main>
    </div>    
  );
};

export default PageWrapper;
