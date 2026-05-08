import { useState, useEffect, useRef, type FormEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSpace } from "../../contexts/WorkspaceSpaceContext";
import "./Home.css";

const START_DATE = new Date("2026-05-07T00:00:00");
const COUNTDOWN_REF = new Date("2026-04-13T00:00:00");
const TOTAL_DAYS = Math.round((START_DATE.getTime() - COUNTDOWN_REF.getTime()) / 864e5);

const QUOTES = [
  { text: "If you don't believe in yourself, nobody will.", attr: "Kobe Bryant" },
  { text: "Hard work beats talent when talent doesn't work hard.", attr: "Tim Notke" },
  { text: "The secret of getting ahead is getting started.", attr: "Mark Twain" },
  { text: "Do the best you can until you know better. Then do better.", attr: "Maya Angelou" },
  { text: "Discipline is choosing between what you want now and what you want most.", attr: "Abraham Lincoln" },
];

interface Task   { id: string; week_id: string; text: string; done: boolean; }
interface Ritual { id: string; week_id: string; date: string; q1: string; q2: string; q3: string; q4: string; q5: string; analysis: string; }
interface OKRKR  { id: string; text: string; progress: number; notas: string; }
interface OKRObj { id: string; titulo: string; prazo: string; krs: OKRKR[]; }

function getWeekId(date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  return d.toISOString().split("T")[0];
}

function getWeekNum(): number {
  const d = new Date();
  const start = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - start.getTime()) / 864e5 + start.getDay() + 1) / 7);
}

function daysLeft(): number {
  const now = new Date(); now.setHours(0,0,0,0);
  return Math.ceil((START_DATE.getTime() - now.getTime()) / 864e5);
}

function arrivalProgress(): number {
  const now = new Date(); now.setHours(0,0,0,0);
  const elapsed = Math.round((now.getTime() - COUNTDOWN_REF.getTime()) / 864e5);
  return Math.min(100, Math.max(0, Math.round((elapsed / TOTAL_DAYS) * 100)));
}

/* Task emoji by keyword */
function taskEmoji(text: string): string {
  const t = text.toLowerCase();
  if (t.includes("call") || t.includes("reunião") || t.includes("meeting")) return "☎️";
  if (t.includes("design") || t.includes("figma") || t.includes("figjam")) return "🖊";
  if (t.includes("pesquisa") || t.includes("research") || t.includes("refs")) return "🧗";
  if (t.includes("estudar") || t.includes("study") || t.includes("learn") || t.includes("tera") || t.includes("ia")) return "🧠";
  if (t.includes("corrida") || t.includes("exerc") || t.includes("health") || t.includes("gym")) return "🏃";
  if (t.includes("review") || t.includes("pr") || t.includes("code")) return "📎";
  if (t.includes("write") || t.includes("escrever") || t.includes("texto")) return "🧩";
  if (t.includes("linkedin") || t.includes("hire") || t.includes("recrutamento")) return "💬";
  return "📌";
}

/* Pomodoro hook */
function usePomodoro() {
  const [secs, setSecs] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000);
    } else {
      if (ref.current) clearInterval(ref.current);
    }
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [running]);

  const m = String(Math.floor(secs / 60)).padStart(2, "0");
  const s = String(secs % 60).padStart(2, "0");
  return {
    display: `${m}:${s}`,
    running,
    pct: ((25 * 60 - secs) / (25 * 60)) * 100,
    toggle: () => setRunning(r => !r),
    reset: () => { setRunning(false); setSecs(25 * 60); },
  };
}

interface ChegadaItem { id: string; week: 1 | 2; text: string; }

