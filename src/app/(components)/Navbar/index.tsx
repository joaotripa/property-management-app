"use client";

import React from "react";
import { Bell, Menu, Settings, Sun, Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type Props = {}

const Navbar = (props: Props) => {
  return (
  <div className="flex justify-between items-center w-full mb-7">
    {/* LEFT SIDE */}
    <div className="flex justify-between items-center gap-5">
      <div className="relative">
        <input
          type="search"
          placeholder="Start type to search"
          className="pl-10 pr-4 py-2 w-50 md:w-80 border-2 border-gray-400 bg-white rounded-lg focus:outline-none focus:border-blue-500"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="text-gray-700 w-5 h-5" />
        </div>
      </div>
    </div>
    {/* RIGHT SIDE */}
    <div className="flex justify-between items-center">
      <div className="hidden md:flex justify-between items-center gap-1">
        <div className="relative p-5 bg-gray-100 rounded hover:bg-blue-100">
          <Bell className="cursor-pointer text-gray-700 w-6 h-6"  />
          <span className="absolute top-3 right-3 inline-flex items-center justify-center px-1.5 py-1 text-xs font-semibold leading-none text-red-100 bg-red-400 rounded-full">
            3
          </span>
        </div>
        <hr className="w-0 h-7 border border-solid border-l border-gray-400 mx-3" />
        <div className="flex items-center gap-3 cursor-pointer p-3 bg-gray-100 rounded hover:bg-blue-100 ">
          <Image src="/user.png" alt="image" width={40} height={40} className="rounded-full shadow-md bg-gray-100"/>
          <span className="font-semibold text-gray-700">User</span>
        </div>
      </div>
      <Link href="/settings" className="h-min w-min p-5 mr-2 bg-gray-100 rounded hover:bg-blue-100">
        <Settings className="cursor-pointer text-gray-700 w-6 h-6"  />
      </Link>
    </div>
  </div>
  )
}

export default Navbar