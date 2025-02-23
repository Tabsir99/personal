const SkeletonLoader = () => {
    return (
      <div className="bg-zinc-900 rounded-lg h-52 max-w-[35rem] shadow-md p-8 relative flex flex-col justify-between">
        <div className="flex flex-col gap-3">
          <div className="h-4 bg-zinc-800 rounded-md animate-pulse w-3/4" />
          <div className="h-4 bg-zinc-800 rounded-md animate-pulse w-1/2" />
        </div>
        <div className="flex flex-col gap-3">
          <div className="h-4 bg-zinc-800 rounded-md animate-pulse w-full" />
          <div className="h-4 bg-zinc-800 rounded-md animate-pulse w-2/3" />
        </div>
      </div>
    );
  };
  
  export default SkeletonLoader;