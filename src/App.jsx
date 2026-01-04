import React from "react";
import Header from "./common/Header";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";

function App() {
  return (
    // 'scroll-smooth' allows the browser to glide to the IDs
    <div className="flex flex-col min-h-screen scroll-smooth bg-[#0a0f16]">
      <Header />

      <main className="grow">
        {/* Each component now acts as a section with an ID */}
        <section id="home">
          <HomePage />
        </section>

        <section id="about">
          <AboutPage />
        </section>
        
        {/* You can add more sections here like <ProjectsPage /> */}
      </main>
    </div>
  );
}

export default App;