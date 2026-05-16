import { Atmosphere } from "@/components/portfolio/atmosphere";
import { Rail, Hero, Endorsement, About } from "@/components/portfolio/core";
import { Services } from "@/components/portfolio/services";
import { Work } from "@/components/portfolio/work";
import { Voices } from "@/components/portfolio/voices";
import { Stack } from "@/components/portfolio/stack";
import { Writing, Now } from "@/components/portfolio/tail";

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
