import { CASES } from "../data/cases";
import InteractiveBackground from "../InteractiveBackground";

export default function Home() {
  return (
    <>
      <InteractiveBackground />

      <section className="hero heroRef">
        <div className="heroRefInner">
          <div className="heroRefText">
            <p className="heroRefLine1">I'm Vitor LV,</p>
            <h1 className="heroRefTitle">Lead Designer</h1>
            <p className="heroRefLine2">
              with 10+ years designing fintech products at Itaú.
            </p>
          </div>

        </div>

        <a
          href="#work"
          className="heroScrollIndicator"
          aria-label="Scroll to work"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        </a>
      </section>

      <section id="work" className="section">
        <div className="sectionTitle">
          <h2>Selected Work</h2>
          <p>3 projects that represent my craft and product thinking.</p>
        </div>

        <div className="grid">
          {CASES.map((item) => (
            <article key={item.title} className="card">
              <div className="cardTop">
                <span className="year">{item.year}</span>
              </div>

              <h3>{item.title}</h3>
              <p>{item.description}</p>

              <div className="tags">
                {item.tags.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="cardFooter">
                <span className="link">View case →</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
