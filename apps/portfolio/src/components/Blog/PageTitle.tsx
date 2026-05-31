import { Breadcrumb } from "./Breadcrumb";

export default function PageTitle({
  heading,
  tagline,
}: {
  heading: string;
  tagline: string;
}) {
  return (
    <header className="relative pt-2 pb-14 mb-2 after:content-[''] after:block after:h-px after:bg-line after:mt-14">
      <Breadcrumb
        className="mb-16"
        crumbs={[{ label: "tabsircg.com", href: "/" }, { label: "blog" }]}
      />

      <h1 className="text-[clamp(40px,18vw,360px)] leading-[0.85] tracking-tighter font-bold font-serif">
        <span
          className="inline-block opacity-0 translate-y-10 animate-rise-in"
          style={{ animationDelay: "80ms" }}
        >
          {heading}
          <span className="not-italic text-accent inline-block animate-bounce origin-bottom">
            .
          </span>
        </span>
      </h1>
      <p
        className="text-[clamp(18px,1.6vw,22px)] leading-[1.45] text-cream-2 max-w-[56ch] mt-7 mb-0 font-light opacity-0 translate-y-5 animate-rise-in"
        style={{ animationDelay: "320ms" }}
      >
        {tagline}
      </p>
    </header>
  );
}
