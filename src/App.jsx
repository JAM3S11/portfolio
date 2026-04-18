import React from "react";
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

function App() {
  return (
    <ThemeProvider>
      <div className="flex flex-col min-h-screen scroll-smooth">

        <div className="relative z-10 flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
          <Header />
      
          <main className="grow">
            <HomePage />
            <AboutPage />
            <ExperiencePage />
            <ProjectsPage />
            <ContactPage />
          </main>

          <Footer />

          <ScrollToTop />
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;