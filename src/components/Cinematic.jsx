import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const DEFAULTS = {
  videoId: 'dQw4w9WgXcQ',
  title: 'Our Cinematic',
  titleItalic: 'Showreel',
  subtitle: 'A glimpse into the stories we have told — weddings, emotions, and moments frozen in time.',
};

const Cinematic = () => {
  const [content, setContent] = useState(DEFAULTS);
  const [muted, setMuted] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const sectionRef = useRef(null);

  // started only when BOTH firebase data loaded AND section is visible
  const started = contentLoaded && inView;

  useEffect(() => {
    const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 4000));
    Promise.race([getDoc(doc(db, 'siteConfig', 'cinematic')), timeout])
      .then(d => {
        if (d && d.exists()) setContent(c => ({ ...c, ...d.data() }));
      })
      .catch(() => {})
      .finally(() => setContentLoaded(true));
  }, []);

  // Watch section visibility
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Reload iframe when both conditions become true
  useEffect(() => {
    if (started) setIframeKey(k => k + 1);
  }, [started]);

  const buildSrc = (mute) =>
    `https://www.youtube.com/embed/${content.videoId}?autoplay=1&mute=${mute ? 1 : 0}&rel=0&modestbranding=1&playsinline=1&loop=1&playlist=${content.videoId}&iv_load_policy=3&cc_load_policy=0&color=white&enablejsapi=1`;

  const toggleMute = () => {
    setMuted(m => !m);
    setIframeKey(k => k + 1);
  };

  return (
    <section ref={sectionRef} id="showreel" className="py-24 md:py-32 bg-[#050505] relative overflow-hidden">
      {/* Ambient glow & Noise */}
      <div className="noise" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold-500/10 rounded-full blur-[150px] pointer-events-none cinematic-glow" />

      <div className="container mx-auto px-4 sm:px-6 md:px-12 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 md:mb-20"
        >
          <span className="text-gold-500 uppercase tracking-[0.3em] text-xs sm:text-sm font-bold mb-4 block">
            Watch &amp; Experience
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-white leading-tight">
            {content.title}{' '}
            <span className="italic text-gold-400 font-light">{content.titleItalic}</span>
          </h2>
          <p className="text-gray-400 font-light mt-6 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed px-4">
            {content.subtitle}
          </p>
          <motion.div
            initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.4 }}
            className="w-24 h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent mx-auto mt-8"
          />
        </motion.div>

        {/* Video Frame */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="relative max-w-6xl mx-auto"
        >
          {/* Gold corner accents */}
          <div className="absolute -top-4 -left-4 w-12 h-12 sm:w-16 sm:h-16 border-t-[3px] border-l-[3px] border-gold-500/70 z-20 pointer-events-none rounded-tl-lg" />
          <div className="absolute -top-4 -right-4 w-12 h-12 sm:w-16 sm:h-16 border-t-[3px] border-r-[3px] border-gold-500/70 z-20 pointer-events-none rounded-tr-lg" />
          <div className="absolute -bottom-4 -left-4 w-12 h-12 sm:w-16 sm:h-16 border-b-[3px] border-l-[3px] border-gold-500/70 z-20 pointer-events-none rounded-bl-lg" />
          <div className="absolute -bottom-4 -right-4 w-12 h-12 sm:w-16 sm:h-16 border-b-[3px] border-r-[3px] border-gold-500/70 z-20 pointer-events-none rounded-br-lg" />

          <div className="absolute inset-0 rounded-2xl shadow-[0_0_80px_rgba(212,175,55,0.15)] pointer-events-none z-10" />

          {/* Video wrapper — 16:9 */}
          <div className="relative w-full aspect-video bg-[#0a0a0a] rounded-2xl overflow-hidden ring-1 ring-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            {!started ? (
              <img
                src={`https://img.youtube.com/vi/${content.videoId}/maxresdefault.jpg`}
                alt="Showreel thumbnail"
                className="absolute inset-0 w-full h-full object-cover opacity-60"
              />
            ) : (
              <>
                <iframe
                  key={iframeKey}
                  src={buildSrc(muted)}
                  title="Elite Studio Showreel"
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                {/* Hide top bar: title, channel, CC, settings */}
                <div className="absolute top-0 left-0 right-0 h-[42px] bg-black pointer-events-none z-10" />
                {/* Hide YouTube logo (bottom right, above controls) */}
                <div className="absolute bottom-[38px] right-0 w-[110px] h-[32px] bg-black pointer-events-none z-10" />
                {/* Hide "More videos" button (top right on hover) */}
                <div className="absolute top-[42px] right-0 w-[140px] h-[44px] bg-black pointer-events-none z-10" />
                {/* Hide endscreen "More videos" cards (covers top-right quadrant at video end) */}
                <div className="absolute top-[42px] right-0 w-[55%] h-[75%] pointer-events-none z-[5]" />
              </>
            )}
          </div>
        </motion.div>

        {/* Mute / Unmute toggle */}
        <AnimatePresence>
          {started && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex justify-center mt-10"
            >
              <button
                onClick={toggleMute}
                className="flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-all duration-300 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 hover:border-gold-500/50 px-6 py-3 rounded-full"
              >
                {muted
                  ? <><VolumeX className="w-5 h-5 text-red-400" /> Tap to Unmute</>
                  : <><Volume2 className="w-5 h-5 text-gold-500" /> Mute</>}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Cinematic;
