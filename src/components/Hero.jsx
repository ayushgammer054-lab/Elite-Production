import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const DEFAULTS = {
  title: 'Capturing',
  titleItalic: 'Moments',
  subtitle: 'Elevating weddings, events, and brand stories with cinematic visuals and a modern creative touch. Proudly serving as the best wedding video shoot studio in Haveli Kharagpur, Bhagalpur, and across Bihar.',
  videoUrl: 'https://cdn.coverr.co/videos/coverr-a-couple-walking-in-the-woods-2704/1080p.mp4',
  posterUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069&auto=format&fit=crop',
};

const fetchWithTimeout = (promise, ms = 4000) =>
  Promise.race([promise, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);

const Hero = () => {
  const [content, setContent] = useState(DEFAULTS);

  useEffect(() => {
    fetchWithTimeout(getDoc(doc(db, 'siteConfig', 'hero')))
      .then(d => { if (d.exists()) setContent(c => ({ ...c, ...d.data() })); })
      .catch(() => {}); // silently use defaults on timeout/error
  }, []);

  return (
    <section id="home" className="relative w-full h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0 bg-black">
        <video
          autoPlay loop muted playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105"
          poster={content.posterUrl}
        >
          <source src={content.videoUrl} type="video/mp4" />
        </video>
        {/* Cinematic noise and refined gradient overlay */}
        <div className="noise" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/40 to-black/90" />
      </div>

      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto flex flex-col items-center mt-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }} className="mb-6">
          <span className="text-gold-500 font-sans tracking-[0.4em] uppercase text-[10px] md:text-xs font-bold drop-shadow-md border border-gold-500/30 px-4 py-1.5 rounded-full bg-black/20 backdrop-blur-sm">
            Premium Videography &amp; Content Creation
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.4 }}
          className="text-5xl md:text-7xl lg:text-[7.5rem] font-serif text-white mb-6 leading-[1.1] drop-shadow-2xl will-change-transform transform-gpu"
        >
          {content.title} <span className="italic text-gold-400 font-light pr-2">{content.titleItalic}</span>
          <br /><span className="text-4xl md:text-6xl lg:text-7xl">That Feel Like Forever</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.6 }}
          className="text-gray-200 text-base md:text-lg lg:text-xl font-light mb-12 max-w-3xl leading-relaxed drop-shadow-lg will-change-transform transform-gpu"
        >
          {content.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-5 justify-center items-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' })}
            className="group relative px-8 py-4 bg-gold-500 text-black font-semibold tracking-wider uppercase flex items-center gap-3 overflow-hidden rounded-sm"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <Play className="w-4 h-4 fill-black relative z-10" />
            <span className="relative z-10 text-sm">View Portfolio</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-4 border border-white/40 text-white font-semibold tracking-wider uppercase transition-all duration-300 backdrop-blur-sm rounded-sm text-sm hover:border-gold-400 hover:text-gold-400"
          >
            Contact Us
          </motion.button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-white/50">Scroll</span>
        <motion.div 
          animate={{ height: ['0%', '100%'], opacity: [0, 1, 0] }} 
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-[1px] h-16 bg-gradient-to-b from-gold-400 to-transparent origin-top" 
        />
      </motion.div>
    </section>
  );
};

export default Hero;
