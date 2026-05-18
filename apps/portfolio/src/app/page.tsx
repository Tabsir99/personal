import { Atmosphere } from "@/components/portfolio/atmosphere";
import { CursorGlow } from "@/components/portfolio/cursor-glow";
import { Rail } from "@/components/portfolio/rail";
import { Hero } from "@/components/portfolio/hero";
import { Endorsement } from "@/components/portfolio/endorsement";
import { About } from "@/components/portfolio/about";
import { Stack } from "@/components/portfolio/stack";
import { Services } from "@/components/portfolio/services";
import { Work } from "@/components/portfolio/work";
import { Voices } from "@/components/portfolio/voices";
import { Writing } from "@/components/portfolio/writing";
import { Now } from "@/components/portfolio/now";

export default function Home() {
  return (
    <>
      <Atmosphere />
      <CursorGlow />
      <Rail />
      <Hero />
      <Endorsement />
      <About />
      <Stack />
      <Services />
      <Work />
      <Voices />
      <Writing />
      <Now />
    </>
  );
}
