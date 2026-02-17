export default function Contact() {
  return (
    <section className="section contact">
      <h2>Let's build something great.</h2>
      <p>
        Reach out via email or connect on LinkedIn. I'm always open to great
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
  );
}
