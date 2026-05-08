import { useState, useEffect, type FormEvent } from "react";
import "./Semana.css";

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

function getWeekId(date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split("T")[0];
}

function formatDatePtBr(date = new Date()): string {
  return date.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const QUESTIONS = [
  { key: "q1", badge: "wsBadge--amber", num: "1", label: "O que me propus a fazer essa semana?", placeholder: "Principais compromissos da semana..." },
  { key: "q2", badge: "wsBadge--red",   num: "2", label: "O que não fiz — e por quê?",           placeholder: "Sem julgamento. Faltou info? Travou no vago?" },
  { key: "q3", badge: "wsBadge--blue",  num: "3", label: "O que está travado agora?",             placeholder: "O que você está evitando ou empurrando?" },
  { key: "q4", badge: "wsBadge--green", num: "4", label: "Quais são os 3 próximos passos da semana que vem?", placeholder: "Concretos e pequenos. Não 'montar FigJam' — mas 'abrir FigJam e jogar os 3 fluxos'..." },
  { key: "q5", badge: "wsBadge--purple",num: "5", label: "O que preciso comunicar pro time ou gestor?", placeholder: "Quem precisa saber antes de você terminar?" },
] as const;

type QuestionKey = "q1" | "q2" | "q3" | "q4" | "q5";

export default function Semana() {
  const currentWeekId = getWeekId();

  const [answers, setAnswers] = useState<Record<QuestionKey, string>>({ q1: "", q2: "", q3: "", q4: "", q5: "" });
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const rituals: Ritual[] = JSON.parse(localStorage.getItem("lv:rituals") || "[]");
      const thisWeek = rituals.find(r => r.week_id === currentWeekId);
      if (thisWeek) {
        setAnswers({ q1: thisWeek.q1, q2: thisWeek.q2, q3: thisWeek.q3, q4: thisWeek.q4, q5: thisWeek.q5 });
        setAnalysis(thisWeek.analysis);
        setSaved(true);
      }
    } catch { /* ignore */ }
  }, [currentWeekId]);

  function setAnswer(key: QuestionKey, value: string) {
    setAnswers(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (saved) return;
    setLoading(true);
    setError("");

    const respostas = `Semana de ${currentWeekId}

1. O que me propus a fazer essa semana?
${answers.q1}

2. O que não fiz — e por quê?
${answers.q2}

3. O que está travado agora?
${answers.q3}

4. Quais são os 3 próximos passos da semana que vem?
${answers.q4}

5. O que preciso comunicar pro time ou gestor?
${answers.q5}`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `Você é parceiro de desenvolvimento profissional de LV, coordenador de design no Banco Itaú assumindo a vaga de design lead de investimentos PJ. Contexto: 90% da experiência de investimentos ainda não existe no mobile. Maior gap é o pós-venda (sem extrato, sem rentabilidade, sem visão consolidada). LV trabalha com uma GPM e quer chegada impactante e promoção até fim de 2025. Padrão a eliminar: começa com alta energia, trava quando falta info, procrastina, entrega ótimo resultado mas gera pânico no time pelo silêncio.

Analise o ritual em 3 partes curtas (sem markdown, sem asteriscos, sem títulos):
- Padrão da semana (1-2 frases)
- Maior risco ou bloqueio real (1-2 frases)
- Um próximo passo concreto pra destravar (1 frase)

Seja direto, fale como parceiro, sem elogios.`,
          messages: [{ role: "user", content: respostas }],
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({})) as { error?: { message?: string } };
        throw new Error(errData?.error?.message || `Erro ${res.status}`);
      }

      const data = await res.json() as { content?: { text?: string }[] };
      const aiText = data.content?.[0]?.text || "";
      setAnalysis(aiText);

      const ritual: Ritual = {
        id: Date.now().toString(),
        week_id: currentWeekId,
        date: new Date().toISOString(),
        ...answers,
        analysis: aiText,
      };

      const existing: Ritual[] = JSON.parse(localStorage.getItem("lv:rituals") || "[]");
      const updated = [...existing.filter(r => r.week_id !== currentWeekId), ritual];
      localStorage.setItem("lv:rituals", JSON.stringify(updated));
      setSaved(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao analisar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="wsSemanaPage">
      <div className="wsPageHeader">
        <h1 className="wsPageTitle">Ritual de sexta</h1>
        <p className="wsPageSubtitle">{formatDatePtBr()}</p>
      </div>

      <form className="wsSemanaForm" onSubmit={handleSubmit}>
        {QUESTIONS.map(q => (
          <div key={q.key} className="wsSemanaQuestion">
            <div className="wsSemanaQuestionLabel">
              <span className={`wsBadge ${q.badge}`}>{q.num}</span>
              <span className="wsSemanaQuestionText">{q.label}</span>
            </div>
            <textarea
              className="wsSemanaTextarea"
              value={answers[q.key]}
              onChange={e => setAnswer(q.key, e.target.value)}
              placeholder={q.placeholder}
              rows={3}
              disabled={saved}
            />
          </div>
        ))}

        {error && <p className="wsSemanaError">{error}</p>}

        <button
          type="submit"
          className={`wsSemanaBtn${saved ? " wsSemanaBtn--saved" : ""}`}
          disabled={saved || loading}
        >
          {loading ? "Analisando..." : saved ? "Salvo ✓" : "Analisar com IA ↗"}
        </button>
      </form>

      {analysis && (
        <div className="wsSemanaAnalysis">
          <p className="wsSemanaAnalysisLabel">Análise</p>
          <p className="wsSemanaAnalysisText">{analysis}</p>
        </div>
      )}
    </div>
  );
}

