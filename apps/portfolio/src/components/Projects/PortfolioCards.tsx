import { type StaticImageData } from "next/image";
import FullScreenImage from "./FullScreenImage";

export interface PortfolioCardProps {
  skillUsed: string[];
  projectTitle: string;
  alt: string;
  imageLink: StaticImageData;
  projectName: string;
  type: "Personal" | "Demo" | "Freelance";
  description: string;
  shortDescription: string;
  link1: {
    text: string;
    href: string;
  };
  link2: {
    text: string;
    href: string;
  };
}
const PortfolioCard = ({
  skillUsed = [],
  projectTitle,
  alt,
  imageLink,
  projectName,
  type,
  description,
  link1,
  link2,
  shortDescription,
}: PortfolioCardProps) => {
  return (
    <div
      className=" w-full mx-auto  overflow flex flex-col 
      xl:flex-row h-auto xl:h-[28rem]  shadow-lg shadow-black relative rounded-xl
       transition-all duration-300 bg-[#171719] "
    >
      <FullScreenImage alt={alt} src={imageLink} />
      <div className=" w-full xl:w-[55%]  px-6 max-sm:px-4 pt-10 max-sm:pt-8 pb-6 flex flex-col justify-between">
        <div className="border-b-2 border-neutral-700 pb-3">
          <h3 className="text-4xl font-bold text-white mb-3 max-xl:text-3xl max-sm:text-2xl ">
            {projectTitle}
          </h3>
          <h4 className=" mb-6 text-base max-sm:text-sm text-gray-300 ">
            {" "}
            Name: {projectName} | Type: {type}{" "}
          </h4>
          <p className="text-gray-300 mb-2 pr-6 max-sm:pr-0 leading-relaxed text-[17px] max-sm:text-[16px]">
            <span className="max-sm:hidden"> {description} </span>
            <span className="sm:hidden"> {shortDescription} </span>
          </p>
        </div>

        <ul className=" portfolio-card-tech flex flex-wrap gap-2 justify-start -mt-10 max-xl:my-5 ">
          {skillUsed.map((skill) => (
            <li
              className="bg-gray-700 px-3 text-[14px] max-md:px-2 max-md:text-[12px] font-bold bg-opacity-40 border border-gray-600 hover:bg-gray-600 py-1 max-md:py-0 rounded-md"
              key={skill}
            >
              {skill}
            </li>
          ))}
        </ul>
        <div className="flex text-base max-lg:text-sm text-white max-xsm:flex-col text-center gap-3 max-sm:mt-4 ">
          <a
            href={link1.href}
            className="border-[2px] border-green-600 px-10 py-3 max-md:px-6
             rounded-3xl transition-all duration-300 bg-gradient-to-tr inline-block
             from-green-700 to-gray-800 hover:-translate-y-1 active:scale-95 cursor-pointer"
            style={{ boxShadow: "0 0 55px 1px rgba(14, 151, 23, 0.2)" }}
          >
            {link1.text}
          </a>

          <a
            href={link2.href}
            className=" border-[2px] border-blue-600 bg-gradient-to-bl inline-block from-blue-700 to gray-800 px-5 py-3 rounded-3xl
             hover:bg-black transition-all duration-300 active:scale-95 cursor-pointer
              hover:text-gray-300 hover:-translate-y-1 max-lg:px-3 "
            style={{ boxShadow: "0 0 55px 1px rgba(14, 5, 234, 0.2)" }}
          >
            {link2.text}
          </a>
        </div>
      </div>
    </div>
  );
};

export default PortfolioCard;
