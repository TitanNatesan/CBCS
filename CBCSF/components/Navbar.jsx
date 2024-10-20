import Image from "next/image";
import React from "react";

const Navbar = () => {
  return (
    <div className="bg-white py-2 justify-around flex">
      <Image
        src="https://admission.kahedu.edu.in/assets/img/logo-ftr.png"
        width={200}
        height={50}
        alt="kahe logo"
      />
      <p className="text-black">Use full address of college website from the official website</p>
      <h1 className="text-black">Faculty Of Engineering nu kaatanum bold ah</h1>
      <h1 className="text-black">kela course registeration nu kaatanum</h1>
      <Image
        src="https://metaverse-portal.vercel.app/static/media/metaverselogo.aab67fbf864e9682cbe5.jpg"
        width={70}
        height={70}
        alt="metaverse logo"
      />
    </div>
  );
};

export default Navbar;
