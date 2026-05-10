import { useState, useEffect } from 'react';
import { Camera, Mail } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const fetchWithTimeout = (promise, ms = 4000) =>
  Promise.race([promise, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);

const Footer = () => {
  const [contact, setContact] = useState({ instagramUrl: '#', whatsappNumber: '919563212598', email: 'eliteproduction.visuals@gmail.com' });

  useEffect(() => {
    fetchWithTimeout(getDoc(doc(db, 'siteConfig', 'contact')))
      .then(d => { if (d.exists()) setContact(c => ({ ...c, ...d.data() })); })
      .catch(() => {});
  }, []);

  const waUrl = `https://wa.me/${contact.whatsappNumber || '919563212598'}`;

  return (
    <footer className="bg-white dark:bg-[#050505] pt-20 pb-10 border-t border-black/5 dark:border-white/5 transition-colors duration-300 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gold-500/5 rounded-[100%] blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-10 mb-16">

          <div className="flex flex-col items-center md:items-start gap-3">
            <div className="flex items-center gap-2 group cursor-pointer">
              <Camera className="w-8 h-8 text-gold-500 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-2xl font-serif font-bold text-black dark:text-white tracking-wider transition-colors duration-300">
                ELITE<span className="text-gold-500 font-light">STUDIO</span>
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center md:text-left uppercase tracking-widest max-w-xs">
              Premium Wedding &amp; Cinematic Production
            </p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center md:text-left mt-1">
              Haveli Kharagpur, Bhagalpur, Bihar
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-[0.2em] transition-colors duration-300">
            <a href="#home" className="hover:text-gold-500 transition-colors">Home</a>
            <a href="#portfolio" className="hover:text-gold-500 transition-colors">Portfolio</a>
            <a href="#services" className="hover:text-gold-500 transition-colors">Services</a>
            <a href="#about" className="hover:text-gold-500 transition-colors">About</a>
            <a href="#contact" className="hover:text-gold-500 transition-colors">Contact</a>
          </div>

          <div className="flex gap-4">
            {/* Instagram */}
            <a
              href={contact.instagramUrl && contact.instagramUrl !== '#' ? contact.instagramUrl : 'https://instagram.com'}
              target="_blank"
              rel="noopener noreferrer"
              title="Instagram"
              className="w-10 h-10 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-white hover:border-transparent hover:bg-gradient-to-br hover:from-[#f09433] hover:via-[#e6683c] hover:to-[#dc2743] hover:shadow-lg transition-all duration-300"
            >
              <InstagramIcon />
            </a>
            {/* WhatsApp */}
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="WhatsApp"
              className="w-10 h-10 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-white hover:border-transparent hover:bg-[#25D366] hover:shadow-lg transition-all duration-300"
            >
              <WhatsAppIcon />
            </a>
            {/* Email */}
            <a
              href={`mailto:${contact.email || 'eliteproduction.visuals@gmail.com'}`}
              title="Email"
              className="w-10 h-10 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gold-500 hover:border-gold-500 hover:bg-gold-500/5 transition-all duration-300"
            >
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="text-center pt-8 border-t border-black/10 dark:border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-gray-500 dark:text-gray-600 tracking-wider transition-colors duration-300">
          <p>&copy; {new Date().getFullYear()} Elite Studio. All Rights Reserved.</p>
          <p>Designed with <span className="text-gold-500">♥</span> for premium content creation.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
