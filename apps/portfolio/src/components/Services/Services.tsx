import React from "react";
import Section from "../ui/section";
import ServicesSVG from "./ServicesSvg";
import { Card, CardContent } from "@/components/ui/card";
import Img from "../ui/image";
import { getPageData } from "@/app/layout";

const Services = async () => {
  const pageData = await getPageData();

  return (
    <Section id="services" className="mt-20">
      <div className="mb-0 flex flex-col items-center">
        <h2
          className="text-gray-200 text-[44px] px-5 py-1 rounded-md"
          style={{
            background:
              "linear-gradient(180deg,#232323,#222),linear-gradient(180deg,hsla(0,0%,100%,.05),hsla(0,0%,100%,.05) 26.56%,rgba(0,0,0,.05) 51.56%,rgba(0,0,0,.05))",
          }}
        >
          <span className="text-service"> Services </span>
        </h2>
        <ServicesSVG />
      </div>

      <div className="flex px-8 max-sm:flex-col max-sm:px-5 gap-6 max-w-7xl mx-auto">
        {pageData.services
          .filter((service) => service.isActive)
          .map((service, index) => {
            return (
              <Card
                key={index}
                data-fadein
                style={{
                  animationDelay: `${index * 400}ms`,
                }}
                className="group opacity-0 relative overflow-hidden border border-white/8 bg-white/3 backdrop-blur-md w-full transition-all duration-500 hover:border-white/12 hover:bg-linear-to-br hover:from-white/8 hover:to-transparent rounded-2xl"
              >
                <div
                  className="absolute inset-0 shimmer pointer-events-none"
                  style={{ animationDelay: `${index * 1}s` }}
                />
                <CardContent className="p-8">
                  <div className="flex flex-col items-start gap-4 mb-5">
                    <Img
                      src={service.icon}
                      alt={service.title}
                      width={56}
                      height={56}
                    />
                    <h3 className="text-xl font-semibold text-white/95 tracking-tight">
                      {service.title}
                    </h3>
                  </div>

                  <p className="text-[15px] text-white/60 leading-loose">
                    {service.content}
                  </p>
                </CardContent>

                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-linear-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Card>
            );
          })}
      </div>

      <a
        href="#skills"
        className="px-8 w-fit mx-auto mt-8 py-3 max-sm:text-sm block max-sm:px-6 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
      >
        My Skills
      </a>
    </Section>
  );
};

export default Services;