import React from "react";

interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
  headerText?: string;
  headerDescription?: string;
  extraHeader?: React.ReactNode;
}
export default function Section({
  children,
  id,
  className,
  headerText,
  headerDescription,
  extraHeader,
  ...props
}: SectionProps) {
  const hasHeader = headerText && headerDescription;
  return (
    <section
      id={id}
      {...props}
      className={`py-16 px-8 max-lg:px-6 max-sm:px-4 ${className}`}
    >
      {hasHeader && (
        <div className="text-center mb-16 max-sm:mb-12">
          <h2 className="text-4xl max-sm:text-3xl font-bold text-white/95 mb-3">
            {headerText}
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            {headerDescription}
          </p>
          {extraHeader}
        </div>
      )}

      {children}
    </section>
  );
}
