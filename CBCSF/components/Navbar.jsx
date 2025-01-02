"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import logo from "../app/logo.png";

const Navbar = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [departmentName, setDepartmentName] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const department = localStorage.getItem("departmentName");
    if (token) {
      setIsLoggedIn(true);
    }
    if (department) {
      setDepartmentName(department);
    }
  }, []);

  const logout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    router.push("/");
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main header section */}
        <div className="relative flex items-center justify-between py-4">
          {/* Logo on the left */}
          <div className="absolute left-0">
            <Link href="/">
              <Image
                src={logo}
                width={100}
                height={100}
                alt="KAHE logo"
                className="w-auto h-24"
              />
            </Link>
          </div>

          {/* Centered text content */}
          <div className="flex-1 text-center">
            <h1 className="text-3xl font-bold text-green-800 mb-1">
              KARPAGAM ACADEMY OF HIGHER EDUCATION
            </h1>
            <div className="text-gray-600 space-y-0.5">
              <p>(Deemed to be University)</p>
              <p>(Established Under Section 3 of UGC Act, 1956)</p>
              <p>Accredited with A+ Grade by NAAC in the Second Cycle</p>
            </div>
          </div>

          {/* User icon on the right */}
          <div className="absolute right-0">
            <div className="flex items-center">
              <Image
                src="https://metaverse-portal.vercel.app/static/media/metaverselogo.aab67fbf864e9682cbe5.jpg"
                width={60}
                height={60}
                alt="Metaverse logo"
                className="rounded-full"
              />
              {isLoggedIn && (
                <button
                  onClick={logout}
                  className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Faculty section with border */}
        <div className="border-t border-gray-200">
          <div className="text-center py-3">
            <p className="text-green-700 font-bold text-2xl">
              Faculty of Engineering
            </p>
            {departmentName && (
              <p className="text-gray-700 font-medium text-lg mb-2">
                {departmentName}
              </p>
            )}
            
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;