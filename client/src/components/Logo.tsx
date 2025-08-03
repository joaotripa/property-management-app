import React from "react";
import Image from "next/image";

interface LogoProps {
  size?: string;
  className?: string;
}

const Logo = ({ size = "32px", className = "" }: LogoProps) => {
  return (
    <div className={`flex flex-row items-center gap-2 ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <Image
          alt="domari-logo"
          src="/Domari-Logo-Icon.png"
          fill
          sizes="(max-width: 640px) 120px, (max-width: 768px) 140px, 168px"
          priority
          className="object-contain"
        />
      </div>
      <h1 className="font-bold italic">Domari</h1>
    </div>
  );
};

export default Logo;
