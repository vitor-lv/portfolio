import { useState, useEffect } from "react";
import "./Planos.css";
import { useSpace } from "../../contexts/WorkspaceSpaceContext";

const PCT_KEY     = "lv:chegada_pct";
const ENTRADA_KEY = "lv:data_entrada";
const PDI_KEY     = "lv:pdi";
const CHEGADA_KEY = "lv:chegada_items";
const PLANO90_KEY = "lv:plano90";

interface PdiData {
  forcas: string[];
  desenvolver: string[];
  oportunidades: string;
  ameaca: string;
}

interface ChegadaItem {
  id: string;
  week: 1 | 2;
  text: string;
}

interface Plano90Row {
  id: string;
  label: string;
  title: string;
  como: string;
  badgeClass: string;
  accentColor: string;
}

const BADGE_OPTIONS = [
  { label: "Azul",     badgeClass: "wsBadge--blue",   accentColor: "#185FA5" },
  { label: "Roxo",     badgeClass: "wsBadge--purple",  accentColor: "#3C3489" },
  { label: "Teal",     badgeClass: "wsBadge--teal",    accentColor: "#0F6E56" },
  { label: "Verde",    badgeClass: "wsBadge--green",   accentColor: "#3B6D11" },
  { label: "Âmbar",   badgeClass: "wsBadge--amber",   accentColor: "#854F0B" },
  { label: "Vermelho", badgeClass: "wsBadge--red",     accentColor: "#A32D2D" },
];

const EMPTY_PDI: PdiData = { forcas: [], desenvolver: [], oportunidades: "", ameaca: "" };

const DEFAULT_PDI: PdiData = {
  forcas: ["Visual design", "Construção de parcerias", "Gestão de pessoas", "Poder de execução", "Autonomia"],
  desenvolver: ["Proatividade", "Procrastinação", "Ser mais propositivo", "Pontes além da gerência"],
  oportunidades: "Mapear reuniões e stakeholders estratégicos. Construir voz na tríade GPM · GTM · GDM.",
  ameaca: "Ter boas ideias mas não executar a tempo.",
};

const DEFAULT_CHEGADA: ChegadaItem[] = [
  { id: "c1", week: 1, text: "Montar FigJam base de investimentos PJ com gaps e benchmarks" },
  { id: "c2", week: 1, text: "Escrever tese de entrada sobre o problema" },
  { id: "c3", week: 1, text: "Preparar perguntas pro primeiro 1:1 com gestor" },
  { id: "c4", week: 2, text: "Estruturar ritual semanal e weekly do time" },
  { id: "c5", week: 2, text: "Mapear stakeholders e reuniões estratégicas" },
  { id: "c6", week: 2, text: "Preparar apresentação pra GPM como par estratégico" },
];

const DEFAULT_90: Plano90Row[] = [
  { id: "r1", label: "Dias 1–30",  title: "Diagnóstico da jornada atual",   como: "FigJam com dados de funil, gaps, wayouts e atendimento",                  badgeClass: "wsBadge--blue",   accentColor: "#185FA5" },
  { id: "r2", label: "Dias 30–60", title: "Quick win — pós-venda mobile",    como: "Extrato + rentabilidade + posição. Reuso das APIs e jornadas do Private", badgeClass: "wsBadge--purple",  accentColor: "#3C3489" },
  { id: "r3", label: "Dias 60–90", title: "Visão de chassi unificado",        como: "Arquitetura de jornada única. Deck pra gestor e GPM",                     badgeClass: "wsBadge--teal",    accentColor: "#0F6E56" },
  { id: "r4", label: "Contínuo",   title: "Voz estratégica na tríade",        como: "Reuniões com benchmarks e ponto de vista sobre OKRs",                     badgeClass: "wsBadge--green",   accentColor: "#3B6D11" },
  { id: "r5", label: "Fim 2025",   title: "Posicionamento para gerência",     como: "Acúmulo de entregas visíveis ao longo do ano",                            badgeClass: "wsBadge--amber",   accentColor: "#854F0B" },
];

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

function isPdiEmpty(p: PdiData) {
  return !p.forcas.length && !p.desenvolver.length && !p.oportunidades && !p.ameaca;
}

