import { useRef, useState } from "react";
import "./Dados.css";

const LS_KEYS = [
  "lv:tasks",
  "lv:rituals",
  "lv:saved_apps",
  "lv:chegada_done",
];

function exportData() {
  const snapshot: Record<string, unknown> = {
    _exported_at: new Date().toISOString(),
    _version: 1,
  };
  for (const key of LS_KEYS) {
    try {
      snapshot[key] = JSON.parse(localStorage.getItem(key) || "null");
    } catch {
      snapshot[key] = null;
    }
  }
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `lv-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Dados() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<"idle" | "ok" | "error">("idle");
  const [importMsg, setImportMsg] = useState("");
  const [counts, setCountsState] = useState(() => getCounts());

  function getCounts() {
    const tasks = (() => { try { return (JSON.parse(localStorage.getItem("lv:tasks") || "[]") as unknown[]).length; } catch { return 0; } })();
    const rituals = (() => { try { return (JSON.parse(localStorage.getItem("lv:rituals") || "[]") as unknown[]).length; } catch { return 0; } })();
    return { tasks, rituals };
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string) as Record<string, unknown>;
        let restored = 0;
        for (const key of LS_KEYS) {
          if (key in data && data[key] !== null) {
            localStorage.setItem(key, JSON.stringify(data[key]));
            restored++;
          }
        }
        setImportStatus("ok");
        setImportMsg(`${restored} chave${restored !== 1 ? "s" : ""} restaurada${restored !== 1 ? "s" : ""} com sucesso.`);
        setCountsState(getCounts());
      } catch {
        setImportStatus("error");
        setImportMsg("Arquivo inválido. Certifique-se de usar um backup gerado aqui.");
      }
      if (fileRef.current) fileRef.current.value = "";
    };
    reader.readAsText(file);
  }

  function handleClearAll() {
    for (const key of LS_KEYS) localStorage.removeItem(key);
    setCountsState(getCounts());
    setImportStatus("ok");
    setImportMsg("Todos os dados foram apagados.");
  }

  return (
    <div className="wsDados">
      <div className="wsPageHeader">
        <h1 className="wsPageTitle">Dados</h1>
        <p className="wsPageSubtitle">Backup, restauração e visão geral do armazenamento local</p>
      </div>

      {/* Storage overview */}
      <section className="wsDadosSection">
        <h2 className="wsSectionTitle">Armazenamento atual</h2>
        <div className="wsCard wsDadosStats">
          <div className="wsDadosStat">
            <span className="wsDadosStatValue">{counts.rituals}</span>
            <span className="wsDadosStatLabel">Rituais salvos</span>
          </div>
          <div className="wsDadosStat">
            <span className="wsDadosStatValue">{counts.tasks}</span>
            <span className="wsDadosStatLabel">Tarefas</span>
          </div>
          <div className="wsDadosStat">
            <span className="wsDadosStatValue">localStorage</span>
            <span className="wsDadosStatLabel">Onde fica</span>
          </div>
        </div>
      </section>

      {/* Export */}
      <section className="wsDadosSection">
        <h2 className="wsSectionTitle">Exportar backup</h2>
        <div className="wsCard wsDadosCard">
          <p className="wsDadosCardDesc">
            Baixa um arquivo <code>.json</code> com todos os dados: rituais, tarefas, apps salvos e checklist de chegada.
            Guarde em algum lugar seguro — Google Drive, Notes, onde quiser.
          </p>
          <button className="wsDadosBtn wsDadosBtn--primary" onClick={exportData}>
            Baixar backup →
          </button>
        </div>
      </section>

      {/* Import */}
      <section className="wsDadosSection">
        <h2 className="wsSectionTitle">Restaurar backup</h2>
        <div className="wsCard wsDadosCard">
          <p className="wsDadosCardDesc">
            Selecione um arquivo de backup gerado aqui. Os dados existentes serão <strong>substituídos</strong> pelas versões do arquivo.
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            className="wsDadosFileInput"
            onChange={handleImport}
            id="ws-import-file"
          />
          <label htmlFor="ws-import-file" className="wsDadosBtn wsDadosBtn--secondary">
            Selecionar arquivo
          </label>

          {importStatus !== "idle" && (
            <p className={`wsDadosMsg wsDadosMsg--${importStatus}`}>{importMsg}</p>
          )}
        </div>
      </section>

      {/* Danger zone */}
      <section className="wsDadosSection">
        <h2 className="wsSectionTitle">Zona de risco</h2>
        <div className="wsCard wsDadosCard wsDadosCard--danger">
          <p className="wsDadosCardDesc">
            Apaga todos os dados do localStorage. Não tem volta — faça um backup antes.
          </p>
          <button
            className="wsDadosBtn wsDadosBtn--danger"
            onClick={() => {
              if (confirm("Tem certeza? Isso apaga rituais, tarefas e tudo mais. Não tem desfazer.")) {
                handleClearAll();
              }
            }}
          >
            Apagar tudo
          </button>
        </div>
      </section>
    </div>
  );
}

