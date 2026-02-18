import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import { ColorSchemeProvider } from "./contexts/ColorSchemeContext";
import Layout from "./components/Layout";
import Home from "./pages/Home.tsx";
import About from "./pages/About";
import Contact from "./pages/Contact";

export default function App() {
  return (
    <BrowserRouter>
      <ColorSchemeProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
        </Route>
      </Routes>
      </ColorSchemeProvider>
    </BrowserRouter>
  );
}
