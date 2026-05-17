import React from "react";
import { Routes, Route, useLocation } from "react-router";
import Header from "./common/Header";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import { ThemeProvider } from "./content/ThemeProvider";
import ScrollToTop from "./common/ScrollToTop";
import ExperienceSection from "./pages/ExperiencePage";
import ExperiencePage from "./pages/ExperiencePage";
import ProjectsPage from "./pages/ProjectsPage";
import ContactPage from "./pages/ContactPage";
import Footer from "./common/Footer";
import AdminDashboard from "./pages/AdminDashboard";
import ChatWidget from "./components/chat/ChatWidget";
import { Toaster } from "sonner";

function App() {
  const location = useLocation();
  const isAdminPage = location.pathname === '/admin';

  return (
    <ThemeProvider>
      <div className="flex flex-col min-h-screen scroll-smooth">

        <div className="relative z-10 flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
          {!isAdminPage && <Header />}
      
          <main className="grow">
            <Routes>
              <Route path="/" element={
                <>
                  <HomePage />
                  <AboutPage />
                  <ExperiencePage />
                  <ProjectsPage />
                  <ContactPage />
                </>
              } />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </main>

          {!isAdminPage && <Footer />}

          <ScrollToTop />
          
          {!isAdminPage && <ChatWidget />}
        </div>

        <Toaster position="top-center" richColors />

      </div>
    </ThemeProvider>
  );
}

export default App;