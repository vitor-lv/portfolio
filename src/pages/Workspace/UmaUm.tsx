import { useState, useEffect } from "react";
import "./UmaUm.css";

const LS_KEY = "lv:umaaum";

interface AcaoItem {
  id: string;
  text: string;
  done: boolean;
}

interface UmaUmEntry {
  id: string;
  date: string;
  com: string;
  pauta: string;
  oQueFoiDito: string;
  acoes: AcaoItem[];
}

function formatDatePtBr(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const PESSOAS_SUGERIDAS = ["Gestor", "GPM", "GTM", "Tech Lead"];

const BLANK_ENTRY: Omit<UmaUmEntry, "id"> = {
  date: new Date().toISOString().slice(0, 10),
  com: "",
  pauta: "",
  oQueFoiDito: "",
  acoes: [],
};

function Detail({
  entry,
  onBack,
  onSave,
  onDelete,
}: {
  entry: UmaUmEntry;
  onBack: () => void;
  onSave: (e: UmaUmEntry) => void;
  onDelete: (id: string) => void;
}) {
  const [draft, setDraft] = useState<UmaUmEntry>({ ...entry, acoes: entry.acoes.map(a => ({ ...a })) });
  const [novaAcao, setNovaAcao] = useState("");
  const [copied, setCopied] = useState(false);

  function setField<K extends keyof UmaUmEntry>(key: K, val: UmaUmEntry[K]) {
    setDraft(prev => ({ ...prev, [key]: val }));
  }

  function addAcao() {
    const text = novaAcao.trim();
    if (!text) return;
    setDraft(prev => ({
      ...prev,
      acoes: [...prev.acoes, { id: Date.now().toString(), text, done: false }],
    }));
    setNovaAcao("");
  }

  function toggleAcao(id: string) {
    setDraft(prev => ({
      ...prev,
      acoes: prev.acoes.map(a => a.id === id ? { ...a, done: !a.done } : a),
    }));
  }

  function removeAcao(id: string) {
    setDraft(prev => ({ ...prev, acoes: prev.acoes.filter(a => a.id !== id) }));
  }

  function handleCopy() {
    const acoesTxt = draft.acoes.length
      ? `\nNext steps:\n${draft.acoes.map(a => `- [${a.done ? "x" : " "}] ${a.text}`).join("\n")}`
      : "";
    const text = `1:1 com ${draft.com} — ${formatDatePtBr(draft.date)}\n\nPauta: ${draft.pauta}\n\n${draft.oQueFoiDito}${acoesTxt}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="wsUmaUmDetail">
      <div className="wsUmaUmDetailNav">
        <button className="wsUmaUmBackBtn" onClick={() => { onSave(draft); onBack(); }}>← Voltar</button>
        <div className="wsUmaUmDetailNavRight">
          <button className="wsUmaUmCopyBtn" onClick={handleCopy}>{copied ? "Copiado ✓" : "Copiar"}</button>
          <button className="wsUmaUmDeleteBtn" onClick={() => { if (confirm("Remover este 1:1?")) onDelete(entry.id); }}>Remover</button>
        </div>
      </div>

      <div className="wsUmaUmForm">
        <div className="wsUmaUmFormRow">
          <label className="wsUmaUmLabel">
            Data
            <input
              type="date"
              className="wsUmaUmInput"
              value={draft.date}
              onChange={e => setField("date", e.target.value)}
            />
          </label>
          <label className="wsUmaUmLabel">
            Com quem
            <input
              className="wsUmaUmInput"
              value={draft.com}
              onChange={e => setField("com", e.target.value)}
              placeholder="Ex: Gestor, GPM..."
              list="wsUmaUmSugestoes"
            />
            <datalist id="wsUmaUmSugestoes">
              {PESSOAS_SUGERIDAS.map(p => <option key={p} value={p} />)}
            </datalist>
          </label>
        </div>

        <label className="wsUmaUmLabel">
          Pauta / objetivo
          <input
            className="wsUmaUmInput"
            value={draft.pauta}
            onChange={e => setField("pauta", e.target.value)}
            placeholder="O que você queria resolver ou comunicar nesse 1:1?"
          />
        </label>

        <label className="wsUmaUmLabel">
          O que foi dito / decidido
          <textarea
            className="wsUmaUmTextarea"
            value={draft.oQueFoiDito}
            onChange={e => setField("oQueFoiDito", e.target.value)}
            placeholder="Contexto dado, alinhamentos feitos, decisões tomadas, feedbacks recebidos..."
            rows={5}
          />
        </label>

        <div className="wsUmaUmAcoesBlock">
          <p className="wsUmaUmAcoesLabel">Next steps</p>
          {draft.acoes.length > 0 && (
            <ul className="wsUmaUmAcoesList">
              {draft.acoes.map(a => (
                <li key={a.id} className="wsUmaUmAcaoItem">
                  <label className="wsUmaUmAcaoCheck">
                    <input type="checkbox" checked={a.done} onChange={() => toggleAcao(a.id)} />
                    <span className={a.done ? "wsUmaUmAcaoText--done" : ""}>{a.text}</span>
                  </label>
                  <button className="wsUmaUmAcaoRemove" onClick={() => removeAcao(a.id)}>✕</button>
                </li>
              ))}
            </ul>
          )}
          <div className="wsUmaUmAcaoAdd">
            <input
              className="wsUmaUmInput"
              value={novaAcao}
              onChange={e => setNovaAcao(e.target.value)}
              placeholder="Adicionar próximo passo..."
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addAcao(); } }}
            />
            <button className="wsUmaUmAddBtn" onClick={addAcao}>+</button>
          </div>
        </div>

        <button
          className="wsUmaUmSaveBtn"
          onClick={() => { onSave(draft); onBack(); }}
        >
          Salvar
        </button>
      </div>
    </div>
  );
}

export default function UmaUm() {
  const [entries, setEntries] = useState<UmaUmEntry[]>([]);
  const [selected, setSelected] = useState<UmaUmEntry | null>(null);

  useEffect(() => {
    try {
      const stored: UmaUmEntry[] = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
      const sorted = [...stored].sort((a, b) => b.date.localeCompare(a.date));
      setEntries(sorted);
    } catch { /* ignore */ }
  }, []);

  function save(updated: UmaUmEntry[]) {
    const sorted = [...updated].sort((a, b) => b.date.localeCompare(a.date));
    setEntries(sorted);
    localStorage.setItem(LS_KEY, JSON.stringify(sorted));
  }

  function handleSave(entry: UmaUmEntry) {
    const existing = entries.find(e => e.id === entry.id);
    if (existing) {
      save(entries.map(e => e.id === entry.id ? entry : e));
    } else {
      save([...entries, entry]);
    }
  }

  function handleDelete(id: string) {
    save(entries.filter(e => e.id !== id));
    setSelected(null);
  }

  function openNew() {
    setSelected({ id: Date.now().toString(), ...BLANK_ENTRY });
  }

  if (selected) {
    return (
      <Detail
        entry={selected}
        onBack={() => setSelected(null)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    );
  }

  // Group entries by person
  const byPerson = entries.reduce<Record<string, UmaUmEntry[]>>((acc, e) => {
    const key = e.com || "Sem nome";
    acc[key] = [...(acc[key] || []), e];
    return acc;
  }, {});

  const pendingActions = entries.flatMap(e => e.acoes.filter(a => !a.done).map(a => ({ ...a, com: e.com, date: e.date, entryId: e.id })));

  return (
    <div className="wsUmaUm">
      <div className="wsPageHeader">
        <h1 className="wsPageTitle">1:1s</h1>
        <p className="wsPageSubtitle">Registro de conversas com gestor, GPM e pares</p>
      </div>

      <div className="wsUmaUmActions">
        <button className="wsUmaUmAddEntryBtn" onClick={openNew}>+ Novo 1:1</button>
      </div>

      {/* Pending actions across all 1:1s */}
      {pendingActions.length > 0 && (
        <section className="wsUmaUmSection">
          <h2 className="wsSectionTitle">Next steps pendentes</h2>
          <div className="wsCard wsUmaUmPendingCard">
            {pendingActions.map(a => (
              <div key={a.id} className="wsUmaUmPendingItem">
                <span className="wsUmaUmPendingText">{a.text}</span>
                <span className="wsBadge wsBadge--purple">{a.com}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {entries.length === 0 ? (
        <div className="wsCard wsUmaUmEmpty">
          <p>Nenhum 1:1 registrado ainda.</p>
          <p className="wsUmaUmEmptyHint">Registre logo após a reunião — pauta, o que foi decidido e próximos passos.</p>
        </div>
      ) : (
        Object.entries(byPerson).map(([person, items]) => (
          <section key={person} className="wsUmaUmSection">
            <h2 className="wsSectionTitle">{person}</h2>
            <div className="wsUmaUmList">
              {items.map(entry => {
                const pending = entry.acoes.filter(a => !a.done).length;
                return (
                  <button key={entry.id} className="wsUmaUmCard wsCard" onClick={() => setSelected(entry)}>
                    <div className="wsUmaUmCardTop">
                      <span className="wsUmaUmCardDate">{formatDatePtBr(entry.date)}</span>
                      {pending > 0 && (
                        <span className="wsBadge wsBadge--amber">{pending} pendente{pending > 1 ? "s" : ""}</span>
                      )}
                    </div>
                    <p className="wsUmaUmCardPauta">{entry.pauta || <em>Sem pauta registrada</em>}</p>
                    {entry.oQueFoiDito && (
                      <p className="wsUmaUmCardPreview">
                        {entry.oQueFoiDito.slice(0, 80)}{entry.oQueFoiDito.length > 80 ? "…" : ""}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

