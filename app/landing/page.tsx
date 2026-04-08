"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import LandingNavbar from "@/components/landing/landing-navbar";
import LandingHero from "@/components/landing/landing-hero";
import LandingFeaturesSection from "@/components/landing/landing-features-section";
import LandingPossibilitySection from "@/components/landing/landing-possibility-section";
import LandingCta from "@/components/landing/landing-cta";
import LandingFooter from "@/components/landing/landing-footer";
import SignIn from "@/components/auth/sign-in";

function SignInAutoOpener({ onOpen }: { onOpen: () => void }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get("signin") === "true") {
      onOpen();
    }
  }, [searchParams, onOpen]);
  return null;
}

function LandingContent() {
  const [showSignIn, setShowSignIn] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);

  const scrollTo = (ref: React.RefObject<HTMLElement | HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    document.body.style.overflow = showSignIn ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [showSignIn]);

  return (
    <div className="bg-landing-bg min-h-screen w-full">
      <header
        ref={headerRef}
        className="relative bg-cover bg-center w-full bg-[url(/landing_bg.png)] -scroll-mt-16 min-[1440px]:pb-56">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(180deg, rgba(5,5,5,0) 0%, rgba(5,5,5,1) 92%)" }}
        />
        <div className="relative z-10">
          <LandingNavbar
            onSignIn={() => setShowSignIn(true)}
            onScrollToHome={() => scrollTo(headerRef)}
            onScrollToFeatures={() => scrollTo(featuresRef)}
            onScrollToAbout={() => scrollTo(footerRef)}
          />
          <LandingHero />
        </div>
      </header>

      <div ref={featuresRef}>
        <LandingFeaturesSection />
      </div>

      <LandingPossibilitySection />
      <LandingCta />

      <footer ref={footerRef}>
        <LandingFooter />
      </footer>

      {showSignIn && <SignIn onClose={() => setShowSignIn(false)} />}

      <Suspense fallback={null}>
        <SignInAutoOpener onOpen={() => setShowSignIn(true)} />
      </Suspense>
    </div>
  );
}

export default function Landing() {
  return <LandingContent />;
}
