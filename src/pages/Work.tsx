import { CASES } from "../data/cases";

export default function Work() {
  return (
    <section className="section">
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
  );
}
