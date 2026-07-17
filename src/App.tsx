import React from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Layout from "./components/Layout";

// Public Pages
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import FocusAreasPage from "./pages/FocusAreasPage";
import ApproachPage from "./pages/ApproachPage";
import EventsPage from "./pages/EventsPage";
import HighlightsPage from "./pages/HighlightsPage";
import TeamPage from "./pages/TeamPage";
import PartnersPage from "./pages/PartnersPage";
import LogoShowcasePage from "./pages/LogoShowcasePage";
import ContactPage from "./pages/ContactPage";

// Admin Pages
import AdminSetupPage from "./pages/admin/AdminSetupPage";
import AdminDashboard from "./components/AdminDashboard";

export default function App() {
  const navigate = useNavigate();

  React.useEffect(() => {
    const checkHash = () => {
      if (window.location.hash.toUpperCase() === "#ADMIN") {
        // Clear hash to hide from address bar if desired, then navigate
        window.location.hash = "";
        navigate("/admin");
      }
    };

    // Run on mount
    checkHash();

    // Run on hash changes
    window.addEventListener("hashchange", checkHash);
    return () => {
      window.removeEventListener("hashchange", checkHash);
    };
  }, [navigate]);

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Admin Setup */}
        <Route path="/admin/setup" element={<AdminSetupPage />} />
        
        {/* Admin Panels */}
        <Route 
          path="/admin" 
          element={
            <AdminDashboard 
              onBackToSite={() => navigate("/")} 
              onContentUpdated={() => {}} 
            />
          } 
        />
        <Route 
          path="/admin/*" 
          element={
            <AdminDashboard 
              onBackToSite={() => navigate("/")} 
              onContentUpdated={() => {}} 
            />
          } 
        />

        {/* Public Marketing Pages wrapped in Shared Layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/focus-areas" element={<FocusAreasPage />} />
          <Route path="/approach" element={<ApproachPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/highlights" element={<HighlightsPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/partners" element={<PartnersPage />} />
          <Route path="/logo-showcase" element={<LogoShowcasePage />} />
          <Route path="/contact" element={<ContactPage />} />
          
          {/* Fallback redirects */}
          <Route path="/brand-logo-showcase" element={<Navigate to="/partners" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </>
  );
}
