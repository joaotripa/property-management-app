import React from "react";
import Image from "next/image";

const Logo = () => {
  return (
    <div className="flex flex-row items-center gap-2">
      <div className="size-8 relative">
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
