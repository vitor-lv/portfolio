import { useState, useEffect } from "react";
import "./OKRs.css";
import type { KeyResult, Objective } from "../../types/workspace";
import { STORAGE_KEYS, loadStorage, saveStorage } from "../../lib/storage";
import { useSpace } from "../../contexts/WorkspaceSpaceContext";

const DEFAULT_OKRS: Objective[] = [
  {
    id: "o1",
    titulo: "Chegada impactante como design lead de investimentos PJ",
    prazo: "Abr 2025",
    krs: [
      { id: "kr1", text: "FigJam de diagnóstico da jornada atual completo e apresentado ao gestor", progress: 0, notas: "" },
      { id: "kr2", text: "Primeiro quick win de pós-venda (extrato + rentabilidade) em protótipo validado", progress: 0, notas: "" },
      { id: "kr3", text: "1:1 semanal rodando com gestor e GPM estabelecido como par", progress: 0, notas: "" },
    ],
  },
  {
    id: "o2",
    titulo: "Promoção para gerência até fim de 2025",
    prazo: "Dez 2025",
    krs: [
      { id: "kr4", text: "Chassi unificado de jornada de investimentos apresentado e aprovado pela tríade", progress: 0, notas: "" },
      { id: "kr5", text: "Voz estratégica estabelecida — participação ativa em pelo menos 2 decisões de OKR da área", progress: 0, notas: "" },
      { id: "kr6", text: "Ritual semanal mantido por pelo menos 12 semanas consecutivas", progress: 0, notas: "" },
    ],
  },
];

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

function avg(krs: KeyResult[]) {
  if (!krs.length) return 0;
  return Math.round(krs.reduce((s, k) => s + k.progress, 0) / krs.length);
}

function progressColor(p: number) {
  if (p >= 70) return "#b6f3a3";
  if (p >= 35) return "#ffc78a";
  return "#8a8a90";
}

