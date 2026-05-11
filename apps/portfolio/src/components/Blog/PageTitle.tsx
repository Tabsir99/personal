export default function PageTitle({
  heading,
  tagline,
}: {
  heading: string;
  tagline: string;
}) {
  return (
    <header className="ptitle">
      <nav className="ptitle__crumbs mono" aria-label="Breadcrumb">
        <a href="/">tabsircg.com</a>
        <span aria-hidden="true">/</span>
        <span>blog</span>
      </nav>
      <h1 className="ptitle__h">
        <span className="ptitle__word">
          {heading}
          <span className="ptitle__dot">.</span>
        </span>
      </h1>
      <p className="ptitle__tag">{tagline}</p>
    </header>
  );
}
