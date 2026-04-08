export default function LandingPossibilitySection() {
  return (
    <div className="flex flex-col md:flex-row items-center gap-8 md:gap-28 mx-4 md:mx-16 lg:mx-64 mt-16 md:mt-28">
      <img
        src="possibilityLandingPage.jpg"
        alt="Possibility Image"
        className="w-64 md:w-80 h-96 md:h-[27rem] object-cover rounded-3xl"
      />
      <div className="text-center md:text-left">
        <h1
          className="font-title font-semibold text-3xl md:text-5xl text-transparent bg-clip-text mb-8 pb-2"
          style={{ backgroundImage: "var(--main-gradient)" }}>
          The possibilities
          <br />
          are
          <br />
          beyond your
          <br />
          imagination
        </h1>
        <p className="font-text text-white-pearl mb-8 leading-10">
          Daily tracking increases your chances of goals into reality.
        </p>
        <p className="font-text text-white-pearl leading-10">
          When you see your progress every day, your dreams stop being abstract and start becoming
          achievable.
        </p>
      </div>
    </div>
  );
}
