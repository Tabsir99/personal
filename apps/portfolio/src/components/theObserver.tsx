"use client";
import { useEffect, createContext, useContext, useState } from "react";

// Create a global animation context
const AnimationContext = createContext<{
  pausedElements: Set<string>;
  addPausedElement: (elementId: string) => void;
  removePausedElement: (elementId: string) => void;
} | undefined>(undefined);

export const useAnimationContext = () => {
  const context = useContext(AnimationContext);
  if (context === undefined) {
    throw new Error('useAnimationContext must be used within an AnimationProvider');
  }
  return context;
};

export const AnimationProvider = ({ children }: { children: React.ReactNode }) => {
  const [pausedElements, setPausedElements] = useState<Set<string>>(new Set());

  const addPausedElement = (elementId: string) => {
    setPausedElements((prev) => new Set(prev).add(elementId));
  };

  const removePausedElement = (elementId: string) => {
    setPausedElements((prev) => {
      const updatedSet = new Set(prev);
      updatedSet.delete(elementId);
      return updatedSet;
    });
  };

  return (
    <AnimationContext.Provider
      value={{ pausedElements, addPausedElement, removePausedElement }}
    >
      {children}
    </AnimationContext.Provider>
  );
};

export default function Observer() {
  const { addPausedElement, removePausedElement } = useAnimationContext();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            removePausedElement(entry.target.id);
          } else {
            addPausedElement(entry.target.id);
          }
        });
      },
      { threshold: 0.1 }
    );

    const svgElement = document.getElementById("servicesSvg");
    if (svgElement) {
      observer.observe(svgElement);
    }

    return () => observer.disconnect();
  }, []);

  return null;
}