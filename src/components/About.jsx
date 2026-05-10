import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const DEFAULTS = {
  founderName: 'Rahul Sharma',
  role: 'Founder & Lead Director',
  yearsOfExperience: '5+',
  portraitUrl: '/videographer_portrait.png',
  bio1: 'As a passionate videographer and social media influencer, I believe every story deserves to be told with cinematic grandeur. Elite Studio was born out of a desire to blend traditional Indian aesthetics with modern, high-end production techniques, shooting the best weddings across Haveli Kharagpur, Bhagalpur, and Bihar.',
  bio2: "Whether it's the chaotic beauty of a traditional Indian wedding, the intimate moments of a pre-wedding shoot, or a bold brand campaign, I bring a unique influencer-savvy perspective to my craft. We don't just record events; we compose moving art.",
};

const fetchWithTimeout = (promise, ms = 4000) =>
  Promise.race([promise, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);

const About = () => {
  const [content, setContent] = useState(DEFAULTS);

  useEffect(() => {
    fetchWithTimeout(getDoc(doc(db, 'siteConfig', 'about')))
      .then(d => { if (d.exists()) setContent(c => ({ ...c, ...d.data() })); })
      .catch(() => {});
  }, []);

  return (
    <section id="about" className="py-32 bg-white dark:bg-black relative transition-colors duration-300 overflow-hidden">
      {/* Background elegant accents */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-gold-500/5 to-transparent rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-gold-500/5 to-transparent rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2 relative group"
          >
            <div className="relative aspect-[3/4] max-w-md mx-auto lg:mx-0 rounded-2xl overflow-visible">
              <div className="absolute -inset-4 border-2 border-gold-500/20 z-0 rounded-2xl group-hover:-rotate-3 group-hover:scale-105 transition-all duration-700 ease-out" />
              <div className="absolute -inset-4 border-2 border-gold-500/20 z-0 translate-x-3 translate-y-3 rounded-2xl group-hover:rotate-2 group-hover:scale-105 transition-all duration-700 ease-out" />
              <div className="w-full h-full relative z-10 rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={content.portraitUrl}
                  alt={content.founderName}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000 ease-out"
                />
              </div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="absolute -bottom-8 -right-4 lg:-right-12 z-20 bg-white/90 dark:bg-[#111]/90 backdrop-blur-md p-8 border-l-4 border-gold-500 shadow-2xl transition-colors duration-300 rounded-r-xl"
              >
                <p className="text-5xl font-serif text-black dark:text-white mb-2">{content.yearsOfExperience}</p>
                <p className="text-gold-500 text-xs tracking-[0.3em] uppercase font-bold">Years of Magic</p>
              </motion.div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2"
          >
            <span className="text-gold-500 uppercase tracking-[0.3em] text-xs font-bold mb-5 block">The Visionary</span>
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-serif text-black dark:text-white mb-8 leading-[1.1] transition-colors duration-300">
              Crafting Visuals<br/>That <span className="italic text-gold-400">Speak</span>
            </h2>

            <div className="space-y-6 text-gray-600 dark:text-gray-400 font-light text-lg lg:text-xl leading-relaxed">
              {content.bio1 && <p>{content.bio1}</p>}
              {content.bio2 && <p>{content.bio2}</p>}
            </div>

            <div className="mt-12 flex items-center gap-6">
              <div className="w-20 h-[2px] bg-gradient-to-r from-gold-500 to-transparent" />
              <div>
                <p className="text-black dark:text-white font-serif text-2xl mb-1">{content.founderName}</p>
                <p className="text-gold-500 text-xs tracking-[0.2em] uppercase font-semibold">{content.role}</p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default About;
