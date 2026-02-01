"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { ModeToggle } from "@/components/ModeToggle";
import Link from "next/link";
const Header = ({ logo }) => {
  const [isUserButtonLoaded, setUserButtonLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = ()=>{
    setIsOpen(!isOpen)
  }

  const SkeletonLoader = () => (
    <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setUserButtonLoaded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const path = usePathname();

  useEffect(() => {
    console.log(path);
  }, []);
  return (
    <div className="glass sticky top-0 z-50 border-b border-border/50 animate-fade-in">
      <div className="w-[90%] md:w-[80%] m-auto flex gap-4 items-center justify-between py-3">
        <Link className="hidden md:block transition-transform hover:scale-105"  href="/dashboard">
          <Image src={logo} width={80} height={80} alt="logo" className="drop-shadow-md" />
        </Link>
        <ul className="hidden md:flex gap-8 items-center">
          <Link href="/dashboard">
            <li
              className={`relative py-2 px-4 rounded-lg transition-all cursor-pointer group ${
                path == "/dashboard" 
                  ? "text-primary font-semibold" 
                  : "hover:text-primary/80"
              }`}
            >
              Dashboard
              {path == "/dashboard" && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></span>
              )}
            </li>
          </Link>
          <Link href="/dashboard/question">
            <li
              className={`relative py-2 px-4 rounded-lg transition-all cursor-pointer group ${
                path == "/dashboard/question" 
                  ? "text-primary font-semibold" 
                  : "hover:text-primary/80"
              }`}
            >
              Questions
              {path == "/dashboard/question" && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></span>
              )}
            </li>
          </Link>
        </ul>
        <div className="md:hidden">
          <button onClick={toggleMenu} className="inline-flex items-center justify-center p-2 rounded-lg text-foreground/70 hover:text-foreground hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all">
            <span className="sr-only">Open main menu</span>
            {isOpen ? (
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            )}
          </button>
        </div>
        <div className="flex gap-4 items-center" >
          <ModeToggle  />
          {isUserButtonLoaded ? <UserButton /> : <SkeletonLoader />}
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden border-t border-border/30 animate-slide-in">
          <div className="px-5 py-3">
          <ul className="px-2 pt-2 pb-3 space-y-2" >
          <Link href="/dashboard">
            <li
              className={`py-2 px-4 rounded-lg transition-all cursor-pointer ${
                path == "/dashboard" 
                  ? "bg-primary text-primary-foreground font-semibold" 
                  : "hover:bg-accent/50"
              }`}
            >
              Dashboard
            </li>
          </Link>
          <Link href="/dashboard/question">
            <li
              className={`py-2 px-4 rounded-lg transition-all cursor-pointer ${
                path == "/dashboard/question" 
                  ? "bg-primary text-primary-foreground font-semibold" 
                  : "hover:bg-accent/50"
              }`}
            >
              Questions
            </li>
          </Link>
          </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
