import { useState, useEffect } from "react";
import "./Benchmarks.css";

const SAVED_KEY = "lv:saved_apps";

interface BenchmarkCard {
  title: string;
  badgeClass: string;
  badgeLabel: string;
  apps: string[];
  terms: string[];
}

const CARDS: BenchmarkCard[] = [
  {
    title: "Pós-venda — acompanhamento",
    badgeClass: "wsBadge--red",
    badgeLabel: "PRIORIDADE",
    apps: ["Robinhood", "Betterment", "Revolut", "Nu Invest", "Coinbase", "Wealthfront"],
    terms: [
      "portfolio performance", "investment statement", "returns overview",
      "profit and loss", "position detail", "investment history", "holdings",
    ],
  },
  {
    title: "Vitrine — home",
    badgeClass: "wsBadge--blue",
    badgeLabel: "Explorar",
    apps: ["Betterment", "Wealthfront", "Acorns", "Trading 212", "Fidelity"],
    terms: [
      "investment dashboard", "portfolio overview", "wealth home", "asset allocation",
    ],
  },
  {
    title: "Pré-trading — habilitação",
    badgeClass: "wsBadge--purple",
    badgeLabel: "Explorar",
    apps: ["Robinhood", "Freetrade", "E*Trade", "Interactive Brokers"],
    terms: [
      "investment onboarding", "account verification", "KYC flow", "investment account setup",
    ],
  },
  {
    title: "Trading — transacional",
    badgeClass: "wsBadge--teal",
    badgeLabel: "Explorar",
    apps: ["Robinhood", "Trading 212", "Freetrade", "Schwab"],
    terms: [
      "buy stocks", "place order", "trade execution", "invest now flow",
    ],
  },
];

export default function Benchmarks() {
  const [savedApps, setSavedApps] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored: string[] = JSON.parse(localStorage.getItem(SAVED_KEY) || "[]");
      setSavedApps(new Set(stored));
    } catch { /* ignore */ }
  }, []);

  function toggleApp(app: string) {
    setSavedApps(prev => {
      const next = new Set(prev);
      if (next.has(app)) {
        next.delete(app);
      } else {
        next.add(app);
      }
      localStorage.setItem(SAVED_KEY, JSON.stringify([...next]));
      return next;
    });
  }

  const allSaved = [...savedApps];

  return (
    <div className="wsBenchmarks">
      <div className="wsPageHeader">
        <h1 className="wsPageTitle">Benchmarks</h1>
        <p className="wsPageSubtitle">Apps e termos Mobbin por etapa · Investimentos PJ</p>
      </div>

      <div className="wsBenchCardGrid">
        {CARDS.map(card => (
          <div key={card.title} className="wsBenchCard wsCard">
            <div className="wsBenchCardHeader">
              <h3 className="wsBenchCardTitle">{card.title}</h3>
              <span className={`wsBadge ${card.badgeClass}`}>{card.badgeLabel}</span>
            </div>

            <div className="wsBenchBlock">
              <p className="wsBenchBlockLabel">Apps</p>
              <div className="wsBenchChips">
                {card.apps.map(app => (
                  <button
                    key={app}
                    className={`wsBenchChip${savedApps.has(app) ? " wsBenchChip--saved" : ""}`}
                    onClick={() => toggleApp(app)}
                    title={savedApps.has(app) ? "Remover" : "Salvar"}
                  >
                    {app}
                  </button>
                ))}
              </div>
            </div>

            <div className="wsBenchBlock">
              <p className="wsBenchBlockLabel">Termos Mobbin</p>
              <div className="wsBenchTerms">
                {card.terms.map(term => (
                  <span key={term} className="wsBadge wsBadge--purple">{term}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {allSaved.length > 0 && (
        <section className="wsBenchSaved">
          <h2 className="wsSectionTitle">Apps salvos</h2>
          <div className="wsBenchSavedList">
            {allSaved.map(app => (
              <button
                key={app}
                className="wsBenchChip wsBenchChip--saved"
                onClick={() => toggleApp(app)}
                title="Remover"
              >
                {app}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
