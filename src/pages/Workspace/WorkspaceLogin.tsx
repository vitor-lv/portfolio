import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { isWsAuthenticated, setWsAuthenticated } from "./WorkspaceGuard";
import "./WorkspaceLogin.css";

export default function WorkspaceLogin() {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  if (isWsAuthenticated()) {
    navigate("/workspace/home", { replace: true });
    return null;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const correct = import.meta.env.VITE_WORKSPACE_PASSWORD;
    if (pw === correct) {
      setWsAuthenticated();
      navigate("/workspace/home", { replace: true });
    } else {
      setError(true);
      setPw("");
    }
  }

  return (
    <div className="wsLogin">
      <form className="wsLoginCard" onSubmit={handleSubmit}>
        <h1 className="wsLoginTitle">Workspace</h1>
        <div className="wsLoginField">
          <label className="wsLoginLabel" htmlFor="ws-pw">Senha</label>
          <input
            id="ws-pw"
            type="password"
            className={`wsLoginInput${error ? " wsLoginInput--error" : ""}`}
            value={pw}
            onChange={e => { setPw(e.target.value); setError(false); }}
            placeholder="••••••••"
            autoFocus
            autoComplete="current-password"
          />
          {error && <p className="wsLoginError">Senha incorreta</p>}
        </div>
        <button type="submit" className="wsLoginBtn">Entrar →</button>
      </form>
    </div>
  );
}
