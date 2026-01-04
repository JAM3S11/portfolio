import React from "react";
import Header from "./common/Header";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";

function App() {
  return (
    <div className="flex flex-col min-h-screen scroll-smooth bg-[#0a0f16]">
      <Header />

      <main className="grow">
        <section id="home">
          <HomePage />
        </section>

        <section id="about">
          <AboutPage />
        </section>
      </main>
    </div>
  );
}

export default App;