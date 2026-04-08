export default function LandingHero() {
  return (
    <div className="pt-16 md:pt-32 px-6 md:pl-32 pb-20 md:pb-40 max-w-full md:max-w-[50rem] md:ml-4 text-center md:text-left">
      <h1
        className="font-title text-transparent bg-clip-text font-bold text-4xl md:text-6xl leading-tight"
        style={{ backgroundImage: "var(--main-gradient)" }}>
        Master your goals,
        <br />
        One Step
        <br />
        at a time.
      </h1>
      <p className="font-text text-base md:text-xl text-white-pearl pt-4">
        The minimalist tool for students and young professionals to turn abstract visions into
        actionable daily habits.
      </p>
    </div>
  );
}
