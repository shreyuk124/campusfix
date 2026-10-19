
import { Routes, Route } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import LandingPage from "../pages/LandingPage";
import PlaceholderPage from "../pages/PlaceholderPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PlaceholderPage />} />
      <Route path="/register" element={<PlaceholderPage />} />

      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<PlaceholderPage />} />
        <Route path="/issues" element={<PlaceholderPage />} />
        <Route path="/report" element={<PlaceholderPage />} />
        <Route path="/settings" element={<PlaceholderPage />} />
      </Route>

      <Route path="*" element={<PlaceholderPage />} />
    </Routes>
  );
}