export default function OKRs() {
  const { k, space } = useSpace();
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [editingKR, setEditingKR] = useState<{ objId: string; krId: string } | null>(null);

  // Objective inline editing
  const [editingObjId, setEditingObjId] = useState<string | null>(null);
  const [objDraft, setObjDraft] = useState({ titulo: "", prazo: "" });

  // Add KR
  const [addingKRToObj, setAddingKRToObj] = useState<string | null>(null);
  const [newKRText, setNewKRText] = useState("");

  // Add Objective modal
  const [showAddObj, setShowAddObj] = useState(false);
  const [newObjDraft, setNewObjDraft] = useState({ titulo: "", prazo: "" });

  useEffect(() => {
    setObjectives(
      loadStorage<Objective[] | null>(k(STORAGE_KEYS.okrs), null) ??
        (space === "itau" ? DEFAULT_OKRS : [])
    );
  }, [k, space]);

  function save(updated: Objective[]) {
    setObjectives(updated);
    saveStorage(k(STORAGE_KEYS.okrs), updated);
  }

  function updateKR(objId: string, krId: string, fields: Partial<KeyResult>) {
    save(
      objectives.map((o) =>
        o.id !== objId
          ? o
          : { ...o, krs: o.krs.map((kr) => (kr.id !== krId ? kr : { ...kr, ...fields })) }
      )
    );
  }

  function deleteKR(objId: string, krId: string) {
    save(objectives.map((o) => (o.id !== objId ? o : { ...o, krs: o.krs.filter((kr) => kr.id !== krId) })));
    setEditingKR(null);
  }

  function addKR(objId: string) {
    if (!newKRText.trim()) return;
    const kr: KeyResult = { id: uid(), text: newKRText.trim(), progress: 0, notas: "" };
    save(objectives.map((o) => (o.id !== objId ? o : { ...o, krs: [...o.krs, kr] })));
    setNewKRText("");
    setAddingKRToObj(null);
  }

  function startEditObj(obj: Objective) {
    setEditingObjId(obj.id);
    setObjDraft({ titulo: obj.titulo, prazo: obj.prazo });
    setEditingKR(null);
    setAddingKRToObj(null);
  }

  function saveEditObj() {
    if (!objDraft.titulo.trim()) return;
    save(
      objectives.map((o) =>
        o.id !== editingObjId ? o : { ...o, titulo: objDraft.titulo.trim(), prazo: objDraft.prazo.trim() }
      )
    );
    setEditingObjId(null);
  }

  function deleteObj(id: string) {
    if (confirm("Remover este objetivo e todos os seus KRs?")) {
      save(objectives.filter((o) => o.id !== id));
      setEditingObjId(null);
    }
  }

  function addObj() {
    if (!newObjDraft.titulo.trim()) return;
    const obj: Objective = { id: uid(), titulo: newObjDraft.titulo.trim(), prazo: newObjDraft.prazo.trim(), krs: [] };
    save([...objectives, obj]);
    setNewObjDraft({ titulo: "", prazo: "" });
    setShowAddObj(false);
  }

  function resetToDefault() {
    if (confirm("Resetar para os OKRs padrão? Seu progresso atual será perdido.")) {
      save(DEFAULT_OKRS.map((o) => ({ ...o, krs: o.krs.map((kr) => ({ ...kr, progress: 0, notas: "" })) })));
    }
  }

  return (
    <div className="wsOKRs">
      <div className="wsPageHeader">
        <h1 className="wsPageTitle">OKRs</h1>
        <p className="wsPageSubtitle">Objetivos e key results · 2025</p>
      </div>

      {objectives.length === 0 ? (
        <div className="wsCard wsOKREmpty">
          <p>Nenhum objetivo ainda.</p>
          <p className="wsOKREmptyHint">Adicione seus objetivos e key results para acompanhar o progresso.</p>
          <button className="wsOKRPrimaryBtn" onClick={() => setShowAddObj(true)}>
            + Adicionar objetivo
          </button>
        </div>
      ) : (
        <>
          <div className="wsOKRList">
            {objectives.map((obj) => {
              const objProgress = avg(obj.krs);
              const color = progressColor(objProgress);
              const isEditingThisObj = editingObjId === obj.id;

              return (
                <div key={obj.id} className="wsOKRObjective wsCard">
                  <div className="wsOKRObjectiveHeader">
                    {isEditingThisObj ? (
                      <div className="wsOKRObjEditForm">
                        <input
                          className="wsOKRObjInput"
                          value={objDraft.titulo}
                          onChange={(e) => setObjDraft((d) => ({ ...d, titulo: e.target.value }))}
                          placeholder="Título do objetivo"
                          autoFocus
                          onKeyDown={(e) => e.key === "Enter" && saveEditObj()}
                        />
                        <input
                          className="wsOKRObjInput wsOKRObjInputSmall"
                          value={objDraft.prazo}
                          onChange={(e) => setObjDraft((d) => ({ ...d, prazo: e.target.value }))}
                          placeholder="Prazo (ex: Dez 2025)"
                        />
                        <div className="wsOKRObjEditActions">
                          <button className="wsOKRDangerBtn" onClick={() => deleteObj(obj.id)}>
                            Remover objetivo
                          </button>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button className="wsOKREditBtn" onClick={() => setEditingObjId(null)}>
                              Cancelar
                            </button>
                            <button className="wsOKRPrimaryBtn" onClick={saveEditObj}>
                              Salvar
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="wsOKRObjectiveTop">
                          <h3 className="wsOKRObjectiveTitle">{obj.titulo}</h3>
                          <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                            {obj.prazo && <span className="wsBadge wsBadge--teal">{obj.prazo}</span>}
                            <button className="wsOKREditBtn" onClick={() => startEditObj(obj)}>
                              Editar
                            </button>
                          </div>
                        </div>
                        {obj.krs.length > 0 && (
                          <div className="wsOKRProgressRow">
                            <div className="wsOKRProgressBar">
                              <div
                                className="wsOKRProgressFill"
                                style={{ width: `${objProgress}%`, background: color }}
                              />
                            </div>
                            <span className="wsOKRProgressPct" style={{ color }}>
                              {objProgress}%
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {!isEditingThisObj && (
                    <div className="wsOKRKRList">
                      {obj.krs.map((kr) => {
                        const isEditing = editingKR?.objId === obj.id && editingKR?.krId === kr.id;
                        const krColor = progressColor(kr.progress);
                        return (
                          <div key={kr.id} className="wsOKRKR">
                            <div className="wsOKRKRTop">
                              <span className="wsOKRKRText">{kr.text}</span>
                              <button
                                className="wsOKREditBtn"
                                onClick={() =>
                                  setEditingKR(isEditing ? null : { objId: obj.id, krId: kr.id })
                                }
                              >
                                {isEditing ? "Fechar" : `${kr.progress}%`}
                              </button>
                            </div>

                            <div className="wsOKRKRBar">
                              <div
                                className="wsOKRKRFill"
                                style={{ width: `${kr.progress}%`, background: krColor }}
                              />
                            </div>

                            {isEditing && (
                              <div className="wsOKRKREdit">
                                <textarea
                                  className="wsOKRNotasInput"
                                  value={kr.text}
                                  placeholder="Texto do key result..."
                                  rows={2}
                                  onChange={(e) => updateKR(obj.id, kr.id, { text: e.target.value })}
                                />
                                <label className="wsOKRSliderLabel">
                                  Progresso: <strong>{kr.progress}%</strong>
                                  <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    step={5}
                                    value={kr.progress}
                                    className="wsOKRSlider"
                                    onChange={(e) =>
                                      updateKR(obj.id, kr.id, { progress: Number(e.target.value) })
                                    }
                                  />
                                </label>
                                <textarea
                                  className="wsOKRNotasInput"
                                  value={kr.notas}
                                  placeholder="Notas sobre esse key result..."
                                  rows={2}
                                  onChange={(e) => updateKR(obj.id, kr.id, { notas: e.target.value })}
                                />
                                <button
                                  className="wsOKRDangerBtn"
                                  onClick={() => {
                                    if (confirm("Remover este KR?")) deleteKR(obj.id, kr.id);
                                  }}
                                >
                                  Remover KR
                                </button>
                              </div>
                            )}

                            {!isEditing && kr.notas && (
                              <p className="wsOKRKRNotas">{kr.notas}</p>
                            )}
                          </div>
                        );
                      })}

                      {addingKRToObj === obj.id ? (
                        <div className="wsOKRAddKRForm">
                          <textarea
                            className="wsOKRNotasInput"
                            value={newKRText}
                            placeholder="Descreva o key result..."
                            rows={2}
                            autoFocus
                            onChange={(e) => setNewKRText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                addKR(obj.id);
                              }
                            }}
                          />
                          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                            <button
                              className="wsOKREditBtn"
                              onClick={() => {
                                setAddingKRToObj(null);
                                setNewKRText("");
                              }}
                            >
                              Cancelar
                            </button>
                            <button className="wsOKRPrimaryBtn" onClick={() => addKR(obj.id)}>
                              Adicionar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          className="wsOKRAddKRBtn"
                          onClick={() => {
                            setAddingKRToObj(obj.id);
                            setEditingKR(null);
                          }}
                        >
                          + Adicionar KR
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="wsOKRFooter">
            <button className="wsOKRAddObjFooterBtn" onClick={() => setShowAddObj(true)}>
              + Adicionar objetivo
            </button>
            {space === "itau" && (
              <button className="wsOKRResetBtn" onClick={resetToDefault}>
                Resetar para padrão
              </button>
            )}
          </div>
        </>
      )}

      {showAddObj && (
        <div className="wsOKRModalOverlay" onClick={() => setShowAddObj(false)}>
          <div className="wsOKRModal wsCard" onClick={(e) => e.stopPropagation()}>
            <div className="wsOKRModalHeader">
              <h3 className="wsOKRModalTitle">Novo objetivo</h3>
              <button className="wsOKRModalClose" onClick={() => setShowAddObj(false)}>
                ✕
              </button>
            </div>
            <div className="wsOKRModalBody">
              <label className="wsOKRModalLabel">
                Objetivo
                <input
                  className="wsOKRObjInput"
                  value={newObjDraft.titulo}
                  onChange={(e) => setNewObjDraft((d) => ({ ...d, titulo: e.target.value }))}
                  placeholder="Ex: Chegada impactante como design lead"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && addObj()}
                />
              </label>
              <label className="wsOKRModalLabel">
                Prazo
                <input
                  className="wsOKRObjInput"
                  value={newObjDraft.prazo}
                  onChange={(e) => setNewObjDraft((d) => ({ ...d, prazo: e.target.value }))}
                  placeholder="Ex: Dez 2025"
                  onKeyDown={(e) => e.key === "Enter" && addObj()}
                />
              </label>
            </div>
            <div className="wsOKRModalFooter">
              <button className="wsOKRPrimaryBtn" onClick={addObj}>
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

