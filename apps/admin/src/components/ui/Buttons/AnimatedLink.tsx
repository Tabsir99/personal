"use client";

import Link, { LinkProps } from "next/link";

interface AnimatedLinkProps extends LinkProps {
  children: React.ReactNode;
  href: string;
  className?: string;
}
const AnimatedLink = ({
  children,
  href,
  className,
  ...extraProp
}: AnimatedLinkProps) => {

  return (
    <>
      <Link
        href={href}
        {...extraProp}
        className={className}
        // onClick={async (e) => {
        //   const target = e.currentTarget;
        //   if (target?.closest("a")?.hasAttribute("target")) {
        //     return;
        //   }

        //   e.preventDefault();

        //   if (pathname === href || href.includes("#")) {
        //     return router.push(href);
        //   }

        //   router.push(href);
        //   await new Promise((res) => setTimeout(res, 100));
        //   const loadingAnimation = document.getElementById("loadingAnimation");

        //   if (loadingAnimation) {
        //     loadingAnimation.style.display = "flex";
        //   }
        // }}
      >
        {children}
      </Link>
    </>
  );
};

export default AnimatedLink;
