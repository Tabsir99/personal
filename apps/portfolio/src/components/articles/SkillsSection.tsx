import SkillCategory from "./SkillsSubsection";

import Desginedh2 from "../UI/DesginedH2";
import Available from "../UI/Available";

const Skills = () => {
  return (
    <section
      id="skills"
      className="skills shadow-lg  w-[95vw] max-lg:w-full px-2 max-lg:px-1 mx-auto
          min-h-96 my-2 py-6 rounded-2xl flex flex-col gap-12"
    >
      <div className="flex flex-wrap gap-3 border-b-2 border-slate-800 pb-8 items-center">
        <Desginedh2 h2text="Skills & Expertise" />
        <Available />
        <time className="bg-gray-900 block text-gray-300 text-sm hover:border-gray-600 px-4 py-3 rounded-md text-center border border-gray-700 transition-colors duration-200 shadow-md">
          Last Updated: December 10, 2024
        </time>
      </div>

      <div className="bg-neutral-800/40 hover:border-gray-600 w-fit max-w-md text-pretty transition-colors duration-200 text-gray-300 p-4 rounded-md mb-4 border border-gray-700 shadow-md">
        <p className="text-[15px] leading-relaxed text-balance">
          Note: These proficiency scores are self-assessed based on my knowledge
          and experience with each tool, including related libraries. {" "}
          <strong className="text-[16px]">
            I&apos;m continuously learning and improving.
          </strong>
        </p>
      </div>

      <SkillCategory heading={"Tech Stack"} skillCategory={1} />
      <SkillCategory heading={"Tools & Cloud Services"} skillCategory={2} />
      <SkillCategory heading={"Soft Skills"} skillCategory={3} />
    </section>
  );
};

export default Skills;
