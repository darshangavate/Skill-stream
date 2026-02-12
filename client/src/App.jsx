import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Shell from "./components/Shell";
import Dashboard from "./pages/Dashboard";
import Quiz from "./pages/Quiz";
import Path from "./pages/Path";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Shell />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/path" element={<Path />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
