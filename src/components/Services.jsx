import React, { useState, useEffect } from 'react';
import { Camera, Film, Video, Smartphone, Sparkles, Aperture } from 'lucide-react';
import { motion } from 'framer-motion';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const ICONS = [
  <Camera className="w-8 h-8" />,
  <Sparkles className="w-8 h-8" />,
  <Video className="w-8 h-8" />,
  <Smartphone className="w-8 h-8" />,
  <Film className="w-8 h-8" />,
  <Aperture className="w-8 h-8" />,
];

const DEFAULT_SERVICES = [
  { title: 'Wedding Shoot',     description: 'Cinematic coverage of your special day, capturing every emotion and ritual with an artistic eye.' },
  { title: 'Pre-Wedding Shoot', description: 'Story-driven pre-wedding films set in breathtaking locations to celebrate your journey.' },
  { title: 'Event Coverage',    description: 'High-end videography for birthdays, anniversaries, and corporate events.' },
  { title: 'Reel Creation',     description: 'Engaging, fast-paced vertical video editing tailored for Instagram and TikTok.' },
  { title: 'Brand Promotion',   description: 'Professional promotional videos and influencer campaigns to elevate your brand presence.' },
  { title: 'Drone & Aerial',    description: 'Breathtaking aerial videography and photography to add a cinematic scale to your visual story.' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const fetchWithTimeout = (promise, ms = 4000) =>
  Promise.race([promise, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);

const ServiceCard = ({ svc, icon, index }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      variants={cardVariants}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="group relative bg-white dark:bg-[#0a0a0a] p-10 transition-all duration-500 hover:-translate-y-2 rounded-2xl border border-gray-100 dark:border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_40px_rgba(212,175,55,0.08)] dark:hover:shadow-[0_20px_40px_rgba(212,175,55,0.05)] overflow-hidden"
    >
      {/* Spotlight hover effect */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          background: isHovering 
            ? `radial-gradient(500px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(212,175,55,0.08), transparent 40%)` 
            : 'transparent',
        }}
      />
      
      {/* Animated top border */}
      <div className="absolute top-0 left-0 w-0 h-[2px] bg-gold-500 group-hover:w-full transition-all duration-500 ease-out" />
      
      <div className="relative z-10">
        <motion.div 
          initial={{ y: 0 }}
          whileHover={{ y: -5 }}
          className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-white/5 flex items-center justify-center text-gold-500 mb-8 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 shadow-sm"
        >
          {icon}
        </motion.div>
        <h3 className="text-2xl font-serif text-black dark:text-white mb-4 group-hover:text-gold-500 transition-colors duration-300">
          {svc.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base font-light leading-relaxed">
          {svc.description}
        </p>
      </div>
    </motion.div>
  );
};

const Services = () => {
  const [services, setServices] = useState(DEFAULT_SERVICES);

  useEffect(() => {
    fetchWithTimeout(getDoc(doc(db, 'siteConfig', 'services')))
      .then(d => { if (d.exists() && d.data().items) setServices(d.data().items); })
      .catch(() => {});
  }, []);

  return (
    <section id="services" className="py-32 bg-gray-50 dark:bg-[#050505] relative overflow-hidden transition-colors duration-300">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03]" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gold-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center mb-20">
          <motion.span 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="text-gold-500 uppercase tracking-[0.3em] text-xs font-bold mb-3 block"
          >
            Our Expertise
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl md:text-5xl lg:text-6xl font-serif text-black dark:text-white transition-colors duration-300 tracking-wide"
          >
            Premium Services
          </motion.h2>
          <motion.div 
            initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.4 }}
            className="w-24 h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent mx-auto mt-8" 
          />
        </div>

        <motion.div
          variants={containerVariants} initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
        >
          {services.map((svc, i) => (
            <ServiceCard key={i} svc={svc} icon={ICONS[i % ICONS.length]} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Services;
