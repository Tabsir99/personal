import { H1 } from "@/components/ui/H2";
import { Breadcrumb } from "./Breadcrumb";

export default function PageTitle({
  heading,
  tagline,
}: {
  heading: string;
  tagline: string;
}) {
  return (
    <header className="relative pt-2 pb-14 mb-2 after:content-[''] after:block after:h-px after:bg-line after:mt-14 max-sm:pb-8 max-sm:after:mt-8">
      <Breadcrumb
        className="mb-7"
        crumbs={[
          { label: "tabsircg.com", href: "/" },
          { label: "blog" },
        ]}
      />
      <H1 size="page">
        <span
          className="inline-block opacity-0 translate-y-10 animate-rise-in"
          style={{ animationDelay: "80ms" }}
        >
          {heading}
          <span className="not-italic text-accent inline-block animate-bounce origin-bottom">
            .
          </span>
        </span>
      </H1>
      <p
        className="text-[clamp(18px,1.6vw,22px)] leading-[1.45] text-cream-2 max-w-[56ch] mt-7 mb-0 font-light opacity-0 translate-y-5 animate-rise-in"
        style={{ animationDelay: "320ms" }}
      >
        {tagline}
      </p>
    </header>
  );
}
