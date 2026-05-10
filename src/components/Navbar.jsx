import React, { useState, useEffect } from 'react';
import { Menu, X, Camera, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = ({ theme, toggleTheme }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { name: 'Home',      id: 'home' },
    { name: 'Showreel',  id: 'showreel' },
    { name: 'Portfolio', id: 'portfolio' },
    { name: 'Gallery',   id: 'gallery' },
    { name: 'Services',  id: 'services' },
    { name: 'About',     id: 'about' },
    { name: 'Contact',   id: 'contact' },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll to a section by id
  const scrollToSection = (id) => {
    setIsMobileMenuOpen(false);

    // If not on home page, navigate home first then scroll
    if (location.pathname !== '/') {
      navigate('/');
      // Wait for navigation then scroll
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      return;
    }

    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const isAdmin = location.pathname === '/admin';

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-500 transform-gpu ${
        isScrolled
          ? 'bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md md:backdrop-blur-2xl py-4 shadow-[0_4px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.5)] border-b border-black/5 dark:border-white/10'
          : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-6 md:px-12 flex justify-between items-center">
        {/* Logo */}
        <button onClick={() => scrollToSection('home')} className="flex items-center gap-2 group outline-none">
          <img
            src="/logo-transparent.png"
            alt="Elite Studio"
            className="h-12 md:h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            style={{ filter: 'drop-shadow(0 0 8px rgba(212,175,55,0.4)) brightness(1.1)' }}
          />
        </button>

        <div className="flex items-center gap-6">
          {/* Desktop Nav — hide on admin page */}
          {!isAdmin && (
            <nav className="hidden md:flex gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => scrollToSection(link.id)}
                  className={`relative text-xs font-semibold uppercase tracking-[0.15em] outline-none group transition-colors duration-300 ${
                    isScrolled ? 'text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white' : 'text-white/80 hover:text-white drop-shadow-md'
                  }`}
                >
                  {link.name}
                  <span className={`absolute -bottom-1 left-0 w-0 h-[2px] rounded-full transition-all duration-300 group-hover:w-full ${isScrolled ? 'bg-gold-500' : 'bg-gold-400'}`}></span>
                </button>
              ))}
            </nav>
          )}

          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className={`relative p-2.5 rounded-full transition-all duration-300 outline-none overflow-hidden ${
              isScrolled
                ? 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10'
                : 'text-white hover:bg-white/20 backdrop-blur-sm'
            }`}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={theme}
                initial={{ y: -20, opacity: 0, rotate: -90 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: 20, opacity: 0, rotate: 90 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </motion.div>
            </AnimatePresence>
          </motion.button>

          {/* Mobile Menu Button */}
          {!isAdmin && (
            <button
              className={`md:hidden p-2 rounded-full transition-all duration-300 ${isScrolled ? 'text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10' : 'text-white hover:bg-white/20 backdrop-blur-sm'}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="absolute top-full left-0 w-full bg-white/95 dark:bg-[#0a0a0a]/95 border-b border-black/5 dark:border-white/5 flex flex-col px-6 shadow-2xl overflow-hidden md:hidden transform-gpu will-change-transform"
          >
            <div className="py-6 flex flex-col gap-6">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => scrollToSection(link.id)}
                  className="text-sm font-semibold text-gray-800 dark:text-gray-200 hover:text-gold-500 dark:hover:text-gold-400 transition-colors uppercase tracking-[0.2em] text-center w-full py-2"
                >
                  {link.name}
                </button>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
