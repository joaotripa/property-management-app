"use client";

import { ChartNoAxesGantt, House, Layout, LucideIcon, Menu  } from 'lucide-react'
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react'

interface SidebarLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
}

const SidebarLink = ({
  href,
  icon: Icon,
  label,
}:SidebarLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href || (pathname === "/" && href === "/dashboard");

  return (
    <Link href={href}>
      <div className={`cursor-pointer flex items-center justify-start px-8 py-4 hover:bg-blue-100 gap-3 transition-colors ${isActive ? "bg-blue-200 text-white" : ""} `}>
        <Icon className='w-8 h-8 text-gray-700' strokeWidth={1} />
        <span className='block font-medium text-lg text-gray-700'>
          {label}
        </span>
      </div>
    </Link>
  );
}

const Sidebar = () => {
  return (
    <div className='fixed flex flex-col w-72 bg-white overflow-hidden h-full shadow-md z-10'>
      {/* TOP LOGO */}
      <div className='flex gap-3 justify-start items-center pt-10 px-8 py-8'>
        <div><ChartNoAxesGantt className='w-8 h-8 text-gray-700' strokeWidth={1}/></div>
        <h1 className='font-extrabold text-2xl'>PropertyX</h1>
      </div>

      <hr className="w-full border border-gray-300" />

      {/* LINKS */}
      <div className='flex-grow'>
        <SidebarLink href='/dashboard' icon={Layout} label='Dashboard'/>
        <SidebarLink href='/properties' icon={House} label='Properties'/>
      </div>

      {/* FOOTER */}

      <div>
        <p className='text-center text-xs text-gray-500'>&copy; 2024 PropertyX</p>
      </div>

    </div>
  )
}

export default Sidebar