import Link from "next/link";
import { ROUTES } from "@/lib/constants/routes";

export default function LandingCta() {
  return (
    <div
      className="flex flex-col md:flex-row mx-4 md:mx-12 rounded-xl py-8 md:py-5 items-center justify-between p-8 md:p-14 mt-16 md:mt-28 gap-6 md:gap-0"
      style={{ background: "var(--main-gradient)" }}>
      <h2 className="font-title font-semibold text-2xl md:text-4xl text-deep-bg text-center md:text-left">
        Ready to reach your
        <br className="hidden md:block" /> potential?
      </h2>
      <Link href={ROUTES.REGISTER}>
        <button className="bg-sea-green text-white-pearl font-title font-semibold text-lg md:text-2xl px-8 md:px-10 py-2 md:py-3 rounded-full mt-4 md:mt-0">
          Get Started
        </button>
      </Link>
    </div>
  );
}
