import React from "react";
import Image from "next/image";

const Logo = () => {
  return (
    <div className="h-12 w-42 relative">
      <Image
        alt="domari-logo"
        src="/Domari-Logo-NoBackground.png"
        fill
        className="object-contain"
      />
    </div>
  );
};

export default Logo;
