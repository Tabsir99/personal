"use client";

import CertficateModal, { ModalButtonOpen } from "./CertificateModal";
import Desginedh2 from "../UI/DesginedH2";
import { useState } from "react";
import { FaCalendar, FaUser } from "react-icons/fa6";

const CertiFicateCard = ({
  title,
  issuer,
  date,
  description,
  num,
}: {
  title: string;
  issuer: string;
  date: string;
  description: string;
  num: number;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div
        className="certificate-card bg-gradient-radial from-[#1d1d2a99] to-[#151b2399] rounded-xl shadow-lg hover:shadow-2xl hover:shadow-[#111] 
         duration-300 border-[2px] hover:-translate-y-2 border-gray-700 cursor-pointer"
      >
        <style>
          {`
                    .certificate-card:hover .certificate-des{
                        opacity: 1;
                        transform: translateY(0)
                    }
                `}
        </style>
        <div className="card-details px-4 py-7 flex flex-col justify-between h-[18rem]">
          <div>
            <h3 className="text-xl font-semibold mb-4 text-white">{title}</h3>
            <p className="text-sm text-gray-300 mb-1 flex items-center gap-0">
              <FaUser className="mr-2" />
              <span className="font-bold text-gray-300 text-base">
                by {issuer}
              </span>
            </p>
            <p className="text-sm text-gray-300 mb-4 flex items-center gap-1">
              <FaCalendar className="mr-2" />
              Date: {date}
            </p>
          </div>
          <p className="certificate-des  transition opacity-0 max-sm:opacity-100 duration-300 transform translate-y-2 text-gray-300">
            {description}
          </p>
          <ModalButtonOpen setIsModalOpen={setIsModalOpen} />
        </div>
      </div>

      {isModalOpen && (
        <CertficateModal
          setIsModalOpen={setIsModalOpen}
          number={num}
          title="Certificate Image"
        />
      )}
    </>
  );
};

const Credentials = () => {
  const certificates = [
    {
      title: "Responsive Web Design",
      issuer: "freeCodeCamp",
      date: "April 24, 2024",
      description:
        "Completed a comprehensive frontend course with HTML and CSS.",
    },
    {
      title: "Algorithm & Data Structure",
      issuer: "freeCodeCamp",
      date: "May 2, 2024",
      description:
        "Mastered JavaScript fundamentals and advanced concepts with various algorithms.",
    },
    {
      title: "Relational Database Certificate",
      issuer: "freeCodeCamp",
      date: "August 18, 2024",
      description:
        "Learned about SQL, schemas, migrations, and database relations.",
    },
    {
      title: "Backend and API Development",
      issuer: "freeCodeCamp",
      date: "August 20, 2024",
      description:
        "Gained knowledge about server-side development, APIs, microservices, and how they interconnect.",
    },
    {
      title: "Quality Assurance Certificate",
      issuer: "freeCodeCamp",
      date: "August 23, 2024",
      description:
        "Learned about building scalable and future-proof applications through various type of testing.",
    },
  ];

  return (
    <section className=" flex flex-col gap-8 px-3 max-sm:px-1 credentials-section py-12 border-[3px] border-gray-900 rounded-2xl shadow-xl mb-16">
      <Desginedh2 h2text="My Credentials" />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(380px,1fr))] gap-2">
        {certificates.map((cert, index) => (
          <CertiFicateCard key={index} {...cert} num={index} />
        ))}
      </div>
    </section>
  );
};

export default Credentials;
