import "./Planos.css";

export default function Planos() {
  return (
    <div className="wsPlanos">
      <div className="wsPageHeader">
        <h1 className="wsPageTitle">Planos</h1>
        <p className="wsPageSubtitle">PDI 2025 · Chegada · 90 dias</p>
      </div>

      {/* ── PDI 2025 ─────────────────────────────── */}
      <section className="wsPlanosSection">
        <h2 className="wsSectionTitle">PDI 2025</h2>
        <div className="wsPdiGrid">
          <div className="wsCard">
            <p className="wsPdiCardLabel">Forças</p>
            <div className="wsPdiTags">
              {["Visual design", "Construção de parcerias", "Gestão de pessoas", "Poder de execução", "Autonomia"].map(tag => (
                <span key={tag} className="wsBadge wsBadge--green">{tag}</span>
              ))}
            </div>
          </div>

          <div className="wsCard">
            <p className="wsPdiCardLabel">Desenvolver</p>
            <div className="wsPdiTags">
              {["Proatividade", "Procrastinação", "Ser mais propositivo", "Pontes além da gerência"].map(tag => (
                <span key={tag} className="wsBadge wsBadge--amber">{tag}</span>
              ))}
            </div>
          </div>

          <div className="wsCard">
            <p className="wsPdiCardLabel">Oportunidades</p>
            <p className="wsPdiCardText">
              Mapear reuniões e stakeholders estratégicos. Construir voz na tríade GPM · GTM · GDM.
            </p>
          </div>

          <div className="wsCard">
            <p className="wsPdiCardLabel">Ameaça</p>
            <p className="wsPdiCardText wsPdiCardText--red">
              Ter boas ideias mas não executar a tempo.
            </p>
          </div>
        </div>
      </section>

      {/* ── Chegada ──────────────────────────────── */}
      <section className="wsPlanosSection">
        <h2 className="wsSectionTitle">Chegada — primeiras 2 semanas</h2>
        <div className="wsCard">
          <div className="wsChegadaBlock">
            <div className="wsChegadaHeader">
              <span className="wsChegadaWeek">Semana 1 — preparação estratégica</span>
              <span className="wsBadge wsBadge--blue">Agora</span>
            </div>
            <ul className="wsChegadaList">
              <li>Montar FigJam base de investimentos PJ com gaps e benchmarks</li>
              <li>Escrever tese de entrada sobre o problema</li>
              <li>Preparar perguntas pro primeiro 1:1 com gestor</li>
            </ul>
          </div>

          <div className="wsDivider" />

          <div className="wsChegadaBlock">
            <div className="wsChegadaHeader">
              <span className="wsChegadaWeek">Semana 2 — preparação operacional</span>
              <span className="wsBadge wsBadge--purple">Em breve</span>
            </div>
            <ul className="wsChegadaList">
              <li>Estruturar ritual semanal e weekly do time</li>
              <li>Mapear stakeholders e reuniões estratégicas</li>
              <li>Preparar apresentação pra GPM como par estratégico</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── Plano 90 dias ────────────────────────── */}
      <section className="wsPlanosSection">
        <h2 className="wsSectionTitle">Plano 90 dias</h2>
        <div className="ws90Table">
          {[
            {
              title: "Diagnóstico da jornada atual",
              como: "FigJam com dados de funil, gaps, wayouts e atendimento",
              quando: "Dias 1–30",
              badgeClass: "wsBadge--blue",
              accentColor: "#3C3489",
            },
            {
              title: "Quick win — pós-venda mobile",
              como: "Extrato + rentabilidade + posição. Reuso das APIs e jornadas do Private",
              quando: "Dias 30–60",
              badgeClass: "wsBadge--purple",
              accentColor: "#3C3489",
            },
            {
              title: "Visão de chassi unificado",
              como: "Arquitetura de jornada única. Deck pra gestor e GPM",
              quando: "Dias 60–90",
              badgeClass: "wsBadge--teal",
              accentColor: "#0F6E56",
            },
            {
              title: "Voz estratégica na tríade",
              como: "Reuniões com benchmarks e ponto de vista sobre OKRs",
              quando: "Contínuo",
              badgeClass: "wsBadge--green",
              accentColor: "#3B6D11",
            },
            {
              title: "Posicionamento para gerência",
              como: "Acúmulo de entregas visíveis ao longo do ano",
              quando: "Fim 2025",
              badgeClass: "wsBadge--amber",
              accentColor: "#854F0B",
            },
          ].map((row, i) => (
            <div
              key={i}
              className="ws90Row"
              style={{ borderLeftColor: row.accentColor }}
            >
              <div className="ws90RowMain">
                <span className="ws90RowTitle">{row.title}</span>
                <span className="ws90RowComo">{row.como}</span>
              </div>
              <div className="ws90RowWhen">
                <span className={`wsBadge ${row.badgeClass}`}>{row.quando}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
