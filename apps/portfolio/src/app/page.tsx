import HeroSection from "@/components/heroSection/HeroSection";
import Services from "@/components/featureSection/Services";
import Skills from "@/components/articles/SkillsSection";
import Credentials from "@/components/articles/Credentials";
import About from "@/components/articles/About";
import Projects from "@/components/Projects/PortfolioSection";
import ScriptLoader from "@/components/nullComponents/script";

const Home = () => {
  return (
    <>
      <HeroSection />

      <Services />

      <Projects />

      <About />

      <Skills />

      <Credentials />

      <ScriptLoader />
    </>
  );
};

export default Home;
