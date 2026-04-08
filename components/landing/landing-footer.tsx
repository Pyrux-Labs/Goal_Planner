import Creator from "@/components/landing/creator";

export default function LandingFooter() {
  return (
    <footer className="bg-vibrant-orange mt-16 md:mt-28 px-6 md:px-44 py-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 md:gap-0">
        <Creator
          name="Juan Manuel Garcia"
          email="juanmanuel_garcia98@hotmail.com"
          github="https://github.com/LittleBigPants"
          linkedin="https://www.linkedin.com/in/juan-manuel-garcia-99952b270/"
        />
        <img
          src="icon-white.svg"
          alt="logo"
          className="w-16 h-16 md:w-24 md:h-24 order-first md:order-none"
        />
        <Creator
          name="Gino Rubén Giorgi"
          email="ginorubengiorgi@gmail.com"
          github="https://github.com/ginogiorgi"
          linkedin="https://www.linkedin.com/in/ginorubengiorgi/"
        />
      </div>
      <div className="mt-6 text-center">
        <p className="font-text text-sm text-white-pearl">
          © 2026 GoalPlanner. All rights reserved. Designed by{" "}
          <a
            href="https://pyrux.com.ar"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-deep-bg transition-colors">
            Pyrux
          </a>
        </p>
      </div>
    </footer>
  );
}
