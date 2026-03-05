import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { loadCases, saveCases, type CaseItem } from "../data/casesStorage";
import "./CasesCms.css";

const CMS_AUTH_KEY = "cases_cms_auth";
const PASSWORD = "Alohomora!";

const defaultCase = (): CaseItem => ({
  title: "New project",
  description: "",
  tags: [],
  year: new Date().getFullYear().toString(),
  hidden: false,
});

/* Icons as inline SVG */
const Icons = {
  Folder: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  ),
  Plus: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Eye: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ),
  EyeOff: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ),
  Trash: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  ),
  Save: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
    </svg>
  ),
  External: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  ),
  LogOut: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
};

export default function CasesCms() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cases, setCases] = useState<CaseItem[]>(loadCases);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(CMS_AUTH_KEY) === "1") setAuthenticated(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password === PASSWORD) {
      sessionStorage.setItem(CMS_AUTH_KEY, "1");
      setAuthenticated(true);
    } else {
      setError("Wrong password.");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(CMS_AUTH_KEY);
    setAuthenticated(false);
    setPassword("");
  };

  const updateCase = (index: number, field: keyof CaseItem, value: string | string[] | boolean) => {
    const next = cases.map((c, i) =>
      i === index ? { ...c, [field]: value } : c
    );
    setCases(next);
    saveCases(next);
  };

  const addProject = () => {
    const next = [...cases, defaultCase()];
    setCases(next);
    saveCases(next);
    setSelectedIndex(next.length - 1);
  };

  const removeProject = (index: number) => {
    if (cases.length <= 1) return;
    const next = cases.filter((_, i) => i !== index);
    setCases(next);
    saveCases(next);
    setSelectedIds((s) => { const n = new Set(s); n.delete(index); return n; });
    setSelectedIndex(Math.min(selectedIndex, next.length - 1));
    if (selectedIndex >= next.length) setSelectedIndex(Math.max(0, next.length - 1));
  };

  const toggleSelect = (index: number) => {
    setSelectedIds((s) => {
      const n = new Set(s);
      if (n.has(index)) n.delete(index);
      else n.add(index);
      return n;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === cases.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(cases.map((_, i) => i)));
  };

  const bulkHide = () => {
    const next = cases.map((c, i) => (selectedIds.has(i) ? { ...c, hidden: true } : c));
    setCases(next);
    saveCases(next);
    setSelectedIds(new Set());
  };

  const bulkShow = () => {
    const next = cases.map((c, i) => (selectedIds.has(i) ? { ...c, hidden: false } : c));
    setCases(next);
    saveCases(next);
    setSelectedIds(new Set());
  };

  const bulkDelete = () => {
    if (cases.length - selectedIds.size < 1) return;
    const next = cases.filter((_, i) => !selectedIds.has(i));
    setCases(next);
    saveCases(next);
    setSelectedIds(new Set());
    const removedBefore = [...selectedIds].filter((i) => i < selectedIndex).length;
    const newIndex = selectedIds.has(selectedIndex)
      ? Math.min(selectedIndex, next.length - 1)
      : selectedIndex - removedBefore;
    setSelectedIndex(Math.max(0, Math.min(newIndex, next.length - 1)));
  };

  const handlePublish = () => {
    saveCases(cases);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  const selected = cases[selectedIndex];
  const hasSelection = selectedIds.size > 0;

  if (!authenticated) {
    return (
      <div className="casesCmsGate">
        <div className="casesCmsGateInner">
          <h1>Cases CMS</h1>
          <p>Enter the password to manage cases.</p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoFocus
              className="casesCmsInput"
            />
            {error && <p className="casesCmsError">{error}</p>}
            <button type="submit" className="primary casesCmsBtn">
              Access
            </button>
          </form>
          <Link to="/" className="casesCmsBack">
            ← Back to site
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="casesCms">
      <div className="casesCmsHeader">
        <h1>Cases CMS</h1>
        <div className="casesCmsHeaderActions">
          <Link to="/" className="secondary casesCmsBtn casesCmsBtnIcon">
            <Icons.External />
            <span>View site</span>
          </Link>
          <button type="button" onClick={handleLogout} className="secondary casesCmsBtn casesCmsBtnIcon">
            <Icons.LogOut />
            <span>Log out</span>
          </button>
        </div>
      </div>
      <p className="casesCmsHint">
        Edits are saved in this browser. Hidden projects do not appear on the site. Use Save to publish changes.
      </p>

      <div className="casesCmsLayout">
        <aside className="casesCmsMenu">
          <div className="casesCmsMenuHead">
            <span className="casesCmsMenuTitle">Projects</span>
            <button type="button" className="casesCmsAddBtn" onClick={addProject}>
              <Icons.Plus />
              <span>Add project</span>
            </button>
          </div>
          {cases.length > 0 && (
            <>
              <div className="casesCmsBulkBar">
                <label className="casesCmsCheckLabel">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === cases.length && cases.length > 0}
                    onChange={selectAll}
                    ref={(el) => {
                      if (el) el.indeterminate = selectedIds.size > 0 && selectedIds.size < cases.length;
                    }}
                  />
                  <span>Select all</span>
                </label>
                {hasSelection && (
                  <div className="casesCmsBulkActions">
                    <button type="button" className="casesCmsBulkBtn" onClick={bulkShow} title="Show on site">
                      <Icons.Eye />
                      <span>Show</span>
                    </button>
                    <button type="button" className="casesCmsBulkBtn" onClick={bulkHide} title="Hide from site">
                      <Icons.EyeOff />
                      <span>Hide</span>
                    </button>
                    {cases.length - selectedIds.size >= 1 && (
                      <button type="button" className="casesCmsBulkBtn casesCmsBulkBtnDanger" onClick={bulkDelete} title="Delete">
                        <Icons.Trash />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
              <ul className="casesCmsMenuList">
                {cases.map((item, index) => (
                  <li key={index}>
                    <label className="casesCmsMenuItemWrap">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(index)}
                        onChange={() => toggleSelect(index)}
                        onClick={(e) => e.stopPropagation()}
                        className="casesCmsCheck"
                      />
                      <button
                        type="button"
                        className={`casesCmsMenuItem ${index === selectedIndex ? "casesCmsMenuItemActive" : ""} ${item.hidden ? "casesCmsMenuItemHidden" : ""}`}
                        onClick={() => setSelectedIndex(index)}
                      >
                        <Icons.Folder />
                        <span className="casesCmsMenuItemText">{item.title || "Untitled"}</span>
                        {item.hidden && (
                          <span className="casesCmsHiddenBadge" title="Hidden from site">
                            <Icons.EyeOff />
                          </span>
                        )}
                      </button>
                    </label>
                  </li>
                ))}
              </ul>
            </>
          )}
        </aside>

        <div className="casesCmsEditor">
          {selected ? (
            <article className="casesCmsCard">
              <div className="casesCmsCardHeader">
                <span className="casesCmsCardTitle">Edit project</span>
                <div className="casesCmsCardActions">
                  <button type="button" className="casesCmsPublishBtn" onClick={handlePublish}>
                    <Icons.Save />
                    <span>{savedToast ? "Saved" : "Save & publish"}</span>
                  </button>
                  {cases.length > 1 && (
                    <button
                      type="button"
                      className="casesCmsDeleteBtn"
                      onClick={() => removeProject(selectedIndex)}
                      title="Remove project"
                    >
                      <Icons.Trash />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              </div>
              <label className="casesCmsToggleLabel">
                <input
                  type="checkbox"
                  checked={!!selected.hidden}
                  onChange={(e) => updateCase(selectedIndex, "hidden", e.target.checked)}
                  className="casesCmsToggle"
                />
                <span className="casesCmsToggleText">
                  <Icons.EyeOff />
                  Hidden from site (project stays in CMS)
                </span>
              </label>
              <label>
                <span className="casesCmsLabel">Year</span>
                <input
                  type="text"
                  value={selected.year}
                  onChange={(e) => updateCase(selectedIndex, "year", e.target.value)}
                  className="casesCmsInput"
                />
              </label>
              <label>
                <span className="casesCmsLabel">Title</span>
                <input
                  type="text"
                  value={selected.title}
                  onChange={(e) => updateCase(selectedIndex, "title", e.target.value)}
                  className="casesCmsInput"
                />
              </label>
              <label>
                <span className="casesCmsLabel">Description</span>
                <textarea
                  value={selected.description}
                  onChange={(e) => updateCase(selectedIndex, "description", e.target.value)}
                  className="casesCmsInput casesCmsTextarea"
                  rows={3}
                />
              </label>
              <label>
                <span className="casesCmsLabel">Tags (comma-separated)</span>
                <input
                  type="text"
                  value={selected.tags.join(", ")}
                  onChange={(e) =>
                    updateCase(
                      selectedIndex,
                      "tags",
                      e.target.value.split(",").map((t) => t.trim()).filter(Boolean)
                    )
                  }
                  className="casesCmsInput"
                />
              </label>
            </article>
          ) : (
            <p className="casesCmsEmpty">No projects. Click “Add project” to create one.</p>
          )}
        </div>
      </div>
    </div>
  );
}
