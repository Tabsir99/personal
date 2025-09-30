const Desginedh2 = ({ h2text }: { h2text: string }) => {
  return (
    <h2
      className={`text-blue-500 border w-fit px-4 h-16 max-sm:px-3 max-sm:h-10 flex items-center justify-center
       border-blue-500 rounded-full`}
    >
      {h2text}{" "}
    </h2>
  );
};

export default Desginedh2;
