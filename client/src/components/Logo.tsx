import React from "react";
import Image from "next/image";

const Logo = () => {
  return (
    <div className="h-12 w-42 relative">
      <Image
        alt="domari-logo"
        src="/Domari-Logo-NoBackground.png"
        fill
        sizes="(max-width: 640px) 120px, (max-width: 768px) 140px, 168px"
        className="object-contain"
      />
    </div>
  );
};

export default Logo;
