import React from "react";
import Image from "next/image";

const Logo = () => {
  return (
    <div className="size-10 relative">
      <Image
        alt="domari-logo"
        src="/Domari-Logo-Icon.png"
        fill
        className="object-contain"
      />
    </div>
  );
};

export default Logo;
