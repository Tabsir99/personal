const LoadingButton = ({ isLoading, children, className, ...props }) => {
  return (
    <button
      className={`
          relative text-foreground
           overflow-hidden transition-all duration-300 ease-in-out
           focus:outline-none 
          disabled:opacity-70 disabled:cursor-not-allowed
          ${isLoading ? "cursor-wait" : "cursor-pointer"}
          ${className || ""}
        `}
      disabled={isLoading}
      {...props}
    >
      <span
        className={`relative z-10 ${isLoading ? "opacity-0" : "opacity-100"}`}
      >
        {children}
      </span>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex space-x-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 bg-foreground rounded-full animate-bounce`}
                style={{ animationDelay: `${i * 0.2}s` }}
              ></div>
            ))}
          </div>
        </div>
      )}
    </button>
  );
};

export default LoadingButton;
