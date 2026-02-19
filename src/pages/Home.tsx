import { useEffect, useRef, useState } from "react";
import { CASES } from "../data/cases";
import InteractiveBackground from "../InteractiveBackground";

const SCROLL_RANGE = 680;
const SCALE_END = 0.62;
const FADE_END = 0.5;
const TRANSLATE_Y = 48;

const HERO_LINE2_SENTENCES = [
  "Over a decade designing and scaling financial experiences",
  "Designed with obsession for craft",
  "Built with AI, refined by human design",
  "Powered by AI — otherwise this would’ve taken 829839 hours",
];

export default function Home() {
  const heroInnerRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLAnchorElement>(null);
  const workSectionRef = useRef<HTMLElement>(null);
  const [workVisible, setWorkVisible] = useState(false);
  const [line2Index, setLine2Index] = useState(0);

  const line2Sentence = HERO_LINE2_SENTENCES[line2Index];
  const line2Delays = useRef<number[]>([]);
  if (line2Delays.current.length !== line2Sentence.length) {
    line2Delays.current = Array.from({ length: line2Sentence.length }, () => Math.random() * 0.55);
  }

  useEffect(() => {
    const id = setInterval(() => {
      setLine2Index((i) => (i + 1) % HERO_LINE2_SENTENCES.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const work = workSectionRef.current;
    if (!work) return;
    const ob = new IntersectionObserver(
      ([e]) => setWorkVisible(e.isIntersecting),
      { threshold: 0.38, rootMargin: "-80px 0px 0px 0px" }
    );
    ob.observe(work);
    return () => ob.disconnect();
  }, []);

  useEffect(() => {
    const heroInner = heroInnerRef.current;
    const scrollIndicator = scrollIndicatorRef.current;

    const onScroll = () => {
      const y = window.scrollY;
      const progress = Math.min(y / SCROLL_RANGE, 1);
      const scale = 1 - progress * (1 - SCALE_END);
      const opacity = 1 - progress * (1 - FADE_END);
      const translateY = -progress * TRANSLATE_Y;

      if (heroInner) {
        heroInner.style.transform = `translateY(${translateY}px) scale(${scale})`;
        heroInner.style.opacity = String(opacity);
      }
      if (scrollIndicator) {
        scrollIndicator.style.opacity = String(1 - progress);
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <InteractiveBackground />

      <section className="hero heroRef heroRefCinematic">
        <div className="heroRefInner" ref={heroInnerRef}>
          <div className="heroRefText">
            <p className="heroRefLine1">Hello, I'm Vitor LV</p>
            <h1 className="heroRefTitle">Lead Designer</h1>
            <p className="heroRefLine2" key={line2Index} aria-live="polite">
              {line2Sentence.split("").map((char, i) => (
                <span
                  key={`${line2Index}-${i}`}
                  className="heroRefLine2Char"
                  style={{ animationDelay: `${line2Delays.current[i]}s` }}
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </p>
            <div className="heroRefLogos">
              <img src="/logos-companies.svg" alt="Companies" className="heroRefLogosImg" />
            </div>
          </div>
        </div>

        <a
          ref={scrollIndicatorRef}
          href="#work"
          className="heroScrollIndicator"
          aria-label="Scroll to see more content"
        >
          <svg
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

      <section id="work" ref={workSectionRef} className={`section sectionWork ${workVisible ? "sectionWork--visible" : ""}`}>
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
