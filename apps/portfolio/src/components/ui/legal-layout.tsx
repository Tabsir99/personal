interface Section {
    title: string;
    content: string | string[];
  }
  
  interface LegalPageProps {
    title: string;
    lastUpdated: string;
    sections: Section[];
  }
  
  const LegalPage = ({ title, lastUpdated, sections }: LegalPageProps) => {
    return (
      <>
        <div className="space-y-2 mb-16 scroll-mt-40">
          <h1 className="text-4xl font-bold tracking-tight bg-linear-to-br from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            {title}
          </h1>
          <p className="text-sm text-zinc-600">Last updated: {lastUpdated}</p>
        </div>
  
        <div className="space-y-12">
          {sections.map((section, i) => (
            <section key={i} className="space-y-4">
              <h2 className="text-lg font-semibold text-zinc-200">
                {section.title}
              </h2>
              {Array.isArray(section.content) ? (
                <div className="space-y-3">
                  {section.content.map((paragraph, j) => (
                    <p key={j} className="text-sm leading-relaxed text-zinc-400">
                      {paragraph}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-relaxed text-zinc-400">
                  {section.content}
                </p>
              )}
            </section>
          ))}
        </div>
      </>
    );
  };
  
  export default LegalPage;