export default function Planos() {
  const { k, space } = useSpace();

  // Data
  const [pdi, setPdi]               = useState<PdiData>(EMPTY_PDI);
  const [chegadaItems, setChegadaItems] = useState<ChegadaItem[]>([]);
  const [plano90, setPlano90]        = useState<Plano90Row[]>([]);
  const [chegadaPct, setChegadaPct]  = useState<Record<string, number>>({});
  const [entrada, setEntrada]        = useState("");
  const [editingEntrada, setEditingEntrada] = useState(false);
  const [loaded, setLoaded]          = useState(false);

  // PDI edit
  const [editingPdi, setEditingPdi]  = useState(false);
  const [pdiDraft, setPdiDraft]      = useState<PdiData>(EMPTY_PDI);
  const [newForca, setNewForca]      = useState("");
  const [newDesenv, setNewDesenv]    = useState("");

  // Chegada edit
  const [editingChegadaId, setEditingChegadaId] = useState<string | null>(null);
  const [chegadaEditText, setChegadaEditText]    = useState("");
  const [addingChegadaWeek, setAddingChegadaWeek] = useState<1 | 2 | null>(null);
  const [newChegadaText, setNewChegadaText]       = useState("");

  // 90 dias edit
  const [editing90Id, setEditing90Id] = useState<string | null>(null);
  const [row90Draft, setRow90Draft]   = useState<Omit<Plano90Row, "id">>({
    label: "", title: "", como: "", badgeClass: "wsBadge--blue", accentColor: "#185FA5",
  });

  useEffect(() => {
    try {
      const storedPdi = localStorage.getItem(k(PDI_KEY));
      setPdi(storedPdi ? JSON.parse(storedPdi) : (space === "itau" ? DEFAULT_PDI : EMPTY_PDI));

      const storedChegada = localStorage.getItem(k(CHEGADA_KEY));
      setChegadaItems(storedChegada ? JSON.parse(storedChegada) : (space === "itau" ? DEFAULT_CHEGADA : []));

      const storedPlano90 = localStorage.getItem(k(PLANO90_KEY));
      setPlano90(storedPlano90 ? JSON.parse(storedPlano90) : (space === "itau" ? DEFAULT_90 : []));

      setChegadaPct(JSON.parse(localStorage.getItem(k(PCT_KEY)) || "{}"));
      setEntrada(localStorage.getItem(k(ENTRADA_KEY)) || "");
    } catch { /* ignore */ }
    setLoaded(true);
  }, [k, space]);

  // ── PDI ──────────────────────────────────────────────────
  function savePdi(data: PdiData) {
    setPdi(data);
    localStorage.setItem(k(PDI_KEY), JSON.stringify(data));
  }

  function startEditPdi() {
    setPdiDraft({ ...pdi, forcas: [...pdi.forcas], desenvolver: [...pdi.desenvolver] });
    setNewForca("");
    setNewDesenv("");
    setEditingPdi(true);
  }

  function commitPdi() {
    savePdi(pdiDraft);
    setEditingPdi(false);
  }

  function addForca() {
    if (!newForca.trim()) return;
    setPdiDraft(d => ({ ...d, forcas: [...d.forcas, newForca.trim()] }));
    setNewForca("");
  }

  function addDesenv() {
    if (!newDesenv.trim()) return;
    setPdiDraft(d => ({ ...d, desenvolver: [...d.desenvolver, newDesenv.trim()] }));
    setNewDesenv("");
  }

  // ── Chegada ───────────────────────────────────────────────
  function saveChegada(items: ChegadaItem[]) {
    setChegadaItems(items);
    localStorage.setItem(k(CHEGADA_KEY), JSON.stringify(items));
  }

  function savePct(id: string, val: number) {
    const next = { ...chegadaPct, [id]: Math.min(100, Math.max(0, val)) };
    setChegadaPct(next);
    localStorage.setItem(k(PCT_KEY), JSON.stringify(next));
  }

  function saveChegadaEdit() {
    if (!chegadaEditText.trim() || !editingChegadaId) return;
    saveChegada(chegadaItems.map(i => i.id === editingChegadaId ? { ...i, text: chegadaEditText.trim() } : i));
    setEditingChegadaId(null);
  }

  function deleteChegadaItem(id: string) {
    saveChegada(chegadaItems.filter(i => i.id !== id));
    if (editingChegadaId === id) setEditingChegadaId(null);
  }

  function addChegadaItem(week: 1 | 2) {
    if (!newChegadaText.trim()) return;
    saveChegada([...chegadaItems, { id: uid(), week, text: newChegadaText.trim() }]);
    setNewChegadaText("");
    setAddingChegadaWeek(null);
  }

  // ── 90 dias ───────────────────────────────────────────────
  function savePlano90(rows: Plano90Row[]) {
    setPlano90(rows);
    localStorage.setItem(k(PLANO90_KEY), JSON.stringify(rows));
  }

  function startEdit90(row: Plano90Row) {
    setEditing90Id(row.id);
    setRow90Draft({ label: row.label, title: row.title, como: row.como, badgeClass: row.badgeClass, accentColor: row.accentColor });
  }

  function saveEdit90() {
    if (!row90Draft.title.trim()) return;
    if (editing90Id === "new") {
      savePlano90([...plano90, { id: uid(), ...row90Draft }]);
    } else {
      savePlano90(plano90.map(r => r.id === editing90Id ? { ...r, ...row90Draft } : r));
    }
    setEditing90Id(null);
  }

  function startAdd90() {
    setEditing90Id("new");
    setRow90Draft({ label: "", title: "", como: "", badgeClass: "wsBadge--blue", accentColor: "#185FA5" });
  }

  function saveEntrada(value: string) {
    setEntrada(value);
    localStorage.setItem(k(ENTRADA_KEY), value);
    setEditingEntrada(false);
  }

  const week1 = chegadaItems.filter(i => i.week === 1);
  const week2 = chegadaItems.filter(i => i.week === 2);

  if (!loaded) return null;

  return (
    <div className="wsPlanos">
      <div className="wsPageHeader">
        <h1 className="wsPageTitle">Planos</h1>
        <p className="wsPageSubtitle">PDI · Chegada · 90 dias</p>
      </div>

      {/* ── PDI ───────────────────────────────────────────── */}
      <section className="wsPlanosSection">
        <div className="wsPlanosSecHeader">
          <h2 className="wsSectionTitle">PDI 2025</h2>
          {!editingPdi && (
            <button className="wsPlanosMutedBtn" onClick={startEditPdi}>
              {isPdiEmpty(pdi) ? "+ Preencher" : "Editar"}
            </button>
          )}
        </div>

        {isPdiEmpty(pdi) && !editingPdi ? (
          <div className="wsCard wsPlanoEmptyCard">
            <p className="wsPlanoEmptyText">Nenhum dado de PDI ainda.</p>
            <p className="wsPlanoEmptyHint">Forças, pontos a desenvolver, oportunidades e ameaças.</p>
            <button className="wsPlanosActionBtn" onClick={startEditPdi}>+ Preencher PDI</button>
          </div>
        ) : editingPdi ? (
          <div className="wsCard wsPdiEditCard">
            <div className="wsPdiEditSection">
              <p className="wsPdiCardLabel">Forças</p>
              <div className="wsPdiTags">
                {pdiDraft.forcas.map((tag, i) => (
                  <button
                    key={i}
                    className="wsBadge wsBadge--green wsPdiTagRemove"
                    onClick={() => setPdiDraft(d => ({ ...d, forcas: d.forcas.filter((_, j) => j !== i) }))}
                  >
                    {tag} ×
                  </button>
                ))}
              </div>
              <div className="wsPdiTagAdd">
                <input
                  className="wsPlanosInput"
                  value={newForca}
                  onChange={e => setNewForca(e.target.value)}
                  placeholder="Adicionar força..."
                  onKeyDown={e => e.key === "Enter" && addForca()}
                />
                <button className="wsPlanosMutedBtn" onClick={addForca}>+</button>
              </div>
            </div>

            <div className="wsPdiEditSection">
              <p className="wsPdiCardLabel">Desenvolver</p>
              <div className="wsPdiTags">
                {pdiDraft.desenvolver.map((tag, i) => (
                  <button
                    key={i}
                    className="wsBadge wsBadge--amber wsPdiTagRemove"
                    onClick={() => setPdiDraft(d => ({ ...d, desenvolver: d.desenvolver.filter((_, j) => j !== i) }))}
                  >
                    {tag} ×
                  </button>
                ))}
              </div>
              <div className="wsPdiTagAdd">
                <input
                  className="wsPlanosInput"
                  value={newDesenv}
                  onChange={e => setNewDesenv(e.target.value)}
                  placeholder="Adicionar item..."
                  onKeyDown={e => e.key === "Enter" && addDesenv()}
                />
                <button className="wsPlanosMutedBtn" onClick={addDesenv}>+</button>
              </div>
            </div>

            <div className="wsPdiEditSection">
              <p className="wsPdiCardLabel">Oportunidades</p>
              <textarea
                className="wsPlanosTextarea"
                value={pdiDraft.oportunidades}
                onChange={e => setPdiDraft(d => ({ ...d, oportunidades: e.target.value }))}
                placeholder="Descreva as oportunidades..."
                rows={2}
              />
            </div>

            <div className="wsPdiEditSection">
              <p className="wsPdiCardLabel">Ameaça</p>
              <textarea
                className="wsPlanosTextarea"
                value={pdiDraft.ameaca}
                onChange={e => setPdiDraft(d => ({ ...d, ameaca: e.target.value }))}
                placeholder="Descreva a ameaça..."
                rows={2}
              />
            </div>

            <div className="wsPdiEditActions">
              {space === "itau" && (
                <button
                  className="wsPlanosDangerBtn"
                  onClick={() => setPdiDraft({ ...DEFAULT_PDI, forcas: [...DEFAULT_PDI.forcas], desenvolver: [...DEFAULT_PDI.desenvolver] })}
                >
                  Resetar padrão
                </button>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                <button className="wsPlanosMutedBtn" onClick={() => setEditingPdi(false)}>Cancelar</button>
                <button className="wsPlanosActionBtn" onClick={commitPdi}>Salvar</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="wsPdiGrid">
            <div className="wsCard">
              <p className="wsPdiCardLabel">Forças</p>
              <div className="wsPdiTags">
                {pdi.forcas.map(tag => <span key={tag} className="wsBadge wsBadge--green">{tag}</span>)}
              </div>
            </div>
            <div className="wsCard">
              <p className="wsPdiCardLabel">Desenvolver</p>
              <div className="wsPdiTags">
                {pdi.desenvolver.map(tag => <span key={tag} className="wsBadge wsBadge--amber">{tag}</span>)}
              </div>
            </div>
            <div className="wsCard">
              <p className="wsPdiCardLabel">Oportunidades</p>
              <p className="wsPdiCardText">{pdi.oportunidades}</p>
            </div>
            <div className="wsCard">
              <p className="wsPdiCardLabel">Ameaça</p>
              <p className="wsPdiCardText wsPdiCardText--red">{pdi.ameaca}</p>
            </div>
          </div>
        )}
      </section>

      {/* ── Chegada ───────────────────────────────────────── */}
      <section className="wsPlanosSection">
        <h2 className="wsSectionTitle">Chegada — primeiras 2 semanas</h2>

        {chegadaItems.length === 0 && addingChegadaWeek === null ? (
          <div className="wsCard wsPlanoEmptyCard">
            <p className="wsPlanoEmptyText">Nenhum item de chegada ainda.</p>
            <p className="wsPlanoEmptyHint">Adicione tarefas para as primeiras duas semanas.</p>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="wsPlanosActionBtn" onClick={() => setAddingChegadaWeek(1)}>+ Semana 1</button>
              <button className="wsPlanosActionBtn" onClick={() => setAddingChegadaWeek(2)}>+ Semana 2</button>
            </div>
          </div>
        ) : chegadaItems.length === 0 && addingChegadaWeek !== null ? (
          <div className="wsCard wsPlanoEmptyCard">
            <p className="wsPlanoEmptyText">Semana {addingChegadaWeek}</p>
            <div className="wsChegadaAddForm">
              <input
                className="wsPlanosInput"
                value={newChegadaText}
                onChange={e => setNewChegadaText(e.target.value)}
                placeholder="Descreva a tarefa..."
                autoFocus
                onKeyDown={e => {
                  if (e.key === "Enter") addChegadaItem(addingChegadaWeek!);
                  if (e.key === "Escape") { setAddingChegadaWeek(null); setNewChegadaText(""); }
                }}
              />
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button className="wsPlanosMutedBtn" onClick={() => { setAddingChegadaWeek(null); setNewChegadaText(""); }}>Cancelar</button>
                <button className="wsPlanosActionBtn" onClick={() => addChegadaItem(addingChegadaWeek!)}>Adicionar</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="wsCard">
            {/* Week 1 */}
            {(week1.length > 0 || addingChegadaWeek === 1) && (
              <div className="wsChegadaBlock">
                <div className="wsChegadaHeader">
                  <span className="wsChegadaWeek">Semana 1 — preparação estratégica</span>
                  <span className="wsBadge wsBadge--blue">Agora</span>
                </div>
                <ul className="wsChegadaList">
                  {week1.map(item => {
                    const pct = chegadaPct[item.id] ?? 0;
                    const isEdit = editingChegadaId === item.id;
                    return (
                      <li key={item.id} className="wsChegadaItem">
                        {isEdit ? (
                          <div className="wsChegadaEditRow">
                            <input
                              className="wsPlanosInput"
                              value={chegadaEditText}
                              onChange={e => setChegadaEditText(e.target.value)}
                              autoFocus
                              onKeyDown={e => { if (e.key === "Enter") saveChegadaEdit(); if (e.key === "Escape") setEditingChegadaId(null); }}
                            />
                            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                              <button className="wsPlanosMutedBtn" onClick={() => setEditingChegadaId(null)}>✕</button>
                              <button className="wsPlanosActionBtn" onClick={saveChegadaEdit}>✓</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <button className="wsChegadaEditBtn" onClick={() => { setEditingChegadaId(item.id); setChegadaEditText(item.text); }}>✎</button>
                            <span className={pct === 100 ? "wsChegadaText--done" : ""}>{item.text}</span>
                            <div className="wsChegadaPctWrap">
                              <input
                                type="number" min="0" max="100"
                                value={pct}
                                onChange={e => savePct(item.id, Number(e.target.value))}
                                className="wsChegadaPctInput"
                              />
                              <span className="wsChegadaPctSign">%</span>
                              <button className="wsChegadaDeleteBtn" onClick={() => deleteChegadaItem(item.id)}>×</button>
                            </div>
                          </>
                        )}
                      </li>
                    );
                  })}
                </ul>
                {addingChegadaWeek === 1 ? (
                  <div className="wsChegadaAddForm">
                    <input
                      className="wsPlanosInput"
                      value={newChegadaText}
                      onChange={e => setNewChegadaText(e.target.value)}
                      placeholder="Descreva a tarefa..."
                      autoFocus
                      onKeyDown={e => { if (e.key === "Enter") addChegadaItem(1); if (e.key === "Escape") { setAddingChegadaWeek(null); setNewChegadaText(""); } }}
                    />
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                      <button className="wsPlanosMutedBtn" onClick={() => { setAddingChegadaWeek(null); setNewChegadaText(""); }}>Cancelar</button>
                      <button className="wsPlanosActionBtn" onClick={() => addChegadaItem(1)}>Adicionar</button>
                    </div>
                  </div>
                ) : (
                  <button className="wsChegadaAddBtn" onClick={() => { setAddingChegadaWeek(1); setNewChegadaText(""); }}>+ Adicionar</button>
                )}
              </div>
            )}

            {week1.length > 0 && week2.length > 0 && <div className="wsDivider" />}

            {/* Week 2 */}
            {(week2.length > 0 || addingChegadaWeek === 2) && (
              <div className="wsChegadaBlock">
                <div className="wsChegadaHeader">
                  <span className="wsChegadaWeek">Semana 2 — preparação operacional</span>
                  <span className="wsBadge wsBadge--purple">Em breve</span>
                </div>
                <ul className="wsChegadaList">
                  {week2.map(item => {
                    const pct = chegadaPct[item.id] ?? 0;
                    const isEdit = editingChegadaId === item.id;
                    return (
                      <li key={item.id} className="wsChegadaItem">
                        {isEdit ? (
                          <div className="wsChegadaEditRow">
                            <input
                              className="wsPlanosInput"
                              value={chegadaEditText}
                              onChange={e => setChegadaEditText(e.target.value)}
                              autoFocus
                              onKeyDown={e => { if (e.key === "Enter") saveChegadaEdit(); if (e.key === "Escape") setEditingChegadaId(null); }}
                            />
                            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                              <button className="wsPlanosMutedBtn" onClick={() => setEditingChegadaId(null)}>✕</button>
                              <button className="wsPlanosActionBtn" onClick={saveChegadaEdit}>✓</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <button className="wsChegadaEditBtn" onClick={() => { setEditingChegadaId(item.id); setChegadaEditText(item.text); }}>✎</button>
                            <span className={pct === 100 ? "wsChegadaText--done" : ""}>{item.text}</span>
                            <div className="wsChegadaPctWrap">
                              <input
                                type="number" min="0" max="100"
                                value={pct}
                                onChange={e => savePct(item.id, Number(e.target.value))}
                                className="wsChegadaPctInput"
                              />
                              <span className="wsChegadaPctSign">%</span>
                              <button className="wsChegadaDeleteBtn" onClick={() => deleteChegadaItem(item.id)}>×</button>
                            </div>
                          </>
                        )}
                      </li>
                    );
                  })}
                </ul>
                {addingChegadaWeek === 2 ? (
                  <div className="wsChegadaAddForm">
                    <input
                      className="wsPlanosInput"
                      value={newChegadaText}
                      onChange={e => setNewChegadaText(e.target.value)}
                      placeholder="Descreva a tarefa..."
                      autoFocus
                      onKeyDown={e => { if (e.key === "Enter") addChegadaItem(2); if (e.key === "Escape") { setAddingChegadaWeek(null); setNewChegadaText(""); } }}
                    />
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                      <button className="wsPlanosMutedBtn" onClick={() => { setAddingChegadaWeek(null); setNewChegadaText(""); }}>Cancelar</button>
                      <button className="wsPlanosActionBtn" onClick={() => addChegadaItem(2)}>Adicionar</button>
                    </div>
                  </div>
                ) : (
                  <button className="wsChegadaAddBtn" onClick={() => { setAddingChegadaWeek(2); setNewChegadaText(""); }}>+ Adicionar</button>
                )}
              </div>
            )}

            {/* Show add week buttons if one week still has no items */}
            {(week1.length === 0 && addingChegadaWeek !== 1) && (
              <button className="wsChegadaAddBtn" onClick={() => { setAddingChegadaWeek(1); setNewChegadaText(""); }}>+ Semana 1</button>
            )}
            {(week2.length === 0 && addingChegadaWeek !== 2) && (
              <button className="wsChegadaAddBtn" onClick={() => { setAddingChegadaWeek(2); setNewChegadaText(""); }}>+ Semana 2</button>
            )}
          </div>
        )}
      </section>

      {/* ── Plano 90 dias ─────────────────────────────────── */}
      <section className="wsPlanosSection">
        <div className="ws90Header">
          <h2 className="wsSectionTitle">Plano 90 dias</h2>
          <div className="ws90EntradaRow">
            {editingEntrada ? (
              <input
                type="date"
                className="ws90EntradaInput"
                defaultValue={entrada}
                autoFocus
                onKeyDown={e => { if (e.key === "Enter") saveEntrada((e.target as HTMLInputElement).value); if (e.key === "Escape") setEditingEntrada(false); }}
                onBlur={e => saveEntrada(e.target.value)}
              />
            ) : (
              <button className="ws90EntradaBtn" onClick={() => setEditingEntrada(true)}>
                {entrada
                  ? `Entrada: ${new Date(entrada + "T12:00:00").toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" })} ✎`
                  : "Definir data de entrada →"}
              </button>
            )}
          </div>
        </div>

        {plano90.length === 0 && editing90Id !== "new" ? (
          <div className="wsCard wsPlanoEmptyCard">
            <p className="wsPlanoEmptyText">Nenhuma fase definida ainda.</p>
            <p className="wsPlanoEmptyHint">Adicione as fases do plano de 90 dias.</p>
            <button className="wsPlanosActionBtn" onClick={startAdd90}>+ Adicionar fase</button>
          </div>
        ) : (
          <>
            <div className="ws90Table">
              {plano90.map(row => {
                const isEditing = editing90Id === row.id;
                return (
                  <div key={row.id}>
                    {isEditing ? (
                      <div className="ws90EditForm">
                        <div className="ws90EditGrid">
                          <label className="ws90EditLabel">
                            Fase
                            <input className="wsPlanosInput" value={row90Draft.title} onChange={e => setRow90Draft(d => ({ ...d, title: e.target.value }))} placeholder="Ex: Diagnóstico da jornada" autoFocus />
                          </label>
                          <label className="ws90EditLabel">
                            Período
                            <input className="wsPlanosInput" value={row90Draft.label} onChange={e => setRow90Draft(d => ({ ...d, label: e.target.value }))} placeholder="Ex: Dias 1–30" />
                          </label>
                        </div>
                        <label className="ws90EditLabel">
                          Como
                          <textarea className="wsPlanosTextarea" value={row90Draft.como} onChange={e => setRow90Draft(d => ({ ...d, como: e.target.value }))} placeholder="Descreva como será feito..." rows={2} />
                        </label>
                        <label className="ws90EditLabel">
                          Cor
                          <select
                            className="ws90ColorSelect"
                            value={row90Draft.badgeClass}
                            onChange={e => {
                              const opt = BADGE_OPTIONS.find(o => o.badgeClass === e.target.value);
                              if (opt) setRow90Draft(d => ({ ...d, badgeClass: opt.badgeClass, accentColor: opt.accentColor }));
                            }}
                          >
                            {BADGE_OPTIONS.map(o => <option key={o.badgeClass} value={o.badgeClass}>{o.label}</option>)}
                          </select>
                        </label>
                        <div className="ws90EditActions">
                          <button className="wsPlanosDangerBtn" onClick={() => { if (confirm("Remover esta fase?")) { savePlano90(plano90.filter(r => r.id !== row.id)); setEditing90Id(null); } }}>Remover</button>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button className="wsPlanosMutedBtn" onClick={() => setEditing90Id(null)}>Cancelar</button>
                            <button className="wsPlanosActionBtn" onClick={saveEdit90}>Salvar</button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="ws90Row" style={{ borderLeftColor: row.accentColor }}>
                        <div className="ws90RowMain">
                          <span className="ws90RowTitle">{row.title}</span>
                          <span className="ws90RowComo">{row.como}</span>
                        </div>
                        <div className="ws90RowWhen">
                          <span className={`wsBadge ${row.badgeClass}`}>{row.label}</span>
                          <button className="wsPlanosMutedBtn" onClick={() => startEdit90(row)}>Editar</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {editing90Id === "new" && (
                <div className="ws90EditForm">
                  <div className="ws90EditGrid">
                    <label className="ws90EditLabel">
                      Fase
                      <input className="wsPlanosInput" value={row90Draft.title} onChange={e => setRow90Draft(d => ({ ...d, title: e.target.value }))} placeholder="Ex: Diagnóstico da jornada" autoFocus />
                    </label>
                    <label className="ws90EditLabel">
                      Período
                      <input className="wsPlanosInput" value={row90Draft.label} onChange={e => setRow90Draft(d => ({ ...d, label: e.target.value }))} placeholder="Ex: Dias 1–30" />
                    </label>
                  </div>
                  <label className="ws90EditLabel">
                    Como
                    <textarea className="wsPlanosTextarea" value={row90Draft.como} onChange={e => setRow90Draft(d => ({ ...d, como: e.target.value }))} placeholder="Descreva como será feito..." rows={2} />
                  </label>
                  <label className="ws90EditLabel">
                    Cor
                    <select
                      className="ws90ColorSelect"
                      value={row90Draft.badgeClass}
                      onChange={e => {
                        const opt = BADGE_OPTIONS.find(o => o.badgeClass === e.target.value);
                        if (opt) setRow90Draft(d => ({ ...d, badgeClass: opt.badgeClass, accentColor: opt.accentColor }));
                      }}
                    >
                      {BADGE_OPTIONS.map(o => <option key={o.badgeClass} value={o.badgeClass}>{o.label}</option>)}
                    </select>
                  </label>
                  <div className="ws90EditActions">
                    <div />
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="wsPlanosMutedBtn" onClick={() => setEditing90Id(null)}>Cancelar</button>
                      <button className="wsPlanosActionBtn" onClick={saveEdit90}>Adicionar</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {editing90Id !== "new" && (
              <button className="wsPlanoAddRowBtn" onClick={startAdd90}>+ Adicionar fase</button>
            )}
          </>
        )}
      </section>
    </div>
  );
}

