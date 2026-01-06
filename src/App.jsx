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

function App() {
  return (
    <ThemeProvider>
      <div className="flex flex-col min-h-screen scroll-smooth bg-[#0a0f16]">
        <Header />
    
        <main className="grow">
          <section id="home">
            <HomePage />
          </section>
    
          <section id="about">
            <AboutPage />
          </section>

          <section id="experience">
            <ExperiencePage />
          </section>

          <section id="projects">
            <ProjectsPage />
          </section>

          <section id="contacts">
            <ContactPage />
          </section>
        </main>

        <ScrollToTop />
      </div>
    </ThemeProvider>
  );
}

export default App;