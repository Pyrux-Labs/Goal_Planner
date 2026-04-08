import Feature from "@/components/landing/feature";

export default function LandingFeaturesSection() {
  return (
    <div className="my-3 box-border border-2 border-vibrant-orange rounded-3xl shadow-[0px_0px_10px_2px_rgba(217,78,6,0.8)] bg-black mx-4 md:mx-12 flex flex-col p-4 md:p-8 scroll-mt-32">
      <div className="flex flex-col md:flex-row">
        <Feature
          title="How it works"
          text={
            <>
              Set your goals, plan your tasks on the calendar, and build daily consistency.
              <br />
              Track your progress with simple statistics and visual indicators.
              <br />
              Stay focused, motivated, and in control of your time.
            </>
          }
          horizontal
        />
      </div>
      <div className="flex flex-row justify-between items-center my-8 md:my-16 mb-8">
        <h1
          className="font-title text-2xl md:text-4xl font-semibold text-transparent bg-clip-text ml-3"
          style={{ backgroundImage: "var(--main-gradient)" }}>
          BUILT YOUR SUCCESS
        </h1>
      </div>
      <div className="flex flex-col md:flex-row md:flex-wrap mt-8">
        <Feature
          title="Smart Goal Setting"
          text="Define your vision with our intuitive framework designed for high achievers."
        />
        <Feature
          title="Visual Progress"
          text="Watch your growth with beautiful, live charts that make progress tangible."
        />
        <Feature
          title="Habit Reminders"
          text="Stay on track with gentle, intelligent nudges that fit your personal schedule."
        />
      </div>
    </div>
  );
}
