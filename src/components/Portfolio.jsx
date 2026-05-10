import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Loader2, AlertCircle } from 'lucide-react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';

// Fallback data in case the database fails or is not yet connected
const fallbackItems = [
  {
    id: 1,
    category: 'Wedding',
    title: 'The Royal Indian Wedding',
    image: '/royal_indian_wedding.png',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  },
  {
    id: 2,
    category: 'Pre-wedding',
    title: 'Sunrise In Rajasthan',
    image: '/indian_pre_wedding.png',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  },
  {
    id: 3,
    category: 'Haldi',
    title: 'Vibrant Haldi Ceremony',
    image: '/vibrant_haldi_event.png',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  },
  {
    id: 4,
    category: 'Reels',
    title: 'Fashion Influencer Reel',
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1974&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  },
  {
    id: 5,
    category: 'Promotional',
    title: 'Luxury Brand Campaign',
    image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2071&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  },
  {
    id: 6,
    category: 'Wedding',
    title: 'A Cinematic Love Story',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  }
];

const Portfolio = () => {
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const timeout = (ms) => new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Firebase timeout')), ms)
    );

    const fetchPortfolioData = async () => {
      try {
        const q = query(collection(db, "portfolioItems"), orderBy("createdAt", "desc"));
        const querySnapshot = await Promise.race([getDocs(q), timeout(5000)]);

        const fetchedItems = [];
        querySnapshot.forEach((doc) => {
          fetchedItems.push({ id: doc.id, ...doc.data() });
        });

        setItems(fetchedItems.length > 0 ? fetchedItems : fallbackItems);
        setLoading(false);
      } catch (err) {
        // Firestore blocked or timed out — silently use fallback
        setItems(fallbackItems);
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, []);

  // close modal on escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setSelectedVideo(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Dynamically generate categories based on the data
  const categories = ['All', ...new Set(items.map(item => item.category))];

  const filteredItems = activeCategory === 'All' 
    ? items 
    : items.filter(item => item.category === activeCategory);

  return (
    <section id="portfolio" className="py-32 bg-gray-50 dark:bg-[#050505] relative transition-colors duration-300 overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-500/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gold-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center mb-20">
          <motion.span 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="text-gold-500 uppercase tracking-[0.3em] text-xs font-bold mb-3 block"
          >
            Our Masterpieces
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl md:text-5xl lg:text-6xl font-serif text-black dark:text-white transition-colors duration-300 tracking-wide"
          >
            Featured Work
          </motion.h2>
          <motion.div 
            initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.4 }}
            className="w-24 h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent mx-auto mt-8" 
          />
        </div>

        {error && (
          <div className="max-w-xl mx-auto mb-8 bg-orange-100 border border-orange-400 text-orange-700 px-4 py-3 rounded relative flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <span className="block sm:inline">Could not connect to Firebase Firestore. Showing default portfolio items. Please check your config.</span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-gold-500 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 animate-pulse tracking-widest uppercase text-xs">Loading portfolio...</p>
          </div>
        ) : (
          <>
            {/* Filter Categories */}
            <div className="flex flex-wrap justify-center gap-3 mb-16">
              {categories.map((category) => {
                const isActive = activeCategory === category;
                return (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`relative px-6 py-2.5 rounded-full border text-sm font-semibold tracking-wider uppercase transition-colors duration-300 ${
                      isActive 
                        ? 'border-transparent text-black' 
                        : 'border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-gold-500 backdrop-blur-sm'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeCategoryIndicator"
                        className="absolute inset-0 bg-gold-500 rounded-full shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-10">{category}</span>
                  </button>
                );
              })}
            </div>

            {/* Grid */}
            <AnimatePresence mode="popLayout">
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {filteredItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="group relative aspect-[4/5] overflow-hidden cursor-pointer bg-gray-200 dark:bg-neutral-900 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500"
                    onClick={() => setSelectedVideo(item.videoUrl)}
                  >
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110 opacity-90 group-hover:opacity-100"
                    />
                    
                    {/* Premium Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8 backdrop-blur-[2px]">
                      <div className="translate-y-6 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                        <span className="text-gold-500 text-xs font-bold tracking-[0.3em] uppercase mb-3 block">
                          {item.category}
                        </span>
                        <h3 className="text-3xl font-serif text-white leading-tight">{item.title}</h3>
                      </div>
                    </div>

                    {/* Play Button Icon */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <div className="w-20 h-20 rounded-full bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center scale-50 group-hover:scale-100 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
                        <Play className="w-8 h-8 text-white fill-white translate-x-1" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {selectedVideo && (() => {
          const isInsta   = selectedVideo.includes('instagram.com');
          const isVertical = isInsta || selectedVideo.includes('vertical=1');
          const src = isInsta ? selectedVideo : `${selectedVideo}${selectedVideo.includes('?') ? '&' : '?'}autoplay=1&rel=0`;
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12"
              onClick={() => setSelectedVideo(null)}
            >
              <button
                className="absolute top-6 right-6 sm:top-10 sm:right-10 text-white/50 hover:text-white transition-colors w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 z-10"
                onClick={() => setSelectedVideo(null)}
              >
                <X className="w-6 h-6" />
              </button>
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 10 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={`bg-black rounded-xl overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.15)] ring-1 ring-white/10 relative ${
                  isVertical
                    ? 'w-full max-w-sm aspect-[9/16]'
                    : 'w-full max-w-6xl aspect-video'
                }`}
                onClick={e => e.stopPropagation()}
              >
                <iframe
                  src={src}
                  title="Portfolio Video"
                  className="absolute top-0 left-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </section>
  );
};

export default Portfolio;
