import { Navigate, Outlet } from "react-router-dom";

export const WS_AUTH_KEY = "lv:ws_auth";

export function isWsAuthenticated(): boolean {
  return sessionStorage.getItem(WS_AUTH_KEY) === "true";
}

export function setWsAuthenticated(): void {
  sessionStorage.setItem(WS_AUTH_KEY, "true");
}

export function clearWsTrusted(): void {
  sessionStorage.removeItem(WS_AUTH_KEY);
}

export default function WorkspaceGuard() {
  if (!isWsAuthenticated()) {
    return <Navigate to="/workspace/login" replace />;
  }
  return <Outlet />;
}

