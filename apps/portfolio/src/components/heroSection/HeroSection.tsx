"use client";

import Available from "../UI/Available";

const HeroSection = () => {
  return (
    <>
      <section className="h-[calc(100vh-4.2rem)] w-full text-white mb-20 px-4 sm:px-8 py-12 flex flex-col max-sm:text-balance max-sm:py-8 items-center justify-center max-sm:justify-start max-sm:items-start text-center relative">
        <section className="w-full max-w-5xl mx-auto px-4 py-16 ">
          {/* Hero Section */}
          <div className="text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
              Building Scalable Web Solutions for Startups
            </h1>
            <p className="text-lg md:text-2xl font-light text-gray-400 max-w-3xl mx-auto">
              Full Stack Developer specializing in Next.js, SQL, and Express.
              Helping startups to grow through reliable and scalable code.
            </p>

            <div className="flex justify-center space-x-4 mt-6">
              <a
                href="#portfolio"
                className="px-8 py-3 text-lg max-sm:text-sm block max-sm:px-6 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
              >
                My Projects
              </a>
              <a
                href="#services"
                className="px-8 py-3 text-lg max-sm:text-sm block max-sm:px-6 font-medium text-blue-600 bg-white rounded-md hover:bg-gray-200 transition"
              >
                Services
              </a>
            </div>
          </div>

          <span className="g1" style={{ zIndex: 200 }}>
            {" "}
          </span>
          <span className="g2" style={{ zIndex: 200 }}>
            {" "}
          </span>
        </section>

        {/* Optional: Some kind of statement or USP */}
        <section className="w-full sm:max-w-4xl mx-auto sm:px-4 py-12 text-center">
          <p className="text-base font-light text-gray-400">
            &quot;Turning ideas into scalable, maintainable code that powers the
            future of startups.&quot;
          </p>
        </section>
      </section>

      <div className=" flex max-md:flex-col mb-0 justify-around gap-4 py-0 ">
        <div
          className=" extra-text w-fit ml-[1vw] min-h-[10rem] max-lg:mx-auto border-[3px] border-slate-900 rounded-3xl shadow-lg shadow-black 
      flex flex-col items-start justify-center py-6 px-4 gap-4"
        >
          <Available />
          <div>
            <p className="text-white text-[1rem] max-lg:text-[1rem] max-w-[40rem]">
              <span className="font-bold text-[1.5rem] max-lg:text-[1.2rem] block">
                I&apos;m active on freelancing platforms
              </span>
              and always looking to improve my skills.
              <br />
              <span>I value time highly</span> and strive to respect both mine
              and others.
            </p>
          </div>
        </div>

        <div className=" p-6 md:w-1/2 rounded-lg shadow-lg shadow-black">
          <span
            className=" text-[2.5rem] max-lg:text-[1.8rem] px-4 inline-block 
  bg-gradient-to-r bg-clip-text from-blue-400 via-purple-400 to-green-500 text-transparent "
          >
            &quot;The key is in not spending time, but in investing it.&quot;
            <br />
            <span className="text-sm md:text-base font-light">
              - Stephen R. Covey
            </span>
          </span>
        </div>
      </div>
    </>
  );
};

export default HeroSection;
