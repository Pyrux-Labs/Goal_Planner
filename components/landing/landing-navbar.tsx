"use client";

import Link from "next/link";
import Button from "@/components/ui/button";
import { ROUTES } from "@/lib/constants/routes";

interface LandingNavbarProps {
  onSignIn: () => void;
  onScrollToHome: () => void;
  onScrollToFeatures: () => void;
  onScrollToAbout: () => void;
}

export default function LandingNavbar({
  onSignIn,
  onScrollToHome,
  onScrollToFeatures,
  onScrollToAbout,
}: LandingNavbarProps) {
  return (
    <div className="flex items-center justify-between px-4 md:px-8 py-4 text-white-pearl font-text">
      <div className="flex items-center gap-8">
        <div className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0">
          <img src="icon.svg" alt="logo" className="w-full h-full" />
        </div>
        <nav className="hidden md:flex gap-8 ml-12">
          <button onClick={onScrollToHome} className="hover:text-vibrant-orange transition">
            Home
          </button>
          <button onClick={onScrollToFeatures} className="hover:text-vibrant-orange transition">
            What is Goal Planner?
          </button>
          <button onClick={onScrollToAbout} className="hover:text-vibrant-orange transition">
            About Us
          </button>
        </nav>
      </div>
      <div className="flex gap-4 md:gap-8 items-center">
        <button
          onClick={onSignIn}
          className="hover:text-vibrant-orange transition cursor-pointer text-sm md:text-base">
          Sign In
        </button>
        <Link href={ROUTES.REGISTER}>
          <Button>Get Started</Button>
        </Link>
      </div>
    </div>
  );
}
