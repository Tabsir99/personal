"use client";
import { useState } from "react";

interface RippleButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className: string;
  handleClick?: () => void;
}
export const RippleButton = ({
  children,
  className,
  handleClick,
  ...props
}: RippleButtonProps) => {
  const [classToAdd, setClassToAdd] = useState("pointer-events-none");
  const [ripplePosition, setRipplePosition] = useState({ top: 0, left: 0 });

  return (
    <button
      {...props}
      className={
        " relative overflow-hidden rounded-md block cursor-pointer " + className
      }
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const elementX = rect.x;
        const elementY = rect.y;

        const offsetX = Math.round(e.clientX - elementX);
        const offsetY = Math.round(e.clientY - elementY);

        setRipplePosition({ top: offsetY, left: offsetX });
        setClassToAdd("ripple");

        if (handleClick) {
          handleClick();
        }
        setTimeout(() => {
          setClassToAdd("");
          setRipplePosition({ top: 0, left: 0 });
        }, 800);
      }}
    >
      {children}
      <div
        className={classToAdd + " absolute"}
        style={{ top: ripplePosition.top, left: ripplePosition.left }}
        aria-hidden
      ></div>
    </button>
  );
};
