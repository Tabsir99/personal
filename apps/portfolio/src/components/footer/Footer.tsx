import Image, { StaticImageData } from "next/image";
import fiver from "../../../public/fivr.png";
import CopyEmail from "./Copyemail";
import { FaGithub, FaLinkedin, FaUpwork } from "react-icons/fa6";

const Footer = () => {
  return (
    <footer
      id="contact"
      className="scroll bg-neutral-800/30 px-8 py-16 text-white m-auto
     flex flex-col items-center gap-4"
    >
      <h2
        id="footer-heading"
        className="text-5xl text-green-600 max-md:text-4xl scale-110 text-center"
      >
        Let&apos;s work together...
      </h2>
      <p className="text-xl text-blue-300 mt-2 max-md:text-[16px] text-center leading-relaxed">
        &quot;Great things in business are never done by one person.
        They&apos;re done by a team of people.&quot; <br />- Steve Jobs
      </p>

      <ul
        id="social-media"
        className="flex flex-wrap justify-around mt-4
             text-[1.7rem] max-md:text-[1.3rem]  items-center gap-4 max-md:flex-col"
      >
        <SocialMediaLink
          href="https://github.com/Tabsir99"
          icon={FaGithub}
          label="GitHub"
          altText=""
          iconColor="gray"
        />
        <SocialMediaLink
          href="https://www.linkedin.com/in/tabsir-ahammed-0b61aa324/"
          icon={FaLinkedin}
          label="LinkedIn"
          altText=""
          iconColor="#3b82f6"
        />
        <SocialMediaLink
          href="https://www.fiverr.com/tabsir99"
          imageSrc={fiver}
          altText="Fiverr logo Icon"
          label="Fiverr"
        />
        <SocialMediaLink
          href="https://www.upwork.com/freelancers/~011a2afbbf1c24dbc5"
          icon={FaUpwork}
          label="Upwork"
          altText=""
          iconColor="lime"
        />
      </ul>

      <div id="email" className="text-center text-2xl my-4">
        Email me:
        <a
          className="block my-2 text-blue-500 hover:scale-110 active:scale-95 hover:text-blue-400 hover:underline transition duration-300"
          href="mailto:hello@tabsircg.com"
          id="email-address"
        >
          hello@tabsircg.com
        </a>
        <div className="flex gap-2 items-center">
          (Click to send) or <CopyEmail />
        </div>
      </div>

      <div className="text-center">
        Special thanks to
        <b>
          <a
            className="text-blue-500 hover:underline"
            href="https://www.freecodecamp.org"
          >
            freeCodeCamp
          </a>
        </b>
        , where my journey began.
        <p>
          <br />
          <b>&copy;</b> 2024 Tabsir. All rights reserved | Created: July 2024
        </p>
        <p> Version 1.0 </p>
      </div>
    </footer>
  );
};

export default Footer;

const SocialMediaLink = ({
  href,
  icon: Icon,
  altText,
  label,
  imageSrc,
  iconColor,
}: {
  href: string;
  icon?: React.ElementType;
  altText: string;
  label: string;
  imageSrc?: StaticImageData;
  iconColor?: string;
}) => {
  return (
    <li className="hover:scale-110 active:scale-95 hover:-translate-y-1 transition duration-300">
      <a
        rel="noreferrer"
        className="box-content p-2 flex items-center gap-[0.2rem]"
        href={href}
        target="_blank"
      >
        {imageSrc && (
          <Image
            src={imageSrc}
            alt={altText}
            loading="lazy"
            width={37}
            placeholder="empty"
            fetchPriority="low"
            className="max-md:w-[27px]"
          />
        )}
        {Icon && (
          <Icon className={`text-[inherit] `} style={{ color: iconColor }} />
        )}
        {label}
      </a>
    </li>
  );
};
