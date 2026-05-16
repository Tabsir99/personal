import { Atmosphere } from "@/components/portfolio/atmosphere";
import { Rail } from "@/components/portfolio/rail";
import { Hero } from "@/components/portfolio/hero";
import { Endorsement } from "@/components/portfolio/endorsement";
import { About } from "@/components/portfolio/about";
import { Services } from "@/components/portfolio/services";
import { Work } from "@/components/portfolio/work";
import { Voices } from "@/components/portfolio/voices";
import { Stack } from "@/components/portfolio/stack";
import { Writing } from "@/components/portfolio/writing";
import { Now } from "@/components/portfolio/now";

export default function Home() {
  return (
    <>
      <Atmosphere />
      <Rail />
      <Hero />
      <Endorsement />
      <About />
      <Services />
      <Work />
      <Voices />
      <Stack />
      <Writing />
      <Now />
    </>
  );
}
