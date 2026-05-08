import { useState, useEffect } from "react";
import "./Stakeholders.css";

const LS_KEY = "lv:stakeholders";

type Influence = "alta" | "media" | "baixa";
type Relacao = "aliado" | "neutro" | "atento";

interface Stakeholder {
  id: string;
  nome: string;
  papel: string;
  area: string;
  influencia: Influence;
  relacao: Relacao;
  notas: string;
}

const INFLUENCE_BADGE: Record<Influence, string> = {
  alta: "wsBadge--red",
  media: "wsBadge--amber",
  baixa: "wsBadge--blue",
};

const RELACAO_BADGE: Record<Relacao, string> = {
  aliado: "wsBadge--green",
  neutro: "wsBadge--purple",
  atento: "wsBadge--amber",
};

const RELACAO_LABEL: Record<Relacao, string> = {
  aliado: "Aliado",
  neutro: "Neutro",
  atento: "Atenção",
};

const BLANK: Omit<Stakeholder, "id"> = {
  nome: "",
  papel: "",
  area: "",
  influencia: "media",
  relacao: "neutro",
  notas: "",
};

export default function Stakeholders() {
  const [list, setList] = useState<Stakeholder[]>([]);
  const [editing, setEditing] = useState<Stakeholder | null>(null);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    try {
      setList(JSON.parse(localStorage.getItem(LS_KEY) || "[]"));
    } catch { /* ignore */ }
  }, []);

  function save(updated: Stakeholder[]) {
    setList(updated);
    localStorage.setItem(LS_KEY, JSON.stringify(updated));
  }

  function openNew() {
    setEditing({ id: Date.now().toString(), ...BLANK });
    setIsNew(true);
  }

  function openEdit(s: Stakeholder) {
    setEditing({ ...s });
    setIsNew(false);
  }

  function saveEdit() {
    if (!editing || !editing.nome.trim()) return;
    if (isNew) {
      save([...list, editing]);
    } else {
      save(list.map(s => s.id === editing.id ? editing : s));
    }
    setEditing(null);
  }

  function deleteItem(id: string) {
    save(list.filter(s => s.id !== id));
    setEditing(null);
  }

  function setField<K extends keyof Stakeholder>(key: K, val: Stakeholder[K]) {
    setEditing(prev => prev ? { ...prev, [key]: val } : prev);
  }

  const byInfluence = (a: Stakeholder, b: Stakeholder) => {
    const order: Influence[] = ["alta", "media", "baixa"];
    return order.indexOf(a.influencia) - order.indexOf(b.influencia);
  };

  return (
    <div className="wsStakeholders">
      <div className="wsPageHeader">
        <h1 className="wsPageTitle">Stakeholders</h1>
        <p className="wsPageSubtitle">Mapa de pessoas — quem é quem, influência e relação</p>
      </div>

      <div className="wsStakeholderActions">
        <button className="wsStakeholderAddBtn" onClick={openNew}>
          + Adicionar pessoa
        </button>
      </div>

      {list.length === 0 ? (
        <div className="wsCard wsStakeholderEmpty">
          <p>Nenhum stakeholder ainda. Adicione as pessoas-chave do time e área.</p>
          <p className="wsStakeholderEmptyHint">Pense em: gestor, GPM, GTM, tech lead, pares de outras células.</p>
        </div>
      ) : (
        <div className="wsStakeholderGrid">
          {[...list].sort(byInfluence).map(s => (
            <button
              key={s.id}
              className="wsStakeholderCard wsCard"
              onClick={() => openEdit(s)}
            >
              <div className="wsStakeholderCardTop">
                <span className="wsStakeholderName">{s.nome}</span>
                <span className={`wsBadge ${INFLUENCE_BADGE[s.influencia]}`}>
                  {s.influencia === "alta" ? "↑ Alta" : s.influencia === "media" ? "Média" : "Baixa"}
                </span>
              </div>
              <span className="wsStakeholderPapel">{s.papel}{s.area ? ` · ${s.area}` : ""}</span>
              <div className="wsStakeholderCardBottom">
                <span className={`wsBadge ${RELACAO_BADGE[s.relacao]}`}>{RELACAO_LABEL[s.relacao]}</span>
                {s.notas && <span className="wsStakeholderNotasPrev">{s.notas.slice(0, 50)}{s.notas.length > 50 ? "…" : ""}</span>}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Edit/Add modal */}
      {editing && (
        <div className="wsStakeholderOverlay" onClick={() => setEditing(null)}>
          <div className="wsStakeholderModal wsCard" onClick={e => e.stopPropagation()}>
            <div className="wsStakeholderModalHeader">
              <h3 className="wsStakeholderModalTitle">{isNew ? "Nova pessoa" : "Editar"}</h3>
              <button className="wsStakeholderModalClose" onClick={() => setEditing(null)}>✕</button>
            </div>

            <div className="wsStakeholderForm">
              <label className="wsStakeholderLabel">
                Nome
                <input
                  className="wsStakeholderInput"
                  value={editing.nome}
                  onChange={e => setField("nome", e.target.value)}
                  placeholder="Ex: Carolina Lima"
                  autoFocus
                />
              </label>

              <div className="wsStakeholderRow">
                <label className="wsStakeholderLabel">
                  Papel
                  <input
                    className="wsStakeholderInput"
                    value={editing.papel}
                    onChange={e => setField("papel", e.target.value)}
                    placeholder="Ex: GPM, GTM, Tech Lead"
                  />
                </label>
                <label className="wsStakeholderLabel">
                  Área
                  <input
                    className="wsStakeholderInput"
                    value={editing.area}
                    onChange={e => setField("area", e.target.value)}
                    placeholder="Ex: Investimentos PJ"
                  />
                </label>
              </div>

              <div className="wsStakeholderRow">
                <label className="wsStakeholderLabel">
                  Influência
                  <select
                    className="wsStakeholderSelect"
                    value={editing.influencia}
                    onChange={e => setField("influencia", e.target.value as Influence)}
                  >
                    <option value="alta">Alta</option>
                    <option value="media">Média</option>
                    <option value="baixa">Baixa</option>
                  </select>
                </label>
                <label className="wsStakeholderLabel">
                  Relação
                  <select
                    className="wsStakeholderSelect"
                    value={editing.relacao}
                    onChange={e => setField("relacao", e.target.value as Relacao)}
                  >
                    <option value="aliado">Aliado</option>
                    <option value="neutro">Neutro</option>
                    <option value="atento">Atenção</option>
                  </select>
                </label>
              </div>

              <label className="wsStakeholderLabel">
                Notas
                <textarea
                  className="wsStakeholderTextarea"
                  value={editing.notas}
                  onChange={e => setField("notas", e.target.value)}
                  placeholder="O que você sabe sobre essa pessoa, o que importa pra ela, como se relacionar..."
                  rows={3}
                />
              </label>
            </div>

            <div className="wsStakeholderModalFooter">
              {!isNew && (
                <button
                  className="wsStakeholderDeleteBtn"
                  onClick={() => {
                    if (confirm(`Remover ${editing.nome}?`)) deleteItem(editing.id);
                  }}
                >
                  Remover
                </button>
              )}
              <button className="wsDadosBtn wsDadosBtn--primary" onClick={saveEdit} style={{ alignSelf: "auto" }}>
                {isNew ? "Adicionar" : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

