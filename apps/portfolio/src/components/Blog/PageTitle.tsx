export default function PageTitle({
  heading,
  tagline,
}: {
  heading: string;
  tagline: string;
}) {
  return (
    <header className="relative pt-2 pb-14 mb-2 after:content-[''] after:block after:h-px after:bg-line after:mt-14 max-[640px]:pb-8 max-[640px]:after:mt-8">
      <nav
        className="font-mono inline-flex items-center gap-2.5 text-xs text-muted mb-7 tracking-[0.02em]"
        aria-label="Breadcrumb"
      >
        <a
          href="/"
          className="relative transition-colors duration-200 hover:text-cream"
        >
          tabsircg.com
        </a>
        <span aria-hidden="true" className="text-cream/8">
          /
        </span>
        <span className="text-cream font-bold">blog</span>
      </nav>
      <h1 className="m-0 font-serif italic text-cream leading-[0.85] tracking-[-0.055em] text-[clamp(80px,12vw,200px)]">
        <span
          className="inline-block opacity-0 translate-y-10 animate-blog-rise"
          style={{ animationDelay: "80ms" }}
        >
          {heading}
          <span className="not-italic text-accent inline-block animate-blog-dot-bounce origin-bottom">
            .
          </span>
        </span>
      </h1>
      <p
        className="text-[clamp(18px,1.6vw,22px)] leading-[1.45] text-cream-2 max-w-[56ch] mt-7 mb-0 font-light opacity-0 translate-y-5 animate-blog-rise"
        style={{ animationDelay: "320ms" }}
      >
        {tagline}
      </p>
    </header>
  );
}
