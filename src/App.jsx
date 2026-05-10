import React, { useState, useEffect, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';

// Lazy loaded components (below the fold or separate routes)
const Cinematic = React.lazy(() => import('./components/Cinematic'));
const Portfolio = React.lazy(() => import('./components/Portfolio'));
const Gallery = React.lazy(() => import('./components/Gallery'));
const Services = React.lazy(() => import('./components/Services'));
const About = React.lazy(() => import('./components/About'));
const Contact = React.lazy(() => import('./components/Contact'));
const Footer = React.lazy(() => import('./components/Footer'));
const FloatingWhatsApp = React.lazy(() => import('./components/FloatingWhatsApp'));
const Admin = React.lazy(() => import('./components/Admin'));

// Loading fallback component
const Loader = () => (
  <div className="flex justify-center items-center py-20">
    <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const Home = () => (
  <>
    <main>
      <Hero />
      <Suspense fallback={<Loader />}>
        <Cinematic />
        <Portfolio />
        <Gallery />
        <Services />
        <About />
        <Contact />
      </Suspense>
    </main>
    <Suspense fallback={null}>
      <Footer />
      <FloatingWhatsApp />
    </Suspense>
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
      <Suspense fallback={<div className="h-screen flex items-center justify-center bg-white dark:bg-black"><Loader /></div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
