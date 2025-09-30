"use client";

import React, { useState, useEffect } from "react";
import ServicesSVG from "./ServicesSvg";
import { FaRocket, FaSitemap, FaWrench } from "react-icons/fa6";

const Services = () => {
  const [activeCard, setActiveCard] = useState(4);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % 5); // 0, 1, 2, 3 (3 is pause)
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const iconClass = "w-[60px] h-[60px] text-blue-400";
  const servicesData = [
    {
      title: "Custom Website Development",
      icon: <FaSitemap className={iconClass} />,
      content: (
        <>
          A fully functional, Responsive and efficient full stack web
          application tailored to your needs and vision
        </>
      ),
    },
    {
      title: "Website Optimization",
      icon: <FaRocket className={iconClass} />,
      content: (
        <>
          Optimize your website&apos;s performance, Ensure fast load times and
          improved technical Search Engine Optimization
        </>
      ),
    },
    {
      title: "Website Maintenance",
      icon: <FaWrench className={iconClass} />,
      content: (
        <>
          Quality improvement with bug fixes and enhancements ensuring optimal
          performance and reliability for uninterrupted online presence.
        </>
      ),
    },
  ];

  return (
    <section
      className="bg-[#101216] py-16 border-t-2 border-gray-700 mt-10"
      id="services"
    >
      <div className=" mb-0 flex flex-col items-center">
        <h2
          className="text-gray-200 text-[44px] px-5 py-1 rounded-md"
          style={{
            background:
              "linear-gradient(180deg,#232323,#222),linear-gradient(180deg,hsla(0,0%,100%,.05),hsla(0,0%,100%,.05) 26.56%,rgba(0,0,0,.05) 51.56%,rgba(0,0,0,.05))",
          }}
        >
          {" "}
          <span className="text-service"> Services </span>{" "}
        </h2>

        <ServicesSVG />
      </div>
      <div className="flex px-8 max-sm:flex-col max-sm:px-5 gap-4">
        {servicesData.map((service, index) => (
          <div
            key={index}
            className={`card pt-8 px-8 transition-shadow duration-200 relative overflow-hidden rounded-md
              pb-16 min-h-[18rem] border-2 border-gray-700 w-full ${"c" + index}`}
            style={{
              background: "linear-gradient(180deg,#242424,#121212 65.62%)",
            }}
          >
            {index === activeCard && (
              <div className="absolute inset-0 shimmer" />
            )}
            <div className="relative z-10">
              {service.icon}
              <h3 className="text-[1.4rem] font-semibold text-white mt-4 pr-4 min-h-20">
                {service.title}
              </h3>
              <p className="text-gray-100 md:text-[1rem] text-[16px]">
                {service.content}
              </p>
            </div>
          </div>
        ))}
      </div>
      <a
        href="#skills"
        className="my-8 mx-auto block max-w-[9.5rem] text-center bg-blue-600 active:scale-95 hover:bg-blue-500 text-white py-3 rounded-2xl transition duration-300 font-bold"
      >
        View All Skills
      </a>
    </section>
  );
};

export default Services;