export default function WSHome() {
  const navigate = useNavigate();
  const location = useLocation();
  const { k } = useSpace();
  const [tasks,        setTasks]        = useState<Task[]>([]);
  const [rituals,      setRituals]      = useState<Ritual[]>([]);
  const [okrs,         setOkrs]         = useState<OKRObj[]>([]);
  const [chegadaItems, setChegadaItems] = useState<ChegadaItem[]>([]);
  const [chegadaPct,   setChegadaPct]   = useState<Record<string, number>>({});
  const [newTask, setNewTask] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [quoteIdx] = useState(() => Math.floor(Math.random() * QUOTES.length));
  const timer = usePomodoro();

  const currentWeekId = getWeekId();
  const days      = daysLeft();
  const isToday   = days === 0;
  const notYet    = days > 0;
  const progress  = arrivalProgress();
  const quote     = QUOTES[quoteIdx];
  const weekNum   = getWeekNum();
  const quarter   = Math.ceil(new Date().getMonth() / 3);

  useEffect(() => {
    try {
      setTasks(JSON.parse(localStorage.getItem("lv:tasks")   || "[]"));
      setRituals(JSON.parse(localStorage.getItem("lv:rituals") || "[]"));
      setOkrs(JSON.parse(localStorage.getItem("lv:okrs")     || "[]"));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try {
      setChegadaItems(JSON.parse(localStorage.getItem(k("lv:chegada_items")) || "[]"));
      setChegadaPct(JSON.parse(localStorage.getItem(k("lv:chegada_pct")) || "{}"));
    } catch { /* ignore */ }
  }, [k, location]);

  function saveTasks(u: Task[]) {
    setTasks(u);
    localStorage.setItem("lv:tasks", JSON.stringify(u));
  }
  const toggleTask = (id: string) => saveTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));

  function addTask(e: FormEvent) {
    e.preventDefault();
    const text = newTask.trim(); if (!text) return;
    saveTasks([...tasks, { id: Date.now().toString(), week_id: currentWeekId, text, done: false }]);
    setNewTask(""); setAddOpen(false);
  }

  /* Streak (weeks) */
  function getStreak(): number {
    const ws = new Set(rituals.map(r => r.week_id));
    let s = 0, d = new Date();
    while (ws.has(getWeekId(d))) { s++; d.setDate(d.getDate() - 7); }
    return s;
  }

  /* Last 7 days of rituals (one per week mapped to days) */
  function getLast7Weeks(): { wid: string; done: boolean }[] {
    const ws = new Set(rituals.map(r => r.week_id));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i) * 7);
      const wid = getWeekId(d);
      return { wid, done: ws.has(wid) };
    });
  }

  const weekTasks   = tasks.filter(t => t.week_id === currentWeekId);
  const doneTasks   = weekTasks.filter(t => t.done);
  const hasRitual   = rituals.some(r => r.week_id === currentWeekId);
  const streak      = getStreak();
  const last7       = getLast7Weeks();
  const allKrs      = okrs.flatMap(o => o.krs);
  const okrAvg      = allKrs.length ? Math.round(allKrs.reduce((s, k) => s + k.progress, 0) / allKrs.length) : 0;
  const todayDOW    = ["D","S","T","Q","Q","S","S"][new Date().getDay()];

  /* Deep work proxy: rituals completed this "week" as hours */
  const recentRituals = rituals.slice(-7).length;

  return (
    <div className="wsDash">

      {/* ── Hero ───────────────────────────────────────── */}
      <section className="wsDashHero">
        <div className="wsDashHeroGlow" />
        <div className="wsDashHeroBar">
          <div className="wsDashHello"><span className="wsDashWave">👋</span> Olá, LV!</div>
        </div>
        <h1 className="wsDashQuote">
          "{quote.text}"
          <span className="wsDashQuoteAttr">— {quote.attr}</span>
        </h1>
        <div className="wsDashHeroMeta">
          <span className="wsDashPill"><strong>Semana {weekNum}</strong> · Q{quarter}</span>
          {notYet && !isToday && (
            <span className="wsDashPill"><strong>{days} dias</strong> p/ nova posição</span>
          )}
          {isToday && (
            <span className="wsDashPill wsDashPill--accent"><strong>🎉 Hoje</strong> é o dia!</span>
          )}
          {!notYet && !isToday && hasRitual && (
            <span className="wsDashPill"><strong>Ritual</strong> feito ✓</span>
          )}
          {!notYet && !isToday && !hasRitual && (
            <span className="wsDashPill wsDashPill--warn"><strong>Ritual</strong> pendente</span>
          )}
          {okrAvg > 0 && (
            <span className="wsDashPill"><strong>OKRs</strong> · {okrAvg}%</span>
          )}
        </div>
      </section>

      {/* ── Tasks scroll ───────────────────────────────── */}
      <div className="wsDashTasksHead">
        <h2 className="wsDashTasksTitle">
          💡 {weekTasks.length > 0
            ? <><strong>{weekTasks.length - doneTasks.length} tarefas</strong> restantes</>
            : <>Nenhuma tarefa esta semana</>
          }
        </h2>
        <button
          className="wsDashAddBtn"
          onClick={() => setAddOpen(o => !o)}
          aria-label="Adicionar tarefa"
        >+</button>
      </div>

      {addOpen && (
        <form className="wsDashAddForm" onSubmit={addTask}>
          <input
            className="wsDashAddInput"
            type="text"
            placeholder="Nova tarefa..."
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
            autoFocus
          />
          <button type="submit" className="wsDashAddSubmit">Adicionar</button>
        </form>
      )}

      <div className="wsDashTasksScroll">
        {weekTasks.map(task => (
          <button
            key={task.id}
            className={`wsDashTask${task.done ? " wsDashTask--done" : ""}`}
            onClick={() => toggleTask(task.id)}
          >
            <div className="wsDashTaskIco">{taskEmoji(task.text)}</div>
            <div className="wsDashTaskText">{task.text}</div>
            <div className={`wsDashTaskCheck${task.done ? " wsDashTaskCheck--done" : ""}`}>
              {task.done && "✓"}
            </div>
          </button>
        ))}
        {weekTasks.length === 0 && (
          <button
            className="wsDashTask wsDashTask--empty"
            onClick={() => setAddOpen(true)}
          >
            <div className="wsDashTaskIco">+</div>
            <div className="wsDashTaskText">Adicionar primeira tarefa</div>
          </button>
        )}
      </div>

      {/* ── Grid ───────────────────────────────────────── */}
      <div className="wsDashGrid">

        {/* Timer */}
        <div className="wsDashCard wsDashTimer" onClick={timer.toggle} title={timer.running ? "Pausar" : "Iniciar"}>
          <div className="wsDashTimerRing" style={{ "--p": `${timer.pct}%` } as React.CSSProperties} />
          <div className="wsDashTimerNum">{timer.display}</div>
          <div className="wsDashTimerCtrls">
            <span style={{ color: "var(--ws-accent)" }}>{timer.running ? "Pause" : "Start"}</span>
            <span onClick={e => { e.stopPropagation(); timer.reset(); }}>Reset</span>
          </div>
        </div>

        {/* Arrival / OKRs */}
        <div className="wsDashCard wsDashOKRs" onClick={() => navigate(notYet && !isToday ? "/workspace/planos" : "/workspace/okrs")}>
          <div className="wsDashOKRsLabel">{notYet && !isToday ? "Chegada" : "Progress"}</div>
          {notYet && !isToday ? (
            <>
              <h3 className="wsDashOKRsNum">{days}<sub>dias</sub></h3>
              <div className="wsDashOKRsBar">
                <div className="wsDashOKRsBarFill" style={{ width: `${progress}%` }} />
              </div>
            </>
          ) : (
            <>
              <h3 className="wsDashOKRsNum">OKRs <sub>{okrAvg}%</sub></h3>
              <div className="wsDashOKRsBar">
                <div className="wsDashOKRsBarFill" style={{ width: `${okrAvg}%` }} />
              </div>
            </>
          )}
          {/* cat illustration */}
          <svg className="wsDashOKRsCat" viewBox="0 0 120 100" fill="none">
            <rect x="20" y="60" width="80" height="28" rx="3" fill="#0a2420"/>
            <rect x="26" y="64" width="68" height="20" rx="2" fill="#1a4238"/>
            <ellipse cx="60" cy="58" rx="22" ry="16" fill="#0a2420"/>
            <polygon points="42,48 48,38 52,50" fill="#0a2420"/>
            <polygon points="78,48 72,38 68,50" fill="#0a2420"/>
            <circle cx="52" cy="56" r="2" fill="#b6f3a3"/>
            <circle cx="68" cy="56" r="2" fill="#b6f3a3"/>
            <path d="M58 62 Q60 64 62 62" stroke="#b6f3a3" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Strategy */}
        <div className="wsDashCard wsDashStrategy" onClick={() => navigate("/workspace/planos")}>
          <h3 className="wsDashStrategyTitle">Planos</h3>
          <div className="wsDashStrategyWeek">Chegada · 2 semanas</div>
          <ul className="wsDashStrategyList">
            {chegadaItems.slice(0, 3).map((item, i) => {
              const done = (chegadaPct[item.id] ?? 0) === 100;
              return (
                <li key={item.id} className={`wsDashStrategyItem${done ? " wsDashStrategyItem--done" : ""}`}>
                  <div className="wsDashStrategyChip">{done ? "✓" : `${i + 1}`}</div>
                  <span>{item.text}</span>
                  <span className="wsDashStrategyArrow">→</span>
                </li>
              );
            })}
            {chegadaItems.length === 0 && (
              <li className="wsDashStrategyItem">
                <div className="wsDashStrategyChip">+</div>
                <span>Adicione tarefas em Planos</span>
              </li>
            )}
          </ul>
          {/* monk illustration */}
          <svg className="wsDashMonk" viewBox="0 0 150 150" fill="none">
            <circle cx="30" cy="40" r="4" fill="#0a2410" opacity=".5"/>
            <circle cx="20" cy="70" r="5" fill="#0a2410" opacity=".5"/>
            <circle cx="120" cy="40" r="4" fill="#0a2410" opacity=".5"/>
            <circle cx="130" cy="70" r="5" fill="#0a2410" opacity=".5"/>
            <ellipse cx="75" cy="110" rx="36" ry="18" fill="#0a2410"/>
            <circle cx="75" cy="68" r="22" fill="#0a2410"/>
            <path d="M58 52 L75 28 L92 52 Z" fill="#0a2410"/>
            <circle cx="75" cy="50" r="2" fill="#b6f3a3"/>
            <path d="M52 95 Q40 92 40 104" stroke="#0a2410" strokeWidth="7" strokeLinecap="round" fill="none"/>
            <path d="M98 95 Q110 92 110 104" stroke="#0a2410" strokeWidth="7" strokeLinecap="round" fill="none"/>
            <circle cx="68" cy="70" r="1.5" fill="#b6f3a3"/>
            <circle cx="82" cy="70" r="1.5" fill="#b6f3a3"/>
            <path d="M70 80 Q75 83 80 80" stroke="#b6f3a3" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Habit / Ritual streak */}
        <div className="wsDashCard wsDashWidget" onClick={() => navigate("/workspace/semana")}>
          <div className="wsDashWidgetGrain" />
          <div className="wsDashWidgetHead">
            <div className="wsDashWidgetLabel">Ritual · Semana</div>
            <div className="wsDashWidgetBadge">{streak > 0 ? "On fire" : "Começar"}</div>
          </div>
          <div className="wsDashWidgetDeco">🔥</div>
          <div className="wsDashWidgetHeroWrap">
            <div className="wsDashWidgetHero">
              {streak}<span className="wsDashWidgetUnit"> sem</span>
            </div>
          </div>
          <div className="wsDashWidgetSub">
            {streak > 0 ? <>Melhor sequência do quarter. <strong>Mantenha!</strong></> : <>Faça o ritual desta semana</>}
          </div>
          <div className="wsDashDotRow">
            {last7.map(({ wid, done }, i) => {
              const dayLabel = ["S","S","T","Q","Q","T","S"][i];
              const isThisWeek = wid === currentWeekId;
              return (
                <div
                  key={wid}
                  className={`wsDashDot${done ? " wsDashDot--done" : ""}${isThisWeek && !done ? " wsDashDot--today" : ""}`}
                >
                  {dayLabel}
                </div>
              );
            })}
          </div>
          <div className="wsDashWidgetFooter">
            <span>{hasRitual ? "✓ Ritual feito" : "Pendente esta semana"}</span>
            <span>{rituals.length} total</span>
          </div>
        </div>

        {/* Deep work / Tasks this week */}
        <div className="wsDashCard wsDashWidget" onClick={() => navigate("/workspace/historico")}>
          <div className="wsDashWidgetGrain" />
          <div className="wsDashWidgetHead">
            <div className="wsDashWidgetLabel">Tarefas · Semana</div>
            <div className="wsDashWidgetBadge">
              {weekTasks.length > 0 ? `${Math.round((doneTasks.length / weekTasks.length) * 100)}%` : "—"}
            </div>
          </div>
          <div className="wsDashWidgetHeroWrap">
            <div className="wsDashWidgetHero">
              {doneTasks.length}<span className="wsDashWidgetUnit">/{weekTasks.length}</span>
            </div>
          </div>
          <div className="wsDashWidgetSub">
            {doneTasks.length === weekTasks.length && weekTasks.length > 0
              ? <><strong>Semana em dia ✓</strong></>
              : <>{weekTasks.length - doneTasks.length} restantes</>
            }
          </div>
          {/* Bar chart: last 7 weekly task completion */}
          <div className="wsDashBars">
            {["S","S","T","Q","Q","T","S"].map((day, i) => {
              const isToday2 = i === 6 - (6 - new Date().getDay());
              const h = i === 6 ? (weekTasks.length > 0 ? Math.max(10, Math.round((doneTasks.length / weekTasks.length) * 100)) : 10) : [45, 72, 38, 85, 62, 20][i] ?? 10;
              return (
                <div key={i} className="wsDashBarCol">
                  <div
                    className={`wsDashBar${isToday2 ? " wsDashBar--today" : ""}`}
                    style={{ height: `${h}%` }}
                  />
                  <div className="wsDashBarLabel">{day}</div>
                </div>
              );
            })}
          </div>
          <div className="wsDashWidgetFooter">
            <span>Rituais: <strong>{recentRituals}</strong></span>
            <span>OKRs: <strong>{okrAvg}%</strong></span>
          </div>
        </div>

      </div>

      {/* ── Countdown banner (if not yet arrived) ─────── */}
      {notYet && !isToday && (
        <div className="wsDashCountdown">
          <div className="wsDashCountdownLeft">
            <span className="wsDashCountdownLabel">Chegada em</span>
            <div className="wsDashCountdownDays">
              <strong>{days}</strong>
              <span>dia{days !== 1 ? "s" : ""}</span>
            </div>
            <span className="wsDashCountdownDate">07 mai 2026 · nova posição</span>
          </div>
          <div className="wsDashCountdownRight">
            <div className="wsDashCountdownBarWrap">
              <span className="wsDashCountdownPct">{progress}%</span>
              <div className="wsDashCountdownBar">
                <div className="wsDashCountdownBarFill" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <div className="wsDashCountdownLinks">
              <button onClick={() => navigate("/workspace/planos")}>Planos →</button>
              <button onClick={() => navigate("/workspace/stakeholders")}>Pessoas →</button>
              <button onClick={() => navigate("/workspace/okrs")}>OKRs →</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

