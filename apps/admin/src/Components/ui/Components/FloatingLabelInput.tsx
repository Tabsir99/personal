import { MutableRefObject } from "react";

interface FloatingLabelInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  ref?: MutableRefObject<HTMLInputElement | null>;
}
const FloatingLabelInput = ({
  label,
  type = "text",
  value,
  required,
  ref,
  ...props
}: FloatingLabelInputProps) => {
  return (
    <div className="floating-label-input relative w-full">
      <input
        placeholder=" "
        className="inputField w-full px-8 block py-2 text-lg bg-neutral-900 text-white rounded outline-none
         border-2 border-transparent focus:border-blue-500/0"
        value={value}
        ref={ref}
        {...props}
      />
      <label
        htmlFor="name"
        className={`px-3 absolute left-3 transition-all 
        pointer-events-none text-gray-500 
          top-1/2 -translate-y-1/2  `}
      >
        {label}
      </label>

      {required && (
        <span
          className="
            absolute right-3 top-1/2 -translate-y-1/2 leading-[0.4] max-h-0 opacity-50
            text-gray-300 font-bold
            transition-opacity text-[35px]
          "
          title="Required field"
        >
          *
        </span>
      )}
    </div>
  );
};

export default FloatingLabelInput;
