"use client";

import Image from "next/image";

import responsive from "../../../public/credentials/responsive-desgin.png";
import jsAlgo from "../../../public/credentials/js-alghorithms.png";
import rdms from "../../../public/credentials/RDMS.png";
import api from "../../../public/credentials/API.png";
import quality from "../../../public/credentials/Quality.png";
import { Dispatch, SetStateAction } from "react";
import { FaArrowRight, FaEye, FaX } from "react-icons/fa6";

export function ModalButtonOpen({
  setIsModalOpen,
}: {
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const openModal = () => {
    setIsModalOpen(true);
  };

  return (
    <button
      onClick={openModal}
      className="mt-4 px-4 py-2 bg-green-700 hover:bg-gray-600 text-gray-100 font-bold rounded-xl
                transform flex items-center justify-center gap-2 transition duration-300 hover:shadow-lg focus:outline-blue-400 justify-self-end "
    >
      View Certificate <FaEye />
    </button>
  );
}

const CertficateModal = ({
  title,
  setIsModalOpen,
  number,
}: {
  title: string;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  number: number;
}) => {
  const certificateImg = [
    {
      image: responsive,
      link: "https://www.freecodecamp.org/certification/fcc94173698-a311-4094-b953-af7f3f5b6abf/responsive-web-design",
    },
    {
      image: jsAlgo,
      link: "https://www.freecodecamp.org/certification/fcc94173698-a311-4094-b953-af7f3f5b6abf/javascript-algorithms-and-data-structures-v8",
    },
    {
      image: rdms,
      link: "https://www.freecodecamp.org/certification/fcc94173698-a311-4094-b953-af7f3f5b6abf/relational-database-v8",
    },
    {
      image: api,
      link: "https://www.freecodecamp.org/certification/fcc94173698-a311-4094-b953-af7f3f5b6abf/back-end-development-and-apis",
    },
    {
      image: quality,
      link: "https://www.freecodecamp.org/certification/fcc94173698-a311-4094-b953-af7f3f5b6abf/quality-assurance-v7",
    },
  ];
  function closeModal() {
    setIsModalOpen(false);
  }

  return (
    <div
      id="modal"
      className=" flex justify-center items-end max-sm:items-center fixed z-30 bg-black bg-opacity-70 backdrop-blur-sm h-screen w-screen top-0 left-0 "
    >
      <div className=" border-4 bg-slate-900 ">
        <Image
          src={certificateImg[number].image}
          alt={title}
          width={600}
          fetchPriority="low"
          loading="lazy"
          className="  shadow-sm shadow-black"
          height={200}
          placeholder="blur"
        />
        <a
          href={certificateImg[number].link}
          className="block text-center underline-offset-4 hover:text-slate-300 text-[1.5rem] max-md:text-[1.2rem] py-2 text-gray-200 underline "
        >
          {" "}
          View Certificate Online <FaArrowRight />{" "}
        </a>
      </div>
      <span className=" absolute top-5 right-0 block max-md:-right-10 h-20 w-20 pt-[4.1rem] ">
        {" "}
        <FaX
          onClick={closeModal}
          className=" text-[3rem] max-md:text-[2rem] text-slate-400 hover:rotate-90 transition duration-300 cursor-pointer "
        />{" "}
      </span>
    </div>
  );
};

export default CertficateModal;
