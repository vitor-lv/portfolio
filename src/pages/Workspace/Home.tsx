import { useState, useEffect, useRef, type FormEvent, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

interface Note {
  id: string;
  date: string; // YYYY-MM-DD
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

function getTodayId(): string {
  return new Date().toISOString().split("T")[0];
}

function formatDatePtBr(date = new Date()): string {
  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatGroupDate(dateStr: string): string {
  const today = getTodayId();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yId = yesterday.toISOString().split("T")[0];

  if (dateStr === today) return "Hoje";
  if (dateStr === yId) return "Ontem";

  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
}

function migrateNotes(raw: unknown[]): Note[] {
  return raw.map((item: unknown) => {
    const t = item as Record<string, unknown>;
    if (t.date) return t as unknown as Note;
    // legacy: had week_id, convert to today
    return { id: t.id as string, date: getTodayId(), text: t.text as string, done: t.done as boolean };
  });
}

export default function WSHome() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [rituals, setRituals] = useState<Ritual[]>([]);
  const [newNote, setNewNote] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const editRef = useRef<HTMLInputElement>(null);

  const todayId = getTodayId();

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem("lv:tasks") || "[]");
      setNotes(migrateNotes(raw));
      setRituals(JSON.parse(localStorage.getItem("lv:rituals") || "[]"));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (editingId && editRef.current) editRef.current.focus();
  }, [editingId]);

  function saveNotes(updated: Note[]) {
    setNotes(updated);
    localStorage.setItem("lv:tasks", JSON.stringify(updated));
  }

  function toggleNote(id: string) {
    saveNotes(notes.map(n => n.id === id ? { ...n, done: !n.done } : n));
  }

  function deleteNote(id: string) {
    saveNotes(notes.filter(n => n.id !== id));
    if (editingId === id) setEditingId(null);
  }

  function addNote(e: FormEvent) {
    e.preventDefault();
    const text = newNote.trim();
    if (!text) return;
    saveNotes([...notes, { id: Date.now().toString(), date: todayId, text, done: false }]);
    setNewNote("");
  }

  function startEdit(note: Note) {
    setEditingId(note.id);
    setEditText(note.text);
  }

  function commitEdit(id: string) {
    const text = editText.trim();
    if (text) saveNotes(notes.map(n => n.id === id ? { ...n, text } : n));
    setEditingId(null);
  }

  function handleEditKey(e: KeyboardEvent, id: string) {
    if (e.key === "Enter") commitEdit(id);
    if (e.key === "Escape") setEditingId(null);
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

  // Group notes by date, sorted newest first
  const notesByDate = notes.reduce<Record<string, Note[]>>((acc, n) => {
    (acc[n.date] ??= []).push(n);
    return acc;
  }, {});
  const sortedDates = Object.keys(notesByDate).sort((a, b) => b.localeCompare(a));
  // Ensure today always appears first
  if (!notesByDate[todayId]) sortedDates.unshift(todayId);

  const todayNotes = notesByDate[todayId] ?? [];
  const todayDone = todayNotes.filter(n => n.done).length;

  const hasRitualThisWeek = rituals.some(r => r.week_id === getWeekId());
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
          <span className="wsMetricValue">{todayDone}/{todayNotes.length}</span>
          <span className="wsMetricLabel">Notas hoje</span>
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

      {/* Notes */}
      <section className="wsNotesSection">
        <h2 className="wsSectionTitle">Notas</h2>

        {sortedDates.map(date => {
          const dayNotes = notesByDate[date] ?? [];
          const isToday = date === todayId;
          return (
            <div key={date} className="wsNotesGroup">
              <p className="wsNotesGroupDate">{formatGroupDate(date)}</p>
              <ul className="wsNoteList">
                {dayNotes.length === 0 && isToday && (
                  <li className="wsNoteEmpty">Nenhuma nota ainda.</li>
                )}
                {dayNotes.map(note => (
                  <li key={note.id} className="wsNoteItem">
                    <label className="wsNoteCheck">
                      <input
                        type="checkbox"
                        checked={note.done}
                        onChange={() => toggleNote(note.id)}
                      />
                      {editingId === note.id ? (
                        <input
                          ref={editRef}
                          className="wsNoteEditInput"
                          value={editText}
                          onChange={e => setEditText(e.target.value)}
                          onBlur={() => commitEdit(note.id)}
                          onKeyDown={e => handleEditKey(e, note.id)}
                        />
                      ) : (
                        <span
                          className={`wsNoteText${note.done ? " wsNoteText--done" : ""}`}
                          onDoubleClick={() => !note.done && startEdit(note)}
                        >
                          {note.text}
                        </span>
                      )}
                    </label>
                    <button
                      className="wsNoteDelete"
                      onClick={() => deleteNote(note.id)}
                      aria-label="Remover nota"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
              {isToday && (
                <form className="wsNoteAddForm" onSubmit={addNote}>
                  <input
                    className="wsNoteAddInput"
                    type="text"
                    placeholder="Nova nota..."
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                  />
                  <button type="submit" className="wsNoteAddBtn">+</button>
                </form>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}
