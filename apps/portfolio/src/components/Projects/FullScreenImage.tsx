import Image, { StaticImageData } from "next/image";

interface FullScreenImageProps {
  src: StaticImageData;
  alt: string;
}

const FullScreenImage = ({ src, alt }: FullScreenImageProps) => {
  return (
    <div className="w-full xl:w-[50%] justify-center max-h-[30rem] max-sm:h-[16rem] xl:h-full overflow-hidden flex rounded-xl items-center">
      <Image
        src={src}
        alt={alt}
        className=" w-full h-full transform hover:scale-105 transition-transform 
            duration-300 "
        placeholder="blur"
        loading="lazy"
        fetchPriority="low"
      />
    </div>
  );
};

export default FullScreenImage;
