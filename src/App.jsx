import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Cinematic from './components/Cinematic';
import Portfolio from './components/Portfolio';
import Gallery from './components/Gallery';
import Services from './components/Services';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import Admin from './components/Admin';

const Home = () => (
  <>
    <main>
      <Hero />
      <Cinematic />
      <Portfolio />
      <Gallery />
      <Services />
      <About />
      <Contact />
    </main>
    <Footer />
    <FloatingWhatsApp />
  </>
);

function App() {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored) { setTheme(stored); return; }
    if (window.matchMedia?.('(prefers-color-scheme: light)').matches) setTheme('light');
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return (
    <div className="bg-white text-gray-800 dark:bg-black dark:text-gray-300 min-h-screen font-sans selection:bg-gold-500 selection:text-white dark:selection:text-black transition-colors duration-300">
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </div>
  );
}

export default App;
