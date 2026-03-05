import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import { ColorSchemeProvider } from "./contexts/ColorSchemeContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import CasesCms from "./pages/CasesCms";
import CaseView from "./pages/CaseView";

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
      </Routes>
      </ColorSchemeProvider>
    </BrowserRouter>
  );
}
