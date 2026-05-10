import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, Loader2 } from 'lucide-react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';

const fallbackImages = [
  { id: 1, imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070', caption: 'A Timeless Wedding' },
  { id: 2, imageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069', caption: 'Golden Hour' },
  { id: 3, imageUrl: 'https://images.unsplash.com/photo-1524863479829-916d8e77f114?q=80&w=2071', caption: 'Bridal Portrait' },
  { id: 4, imageUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1974', caption: 'Wedding Ceremony' },
  { id: 5, imageUrl: 'https://images.unsplash.com/photo-1550005809-91ad75fb315f?q=80&w=2069', caption: 'Candid Moments' },
  { id: 6, imageUrl: 'https://images.unsplash.com/photo-1531747056595-07f6cbbe10ad?q=80&w=2069', caption: 'Reception Night' },
];

const Gallery = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null); // { imageUrl, caption }

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 4000));
        const q = query(collection(db, 'galleryItems'), orderBy('order', 'asc'));
        const snap = await Promise.race([getDocs(q), timeout]);
        const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setItems(fetched.length > 0 ? fetched : fallbackImages);
      } catch {
        setItems(fallbackImages);
      }
      setLoading(false);
    };
    fetchGallery();
  }, []);

  // close lightbox on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setLightbox(null); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <section id="gallery" className="py-24 md:py-32 bg-white dark:bg-black transition-colors duration-300 relative overflow-hidden">
      {/* Decorative vertical lines */}
      <div className="absolute top-0 left-8 sm:left-16 w-[1px] h-32 bg-gradient-to-b from-gold-500/50 to-transparent" />
      <div className="absolute top-0 right-8 sm:right-16 w-[1px] h-32 bg-gradient-to-b from-gold-500/50 to-transparent" />

      <div className="container mx-auto px-4 sm:px-6 md:px-12 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 md:mb-20"
        >
          <span className="text-gold-500 uppercase tracking-[0.3em] text-xs sm:text-sm font-bold mb-4 block">
            Visual Stories
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif text-black dark:text-white tracking-wide">
            Photo <span className="italic text-gold-400 font-light">Gallery</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent mx-auto mt-6" />
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-gold-500" />
          </div>
        ) : (
          /* Responsive masonry-style grid */
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6"
          >
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: (i % 5) * 0.1 }}
                className="break-inside-avoid rounded-xl overflow-hidden shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-[box-shadow,transform] duration-500 transform-gpu will-change-transform"
              >
                {item.type === 'cloudinary-video' ? (
                  <div className="relative w-full bg-black rounded-xl overflow-hidden">
                    <video
                      src={item.imageUrl}
                      controls
                      playsInline
                      preload="metadata"
                      className="w-full h-auto max-h-[500px] object-contain"
                    />
                    {item.caption && (
                      <p className="text-white/70 text-xs text-center py-2 bg-black/50">{item.caption}</p>
                    )}
                  </div>
                ) : item.type === 'instagram' ? (
                  <iframe
                    src={item.imageUrl}
                    className="w-full rounded-xl border-none overflow-hidden"
                    style={{ minHeight: '540px' }}
                    title={item.caption || 'Instagram post'}
                  />
                ) : item.type === 'youtube' ? (
                  <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden">
                    <iframe
                      src={item.imageUrl}
                      className="absolute inset-0 w-full h-full border-none"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={item.caption || 'YouTube video'}
                    />
                  </div>
                ) : (
                  <div
                    className="group relative overflow-hidden cursor-pointer bg-gray-100 dark:bg-neutral-900"
                    onClick={() => setLightbox(item)}
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.caption || 'Gallery image'}
                      loading="lazy"
                      className="w-full h-auto object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center gap-3 md:backdrop-blur-[2px]">
                      <div className="w-14 h-14 rounded-full bg-white/10 md:backdrop-blur-md flex items-center justify-center border border-white/20 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                        <ZoomIn className="w-6 h-6 text-white" />
                      </div>
                      {item.caption && (
                        <p className="text-white text-sm font-serif tracking-widest px-4 text-center transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-75">
                          {item.caption}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8"
            onClick={() => setLightbox(null)}
          >
            <button
              className="absolute top-6 right-6 sm:top-10 sm:right-10 text-white/50 hover:text-white transition-colors z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10"
              onClick={() => setLightbox(null)}
            >
              <X className="w-6 h-6" />
            </button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="max-w-6xl w-full mx-auto relative flex flex-col items-center"
              onClick={e => e.stopPropagation()}
            >
              <img
                src={lightbox.imageUrl}
                alt={lightbox.caption}
                className="w-full max-h-[85vh] object-contain rounded-sm shadow-[0_0_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10"
              />
              {lightbox.caption && (
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center text-white/80 mt-6 text-sm sm:text-base tracking-[0.2em] font-serif uppercase"
                >
                  {lightbox.caption}
                </motion.p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Gallery;
