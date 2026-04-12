import { useState, useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

interface Task {
  id: string;
  week_id: string;
  text: string;
  done: boolean;
}

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
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function WSHome() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [rituals, setRituals] = useState<Ritual[]>([]);
  const [newTask, setNewTask] = useState("");

  const currentWeekId = getWeekId();

  useEffect(() => {
    try {
      setTasks(JSON.parse(localStorage.getItem("lv:tasks") || "[]"));
      setRituals(JSON.parse(localStorage.getItem("lv:rituals") || "[]"));
    } catch { /* ignore */ }
  }, []);

  function saveTasks(updated: Task[]) {
    setTasks(updated);
    localStorage.setItem("lv:tasks", JSON.stringify(updated));
  }

  function toggleTask(id: string) {
    saveTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }

  function deleteTask(id: string) {
    saveTasks(tasks.filter(t => t.id !== id));
  }

  function addTask(e: FormEvent) {
    e.preventDefault();
    const text = newTask.trim();
    if (!text) return;
    saveTasks([...tasks, { id: Date.now().toString(), week_id: currentWeekId, text, done: false }]);
    setNewTask("");
  }

  function getCurrentStreak(): number {
    const ritualWeeks = new Set(rituals.map(r => r.week_id));
    let streak = 0;
    const checkDate = new Date();
    while (true) {
      if (ritualWeeks.has(getWeekId(checkDate))) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 7);
      } else {
        break;
      }
    }
    return streak;
  }

  function getLast8Weeks(): { week_id: string; hasRitual: boolean }[] {
    const ritualWeeks = new Set(rituals.map(r => r.week_id));
    return Array.from({ length: 8 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (7 - i) * 7);
      const wid = getWeekId(d);
      return { week_id: wid, hasRitual: ritualWeeks.has(wid) };
    });
  }

  const weekTasks = tasks.filter(t => t.week_id === currentWeekId);
  const doneTasks = weekTasks.filter(t => t.done);
  const hasRitualThisWeek = rituals.some(r => r.week_id === currentWeekId);
  const streak = getCurrentStreak();
  const last8 = getLast8Weeks();

  return (
    <div className="wsHomePage">
      <div className="wsPageHeader">
        <h1 className="wsPageTitle">Olá, LV</h1>
        <p className="wsPageSubtitle" style={{ textTransform: "capitalize" }}>
          {formatDatePtBr()}
        </p>
      </div>

      {/* Ritual banner */}
      <div className={`wsRitualBanner${hasRitualThisWeek ? " wsRitualBanner--done" : " wsRitualBanner--pending"}`}>
        <span className="wsRitualBannerText">
          {hasRitualThisWeek
            ? "Ritual desta semana feito — Volte na próxima sexta"
            : "Ritual desta semana pendente — Reserve 10 minutos agora"}
        </span>
        {!hasRitualThisWeek && (
          <button className="wsRitualBannerBtn" onClick={() => navigate("/workspace/semana")}>
            Iniciar →
          </button>
        )}
      </div>

      {/* Metrics */}
      <div className="wsMetricGrid">
        <div className="wsMetricCard">
          <span className="wsMetricValue">{doneTasks.length}/{weekTasks.length}</span>
          <span className="wsMetricLabel">Tarefas esta semana</span>
        </div>
        <div className="wsMetricCard">
          <span className="wsMetricValue">{rituals.length}</span>
          <span className="wsMetricLabel">Rituais feitos</span>
        </div>
        <div className="wsMetricCard">
          <span className="wsMetricValue">{streak}</span>
          <span className="wsMetricLabel">Sequência atual</span>
        </div>
      </div>

      {/* Streak bar */}
      <div className="wsStreakSection">
        <p className="wsStreakLabel">Últimas 8 semanas</p>
        <div className="wsStreakDots">
          {last8.map(({ week_id, hasRitual }) => (
            <span
              key={week_id}
              className={`wsStreakDot${hasRitual ? " wsStreakDot--green" : ""}`}
              title={week_id}
            />
          ))}
        </div>
      </div>

      {/* Tasks */}
      <section className="wsTaskSection">
        <h2 className="wsSectionTitle">Tarefas da semana</h2>
        <ul className="wsTaskList">
          {weekTasks.length === 0 && (
            <li className="wsTaskEmpty">Nenhuma tarefa ainda.</li>
          )}
          {weekTasks.map(task => (
            <li key={task.id} className="wsTaskItem">
              <label className="wsTaskCheck">
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => toggleTask(task.id)}
                />
                <span className={`wsTaskText${task.done ? " wsTaskText--done" : ""}`}>
                  {task.text}
                </span>
              </label>
              <button
                className="wsTaskDelete"
                onClick={() => deleteTask(task.id)}
                aria-label="Remover tarefa"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
        <form className="wsTaskAddForm" onSubmit={addTask}>
          <input
            className="wsTaskAddInput"
            type="text"
            placeholder="Nova tarefa..."
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
          />
          <button type="submit" className="wsTaskAddBtn">Adicionar</button>
        </form>
      </section>
    </div>
  );
}
