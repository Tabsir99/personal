"use client";

import { useEffect, useState } from "react";
import { FaArrowLeftLong, FaArrowRightLong } from "react-icons/fa6";

const ShowMoreCards = ({ subSectionNumber }: { subSectionNumber: number }) => {
  const [rootElement, setRootElement] = useState<HTMLElement | null>(null);
  const [subSections, setSubSections] = useState<(HTMLElement | null)[]>([]);
  const [windowWidth, setWindowWidth] = useState<number | null>(null);
  const [cardIndex, setCardIndex] = useState(0);
  const subSctIndx = subSectionNumber - 1;

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    window.addEventListener("resize", () => {
      setWindowWidth(window.innerWidth);
    });
    const element = document.documentElement;
    const subSection1 = document.getElementById("subSection1");
    const subSection2 = document.getElementById("subSection2");
    const subSection3 = document.getElementById("subSection3");

    setSubSections([subSection1, subSection2, subSection3]);
    setRootElement(element);

    return () => {
      window.removeEventListener("resize", () => {
        setWindowWidth(window.innerWidth);
      });
    };
  }, []);

  const handleLeftClick = () => {
    subSections[subSctIndx]?.style.setProperty("--group1opc", "1");
    subSections[subSctIndx]?.style.setProperty("--group1scl", "1");
    subSections[subSctIndx]?.style.setProperty("--group2opc", "0");
    subSections[subSctIndx]?.style.setProperty("--group2scl", "0.4");

    if (cardIndex > 100) {
      rootElement?.style.setProperty(
        "--translateCards" + subSectionNumber,
        `calc((${cardIndex - 100}vw) - 0.4rem)`
      );
      setCardIndex((prev) => prev - 100);
      return;
    }
    if (cardIndex > 0) {
      rootElement?.style.setProperty(
        "--translateCards" + subSectionNumber,
        `calc((${cardIndex - 100}vw))`
      );
      setCardIndex((prev) => prev - 100);
    }
  };
  const handleRightClick = () => {
    subSections[subSctIndx]?.style.setProperty("--group1opc", "0");
    subSections[subSctIndx]?.style.setProperty("--group1scl", "0.4");
    subSections[subSctIndx]?.style.setProperty("--group2opc", "1");
    subSections[subSctIndx]?.style.setProperty("--group2scl", "1");

    if (cardIndex < 100) {
      rootElement?.style.setProperty(
        "--translateCards" + subSectionNumber,
        `calc((${cardIndex + 100}vw) - 0.4rem)`
      );

      setCardIndex((prev) => prev + 100);
    }
  };

  if (!windowWidth) return null;
  return (
    <>
      {windowWidth < 1100 && (
        <div className="text-white col-span-2 h-10 mt-2 px-3 flex justify-between items-center row-start-4 row-end-5 ">
          <span
            onClick={handleLeftClick}
            className="prevCardsBtn bg-gray-950 px-3 py-1 rounded-full border border-slate-600 shadow-md
             shadow-slate-800 hover:cursor-pointer active:scale-90 transition duration-200 "
          >
            <FaArrowLeftLong />
          </span>

          <span
            onClick={handleRightClick}
            className="nextCardsBtn bg-gray-950 px-3 py-1 rounded-full border border-slate-600 shadow-md
            hover:cursor-pointer shadow-slate-800 active:scale-90 transition duration-200 "
          >
            <FaArrowRightLong />
          </span>
        </div>
      )}
    </>
  );
};

export default ShowMoreCards;
