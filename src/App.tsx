import "./App.css";

const CASES = [
  {
    title: "Account Opening Experience",
    description:
      "Redesigning onboarding flows to improve clarity, conversion and user confidence.",
    tags: ["Product Design", "UX", "Mobile"],
    year: "2025",
  },
  {
    title: "Design System Foundations",
    description:
      "Building scalable components and tokens to increase consistency across squads.",
    tags: ["UI", "Design System", "Scale"],
    year: "2024",
  },
  {
    title: "Payments & Pix Improvements",
    description:
      "Simplifying high-frequency payment journeys with better hierarchy and microinteractions.",
    tags: ["UX", "Interaction", "Fintech"],
    year: "2024",
  },
];

export default function App() {
  return (
    <div className="page">
      <header className="header">
        <div className="logo">vitorlv</div>

        <nav className="nav">
          <a href="#work">Work</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <main className="main">
        <section className="hero">
          <h1>
          Design that turns <span><br></br>complexity into clarity</span>
          </h1>

          <p className="subtitle">
            Product Designer focused on clarity, craft and high-impact
            experiences. Based in Brazil.
          </p>

          <div className="cta">
            <a className="primary" href="#work">
              View work
            </a>
            <a className="secondary" href="#contact">
              Get in touch
            </a>
          </div>
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

        <section id="about" className="section">
          <div className="sectionTitle">
            <h2>About</h2>
            <p>
              I design with a balance of product strategy and visual precision.
            </p>
          </div>

          <div className="about">
            <p>
              I’m a product designer with experience building digital experiences
              for high-scale platforms. I care deeply about hierarchy,
              usability, storytelling and the little details that make a product
              feel premium.
            </p>

            <p>
              I enjoy working with design systems, experimentation and teams
              that value craft.
            </p>
          </div>
        </section>

        <section id="contact" className="section contact">
          <h2>Let’s build something great.</h2>
          <p>
            Reach out via email or connect on LinkedIn. I’m always open to great
            product challenges.
          </p>

          <div className="cta">
            <a className="primary" href="mailto:bcvitor1@gmail.com">
              Email me
            </a>
            <a
              className="secondary"
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn
            </a>
          </div>
        </section>

        <footer className="footer">
          <p>© {new Date().getFullYear()} vitorlv. Designed with care.</p>
        </footer>
      </main>
    </div>
  );
}
