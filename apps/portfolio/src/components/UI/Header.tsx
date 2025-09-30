import Image from "next/image";
import logo from "../../../public/o.png";
import Link from "next/link";
import Navbar from "../navbar/Navbar";

const NavbarContainer = () => {
  return (
    <header
      id="nav-div"
      className="bg-zinc-950 h-[4rem] w-full border-b-2 border-b-slate-900 flex justify-between items-center px-1 fixed top-0 left-0 gap-12 z-40"
    >
      <Link href="/" className="pl-3">
        <Image
          src={logo}
          width={60}
          placeholder="blur"
          fetchPriority="high"
          loading="eager"
          className=" min-w-[40px] hover:scale-110 transition-transform duration-200 "
          draggable="false"
          alt=" The Logo where there is a Cat icon beside the word CG"
        />
      </Link>
      <div className=" flex justify-between items-center gap-10 nav-btn-div h-full">
        <Navbar />

        <Button />
      </div>
    </header>
  );
};

export default NavbarContainer;

const Button = () => {
  return (
    <a href="mailto:hello@tabsircg.com" className="inline-block">
      <button
        type="button"
        className="relative px-8 py-3 text-base font-semibold text-white bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-900"
      >
        {/* Animated gradient border */}
        <span className="absolute inset-0 rounded-xl p-[2px] bg-gradient-to-r from-yellow-400 via-purple-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 animate-spin-slow"></span>

        {/* Inner background to create border effect */}
        <span className="absolute inset-[2px] bg-gradient-to-br from-purple-600 to-purple-700 rounded-[10px] group-hover:from-purple-700 group-hover:to-purple-800 transition-all duration-300"></span>

        {/* Subtle shine effect */}
        <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full animate-shine"></span>

        {/* Button text */}
        <span className="relative z-10 tracking-wide">HIRE NOW</span>
      </button>
    </a>
  );
};
