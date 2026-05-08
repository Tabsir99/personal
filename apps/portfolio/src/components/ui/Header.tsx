import { getPageData } from "@/app/layout";
import { env } from "@/config/env";
import Img from "./image";
import { NavItems } from "./NavItems";
import { nextImageUrl } from "@/lib/utils";

export const Logo = ({ width = 60 }: { width?: number }) => {
  return (
    <a href="#home" className="pl-3">
      <Img
        src={nextImageUrl(env.LOGO_URL, 256, 100)}
        width={width}
        fetchPriority="high"
        loading="eager"
        className=" hover:scale-110 transition-transform duration-200 "
        draggable="false"
        alt=" The Logo where there is a Cat icon beside the word CG"
      />
    </a>
  );
};

const Navbar = async () => {
  const pageData = await getPageData();

  return (
    <header className="fixed flex items-center justify-between h-16 top-0 left-0 right-0 z-50 bg-[#121212dd] backdrop-blur-md border-b border-zinc-800/50 mx-auto px-4 sm:px-6 lg:px-8">
      <Logo />
      <nav className="flex items-center gap-8 h-full max-sm:flex-row-reverse">
        <NavItems />

        <a
          href={`mailto:${pageData.contact.email}`}
          id="hire-now"
          className="relative h-10 w-30 text-sm bg-linear-to-r  from-purple-800 to-purple-600 hover:from-purple-600 hover:to-purple-800 rounded-lg flex justify-center items-center text-white font-bold tracking-wider bg-purple-600 cursor-pointer overflow-hidden"
        >
          HIRE NOW
        </a>
      </nav>
    </header>
  );
};

export default Navbar;
