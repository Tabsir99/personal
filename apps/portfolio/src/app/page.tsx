import React from "react";
import HeroSection from "@/components/HeroSection/HeroSection";
import Services from "@/components/Services/Services";
import Skills from "@/components/About/SkillsSection";
import Credentials from "@/components/About/Credentials";
import About from "@/components/About/About";
import Projects from "@/components/Projects/PortfolioSection";
import Testimonials from "@/components/Testimonials/Testimonials";

const Home = () => {
  return (
    <>
      <HeroSection />

      <Services />

      <Projects />

      <Testimonials />

      <About />

      <Skills />

      <Credentials />
    </>
  );
};

export default Home;
