import { useState, useEffect } from "react";
import "./Historico.css";

interface Ritual {
  id: string;
  week_id: string;
  date: string;
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  q5: string;
  analysis: string;
}

function formatDatePtBr(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const QUESTION_LABELS: [keyof Pick<Ritual, "q1"|"q2"|"q3"|"q4"|"q5">, string][] = [
  ["q1", "O que me propus a fazer essa semana?"],
  ["q2", "O que não fiz — e por quê?"],
  ["q3", "O que está travado agora?"],
  ["q4", "Quais são os 3 próximos passos da semana que vem?"],
  ["q5", "O que preciso comunicar pro time ou gestor?"],
];

function Detail({ ritual, onBack }: { ritual: Ritual; onBack: () => void }) {
  return (
    <div className="wsHistDetail">
      <button className="wsHistBackBtn" onClick={onBack}>← Voltar</button>

      <div className="wsPageHeader">
        <h1 className="wsPageTitle">{formatDatePtBr(ritual.date)}</h1>
        <p className="wsPageSubtitle">Semana de {ritual.week_id}</p>
      </div>

      <div className="wsHistDetailBody">
        {QUESTION_LABELS.map(([key, label]) => (
          <div key={key} className="wsHistDetailQuestion">
            <p className="wsHistDetailLabel">{label}</p>
            <p className="wsHistDetailAnswer">{ritual[key] || <em className="wsHistEmpty">Não respondido</em>}</p>
          </div>
        ))}

        {ritual.analysis && (
          <div className="wsHistAnalysis">
            <p className="wsHistAnalysisLabel">Análise</p>
            <p className="wsHistAnalysisText">{ritual.analysis}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Historico() {
  const [rituals, setRituals] = useState<Ritual[]>([]);
  const [selected, setSelected] = useState<Ritual | null>(null);

  useEffect(() => {
    try {
      const stored: Ritual[] = JSON.parse(localStorage.getItem("lv:rituals") || "[]");
      const sorted = [...stored].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRituals(sorted);
    } catch { /* ignore */ }
  }, []);

  if (selected) {
    return <Detail ritual={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="wsHistorico">
      <div className="wsPageHeader">
        <h1 className="wsPageTitle">Histórico</h1>
        <p className="wsPageSubtitle">
          {rituals.length === 0
            ? "Nenhuma semana registrada ainda"
            : `${rituals.length} ${rituals.length === 1 ? "semana registrada" : "semanas registradas"}`}
        </p>
      </div>

      {rituals.length === 0 ? (
        <div className="wsCard wsHistEmpty">
          <p>Nenhum ritual registrado ainda. Complete a página <strong>Semana</strong> para começar.</p>
        </div>
      ) : (
        <ul className="wsHistList">
          {rituals.map(ritual => (
            <li key={ritual.id}>
              <button
                className="wsHistCard"
                onClick={() => setSelected(ritual)}
              >
                <div className="wsHistCardTop">
                  <span className="wsHistCardDate">{formatDatePtBr(ritual.date)}</span>
                  <span className={`wsBadge ${ritual.q3.trim() ? "wsBadge--amber" : "wsBadge--green"}`}>
                    {ritual.q3.trim() ? "Bloqueio" : "Fluindo"}
                  </span>
                </div>
                <p className="wsHistCardPreview">
                  {ritual.q1 ? ritual.q1.slice(0, 80) + (ritual.q1.length > 80 ? "…" : "") : <em>Sem resposta</em>}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

