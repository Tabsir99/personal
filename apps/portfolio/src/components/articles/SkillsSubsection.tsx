import cardContent from "./skillContent/cardContent";
import cardContentTools from "./skillContent/cardContentTools";
import ShowMoreCards from "./ShowMoreCard";
import {
  FaArrowRightArrowLeft,
  FaComment,
  FaInfinity,
  FaMicrochip,
  FaPuzzlePiece,
  FaUsers,
} from "react-icons/fa6";

const cardSoftSkills = [
  {
    svgLogo: <FaComment className=" text-4xl text-blue-500 max-sm:text-3xl " />,
    logoName: "Communication",
    techInfo:
      "Clear and concise communicator, skilled in both verbal and written interactions.",
    proficiency: 90,
  },

  {
    svgLogo: (
      <FaInfinity className=" text-4xl text-green-500 max-sm:text-3xl" />
    ),
    logoName: "Adaptability",
    techInfo:
      "Love to learn new things, quick to adapt in dynamic environments, adjusting priorities and strategies as needed.",
    proficiency: 95,
  },
  {
    svgLogo: (
      <FaPuzzlePiece className=" text-4xl text-yellow-500 max-sm:text-3xl" />
    ),
    logoName: "Problem Solving",
    techInfo:
      "Analytical thinker, enjoy finding creative solutions and getting to the root of problems ",
    proficiency: 81,
  },
  {
    svgLogo: <FaUsers className=" text-4xl text-purple-500 max-sm:text-3xl" />,
    logoName: "Teamwork",
    techInfo:
      "Open to collaboration and learn from others, ready to contribute effectively in team environments.",
    proficiency: 75,
  },
];

interface SkillContainerProps {
  svgLogo: React.ReactElement;
  logoName: string;
  techDescription?: string;
  proficiency: number;
  techInfo: string;
  className: string;
}
const SkillContainer = ({
  svgLogo,
  logoName,
  techDescription,
  proficiency,
  techInfo,
  className,
}: SkillContainerProps) => {
  let colorClass = null;
  if (proficiency > 80) {
    colorClass = "bg-green-500";
  } else if (proficiency > 60) {
    colorClass = "bg-yellow-500";
  } else {
    colorClass = "bg-orange-500";
  }

  return (
    <div className={"skillCtn " + className}>
      <div
        className="skillCard border border-gray-700 h-48 rounded-xl shadow-sm shadow-slate-800
    max-sm:h-48 hover:cursor-pointer"
      >
        <div className=" rounded-xl h-full card-front flex flex-col items-stretch justify-between py-1 text-white">
          <div className="head flex justify-between px-1 items-center border-b-[1px] pt-1 pb-2 pl-2 shadow-md shadow-[#111e] border-[#1338]">
            <figure className="flex items-center gap-1">
              {svgLogo}
              <figcaption className="text-[14px] "> {logoName} </figcaption>
            </figure>

            <span className=" scale-90 pr-1 text-slate-400 self-start ">
              <FaArrowRightArrowLeft />
            </span>
          </div>
          <p className=" text-center leading-relaxed text-[13px] px-1 md:text-[16px]">
            {" "}
            {techInfo}{" "}
          </p>

          <div className="flex gap-1 px-2">
            <div
              className="loading w-[95%] h-2 bg-gray-500 rounded-full border border-black 
            self-center shadow-md shadow-black"
            >
              <div
                className={` progress bg-green-500 h-full rounded-full ${colorClass}`}
                style={{ width: `${proficiency}%` }}
              ></div>
            </div>
            <div className="text-[13px] text-white w-fit"> {proficiency}% </div>
          </div>
        </div>

        <div
          className=" rounded-xl card-back bg-black bg-opacity-20 flex flex-col items-center justify-center py-1 text-white
                        p-3 text-[16px] max-sm:text-[14px] "
        >
          {techDescription}
        </div>
      </div>
    </div>
  );
};

const SkillCategory = ({
  heading,
  skillCategory,
}: {
  heading: string;
  skillCategory: number;
}) => {
  const skillCategory1 = cardContent.map((card, index) => {
    const groupClass = `group${Math.floor(index / 4) + 1}`;
    return (
      <SkillContainer
        className={"techCard" + index + " subSection1Cards " + groupClass}
        key={card.logoName}
        svgLogo={card.svgLogo}
        logoName={card.logoName}
        techInfo={card.techInfo}
        proficiency={card.proficiency}
        techDescription={card.techDescription}
      />
    );
  });

  const skillCategory2 = cardContentTools.map((card, index) => {
    const groupClass = `group${Math.floor(index / 4) + 1}`;
    return (
      <SkillContainer
        className={"techCard" + index + " subSection2Cards " + groupClass}
        key={card.logoName}
        svgLogo={card.svgLogo}
        logoName={card.logoName}
        techInfo={card.techInfo}
        proficiency={card.proficiency}
        techDescription={card.techDescription}
      />
    );
  });

  const skillCategory3 = cardSoftSkills.map((card, index) => {
    const groupClass = `group${Math.floor(index / 4) + 1}`;
    return (
      <SkillContainer
        className={"techCard" + index + " subSection3Cards " + groupClass}
        key={card.logoName}
        svgLogo={card.svgLogo}
        logoName={card.logoName}
        techInfo={card.techInfo}
        proficiency={card.proficiency}
      />
    );
  });

  return (
    <section
      id={"subSection" + skillCategory}
      className=" subsectionSkills grid overflow-hidden border-b-2 border-slate-700 pb-6 shadow-md shadow-black"
    >
      <h3 className=" px-3 text-3xl flex items-center gap-2 font-bold max-sm:text-2xl text-blue-400 w-fit mb-5 ">
        <FaMicrochip />
        {heading}{" "}
      </h3>

      {skillCategory === 1 ? skillCategory1 : null}
      {skillCategory === 2 ? skillCategory2 : null}
      {skillCategory === 3 ? skillCategory3 : null}

      {skillCategory === 3 ? null : (
        <ShowMoreCards subSectionNumber={skillCategory} />
      )}
    </section>
  );
};

export default SkillCategory;
