export default function PageTitle() {
  return (
    <header className="ptitle">
      <nav className="ptitle__crumbs mono" aria-label="Breadcrumb">
        <a href="/">tabsircg.com</a>
        <span aria-hidden="true">/</span>
        <span>blog</span>
      </nav>
      <h1 className="ptitle__h">
        <span className="ptitle__word">
          Writing<span className="ptitle__dot">.</span>
        </span>
      </h1>
      <p className="ptitle__tag">
        Field notes on <em>databases</em>, <em>type systems</em>, and the
        occasional 3&nbsp;a.m. pager incident.
      </p>
    </header>
  );
}
