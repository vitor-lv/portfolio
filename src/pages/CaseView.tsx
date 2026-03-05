import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { loadCases } from "../data/casesStorage";
import "./CaseView.css";

const PROJECT_VIEW_AUTH_KEY = "case_view_auth";
const PASSWORD = "Alohomora!";

const SLUG_TO_TITLE: Record<string, string> = {
  "account-opening-experience": "Account Opening Experience",
};

export default function CaseView() {
  const { slug } = useParams<{ slug: string }>();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cases] = useState(loadCases);

  const title = slug ? SLUG_TO_TITLE[slug] : null;
  const project = title ? cases.find((c) => c.title === title) : null;

  useEffect(() => {
    if (sessionStorage.getItem(PROJECT_VIEW_AUTH_KEY) === "1") setAuthenticated(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password === PASSWORD) {
      sessionStorage.setItem(PROJECT_VIEW_AUTH_KEY, "1");
      setAuthenticated(true);
    } else {
      setError("Wrong password.");
    }
  };

  if (!slug || !project) {
    return (
      <div className="caseViewGate">
        <div className="caseViewGateInner">
          <h1>Project not found</h1>
          <Link to="/#work" className="primary caseViewBtn">
            Back to work
          </Link>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="caseViewGate">
        <div className="caseViewGateInner">
          <h1>{project.title}</h1>
          <p>This project is protected. Enter the password to view.</p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoFocus
              className="caseViewInput"
            />
            {error && <p className="caseViewError">{error}</p>}
            <button type="submit" className="primary caseViewBtn">
              View project
            </button>
          </form>
          <Link to="/#work" className="caseViewBack">
            ← Back to work
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="caseView">
      <div className="caseViewHeader">
        <Link to="/#work" className="caseViewBackLink">
          ← Selected Work
        </Link>
      </div>
      <article className="caseViewArticle">
        <span className="caseViewYear">{project.year}</span>
        <h1 className="caseViewTitle">{project.title}</h1>
        <p className="caseViewDescription">{project.description}</p>
        <div className="caseViewTags">
          {project.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
        <div className="caseViewContent">
          <p>
            Project content and case study details can be added here. You can expand this section with images, process, and outcomes.
          </p>
        </div>
      </article>
    </div>
  );
}
