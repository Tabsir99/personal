import React from "react";
import { Card, CardContent } from "../../../components/ui/card";
import {
  SiTypescript,
  SiNodedotjs,
  SiNodemon,
  SiLightning,
} from "react-icons/si";

const ThumbnailDesign = () => {
  return (
    <div className="w-full h-full fixed z-[100] top-0 left-0 flex justify-center items-center bg-black/80">
      <div className="relative w-[1300px] h-[675px] bg-gradient-to-br from-gray-900 to-gray-950 flex items-center justify-center">
        <Card className="w-full h-full bg-gray-800/50 backdrop-blur-xl border-gray-700 rounded-3xl shadow-2xl overflow-hidden flex justify-center items-center">
          <CardContent className="flex flex-col items-center justify-center gap-20 p-12 relative">
            {/* Background Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-50 blur-3xl"></div>

            {/* Technology Icons */}
            <div className="flex items-center space-x-8 relative z-10">
              <SiTypescript className="text-[#3178C6] w-20 h-20 transform hover:scale-110 transition-transform" />
              <div className="w-16 h-1 bg-gray-600"></div>
              <SiNodedotjs className="text-[#339933] w-20 h-20 transform hover:scale-110 transition-transform" />
              <div className="w-16 h-1 bg-gray-600"></div>
              <SiNodemon className="text-[#76D04B] w-20 h-20 transform hover:scale-110 transition-transform" />
            </div>

            {/* Main Headline */}
            <div className="flex flex-col items-center space-y-4 relative z-10">
              <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-200 text-center leading-tight relative z-10">
                TypeScript + Node.js + Nodemon
              </h1>

              {/* Subtitle */}
              <div className="flex items-center space-x-4 bg-gray-700/40 px-6 py-3 rounded-full relative z-10">
                <SiLightning className="text-blue-400 w-10 h-10" />
                <h2 className="text-3xl font-semibold text-white">
                  Dev Setup in 2 Minutes
                </h2>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ThumbnailDesign;
