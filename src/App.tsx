import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import { ColorSchemeProvider } from "./contexts/ColorSchemeContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import CasesCms from "./pages/CasesCms";
import CaseView from "./pages/CaseView";
import WorkspaceGuard from "./pages/Workspace/WorkspaceGuard";
import WorkspaceLogin from "./pages/Workspace/WorkspaceLogin";
import WorkspaceLayout from "./pages/Workspace/WorkspaceLayout";
import WSHome from "./pages/Workspace/Home";
import Semana from "./pages/Workspace/Semana";
import Planos from "./pages/Workspace/Planos";
import Benchmarks from "./pages/Workspace/Benchmarks";
import Historico from "./pages/Workspace/Historico";
import OKRs from "./pages/Workspace/OKRs";
import Stakeholders from "./pages/Workspace/Stakeholders";
import UmaUm from "./pages/Workspace/UmaUm";
import Dados from "./pages/Workspace/Dados";

export default function App() {
  return (
    <BrowserRouter>
      <ColorSchemeProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="cases-admin" element={<CasesCms />} />
            <Route path="case/:slug" element={<CaseView />} />
          </Route>

          <Route path="/workspace/login" element={<WorkspaceLogin />} />
          <Route path="/workspace" element={<WorkspaceGuard />}>
            <Route index element={<Navigate to="/workspace/home" replace />} />
            <Route element={<WorkspaceLayout />}>
              <Route path="home" element={<WSHome />} />
              <Route path="semana" element={<Semana />} />
              <Route path="planos" element={<Planos />} />
              <Route path="benchmarks" element={<Benchmarks />} />
              <Route path="historico" element={<Historico />} />
              <Route path="okrs" element={<OKRs />} />
              <Route path="stakeholders" element={<Stakeholders />} />
              <Route path="um-a-um" element={<UmaUm />} />
              <Route path="dados" element={<Dados />} />
            </Route>
          </Route>
        </Routes>
      </ColorSchemeProvider>
    </BrowserRouter>
  );
}
