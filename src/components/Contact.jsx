import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, CheckCircle, Loader2 } from 'lucide-react';

const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
import { addDoc, collection, getDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const CONTACT_DEFAULTS = {
  phone: '+91 95632 12598',
  email: 'eliteproduction.visuals@gmail.com',
  location: 'Haveli Kharagpur, Bihar\nBhagalpur, India',
  instagramUrl: '#',
  whatsappNumber: '919563212598',
};

const fetchWithTimeout = (promise, ms = 4000) =>
  Promise.race([promise, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventType: 'Wedding',
    message: ''
  });
  const [contactInfo, setContactInfo] = useState(CONTACT_DEFAULTS);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchWithTimeout(getDoc(doc(db, 'siteConfig', 'contact')))
      .then(d => { if (d.exists()) setContactInfo(c => ({ ...c, ...d.data() })); })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await addDoc(collection(db, 'inquiries'), {
        ...formData,
        status: 'new',
        createdAt: serverTimestamp(),
      });
    } catch { /* silently continue — WhatsApp will still open */ }

    const message = encodeURIComponent(
      `Hello! I'm ${formData.name} and I'm interested in your *${formData.eventType}* services.\n\n` +
      `📞 Phone: ${formData.phone}\n` +
      `📧 Email: ${formData.email}\n\n` +
      `📝 Details: ${formData.message}`
    );
    window.open(`https://wa.me/${contactInfo.whatsappNumber || CONTACT_DEFAULTS.whatsappNumber}?text=${message}`, '_blank');

    setFormData({ name: '', email: '', phone: '', eventType: 'Wedding', message: '' });
    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  const locationLines = (contactInfo.location || CONTACT_DEFAULTS.location).split('\n');

  return (
    <section id="contact" className="py-32 bg-gray-50 dark:bg-[#050505] relative overflow-hidden transition-colors duration-300">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03]" />
      <div className="absolute top-1/4 -left-64 w-[600px] h-[600px] bg-gold-500/5 rounded-full blur-[150px] pointer-events-none transform-gpu will-change-transform" />
      <div className="absolute bottom-0 -right-32 w-[500px] h-[500px] bg-gold-500/5 rounded-full blur-[120px] pointer-events-none transform-gpu will-change-transform" />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center mb-20">
          <motion.span 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="text-gold-500 uppercase tracking-[0.3em] text-xs font-bold mb-3 block"
          >
            Get In Touch
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl md:text-5xl lg:text-6xl font-serif text-black dark:text-white transition-colors duration-300 tracking-wide"
          >
            Let's Create Magic
          </motion.h2>
          <motion.div 
            initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.4 }}
            className="w-24 h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent mx-auto mt-8" 
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-16 max-w-7xl mx-auto">

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-5/12 space-y-12"
          >
            <div>
              <h3 className="text-3xl lg:text-4xl font-serif text-black dark:text-white mb-6 transition-colors duration-300 leading-tight">We'd love to hear from you.</h3>
              <p className="text-gray-600 dark:text-gray-400 font-light text-lg leading-relaxed transition-colors duration-300">
                Whether you're planning a grand wedding, a brand campaign, or a custom cinematic project, our team is ready to bring your vision to life.
              </p>
            </div>

            <div className="space-y-8">
              {[
                { icon: Phone, title: 'Phone / WhatsApp', content: contactInfo.phone || CONTACT_DEFAULTS.phone },
                { icon: Mail, title: 'Email Address', content: contactInfo.email || CONTACT_DEFAULTS.email },
                { icon: MapPin, title: 'Studio Location', content: locationLines.map((line, i) => <span key={i}>{line}{i < locationLines.length - 1 && <br />}</span>) }
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-6 group cursor-pointer">
                  <div className="w-14 h-14 bg-white dark:bg-[#111] rounded-2xl border border-gray-100 dark:border-white/5 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 group-hover:border-gold-500/50 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.15)] transition-all duration-500">
                    <item.icon className="w-6 h-6 text-gold-500 group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="pt-1">
                    <p className="text-gray-500 dark:text-gray-400 font-medium mb-1 uppercase tracking-widest text-[10px] transition-colors duration-300">{item.title}</p>
                    <p className="text-black dark:text-white font-medium text-lg transition-colors duration-300 group-hover:text-gold-600 dark:group-hover:text-gold-400">
                      {item.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-10 border-t border-black/5 dark:border-white/5 transition-colors duration-300">
              <p className="text-gray-500 dark:text-gray-400 font-medium mb-6 uppercase tracking-widest text-[10px] transition-colors duration-300">Follow My Journey</p>
              <div className="flex gap-4">
                <a href={contactInfo.instagramUrl || '#'} target="_blank" rel="noopener noreferrer"
                  className="w-12 h-12 bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gradient-to-tr hover:from-gold-600 hover:to-gold-400 hover:text-white hover:border-transparent transition-all duration-300 shadow-sm hover:shadow-[0_10px_20px_rgba(212,175,55,0.3)] hover:-translate-y-1">
                  <InstagramIcon />
                </a>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full lg:w-7/12"
          >
            <div className="bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl p-8 md:p-12 rounded-3xl border border-white/50 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] transition-colors duration-300 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent opacity-50" />
              
              {submitted ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center h-full min-h-[450px] text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
                  >
                    <div className="w-24 h-24 bg-gold-500/10 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle className="w-12 h-12 text-gold-500 drop-shadow-lg" />
                    </div>
                  </motion.div>
                  <h3 className="text-3xl font-serif text-black dark:text-white mb-4">Inquiry Sent!</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-lg font-light max-w-sm">Your message was saved and WhatsApp opened. We'll be in touch shortly.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/5 rounded-2xl px-5 py-3 focus-within:border-gold-500/50 focus-within:ring-1 focus-within:ring-gold-500/50 transition-all duration-300 group/input hover:border-gray-300 dark:hover:border-white/10">
                      <label className="text-[10px] text-gray-500 dark:text-gray-400 tracking-[0.2em] uppercase font-semibold block mb-1">Full Name</label>
                      <input
                        type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-transparent text-black dark:text-white focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600 font-medium text-base md:text-lg"
                        placeholder="John Doe"
                      />
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/5 rounded-2xl px-5 py-3 focus-within:border-gold-500/50 focus-within:ring-1 focus-within:ring-gold-500/50 transition-all duration-300 group/input hover:border-gray-300 dark:hover:border-white/10">
                      <label className="text-[10px] text-gray-500 dark:text-gray-400 tracking-[0.2em] uppercase font-semibold block mb-1">Email <span className="normal-case opacity-60">(optional)</span></label>
                      <input
                        type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-transparent text-black dark:text-white focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600 font-medium text-base md:text-lg"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/5 rounded-2xl px-5 py-3 focus-within:border-gold-500/50 focus-within:ring-1 focus-within:ring-gold-500/50 transition-all duration-300 group/input hover:border-gray-300 dark:hover:border-white/10">
                      <label className="text-[10px] text-gray-500 dark:text-gray-400 tracking-[0.2em] uppercase font-semibold block mb-1">Phone Number</label>
                      <input
                        type="tel" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full bg-transparent text-black dark:text-white focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600 font-medium text-base md:text-lg"
                        placeholder="+91 95632 12598"
                      />
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/5 rounded-2xl px-5 py-3 focus-within:border-gold-500/50 focus-within:ring-1 focus-within:ring-gold-500/50 transition-all duration-300 group/input hover:border-gray-300 dark:hover:border-white/10">
                      <label className="text-[10px] text-gray-500 dark:text-gray-400 tracking-[0.2em] uppercase font-semibold block mb-1">Event Type</label>
                      <select
                        value={formData.eventType} onChange={(e) => setFormData({...formData, eventType: e.target.value})}
                        className="w-full bg-transparent text-black dark:text-white focus:outline-none appearance-none cursor-pointer font-medium text-base md:text-lg"
                      >
                        <option value="Wedding" className="text-black">Wedding</option>
                        <option value="Pre-Wedding" className="text-black">Pre-Wedding</option>
                        <option value="Event" className="text-black">Birthday / Event</option>
                        <option value="Reels" className="text-black">Reels / Influencer</option>
                        <option value="Brand" className="text-black">Brand Promotion</option>
                        <option value="Other" className="text-black">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/5 rounded-2xl px-5 py-3 focus-within:border-gold-500/50 focus-within:ring-1 focus-within:ring-gold-500/50 transition-all duration-300 group/input hover:border-gray-300 dark:hover:border-white/10">
                    <label className="text-[10px] text-gray-500 dark:text-gray-400 tracking-[0.2em] uppercase font-semibold block mb-2">Tell us about your event</label>
                    <textarea
                      rows="4" required value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="w-full bg-transparent text-black dark:text-white focus:outline-none resize-none placeholder:text-gray-400 dark:placeholder:text-gray-600 font-medium text-base md:text-lg"
                      placeholder="Dates, locations, specific requirements..."
                    ></textarea>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={submitting}
                    className="w-full py-5 bg-gradient-to-r from-gold-600 to-gold-400 text-black font-bold tracking-[0.2em] uppercase transition-all mt-4 flex items-center justify-center gap-3 disabled:opacity-70 rounded-xl shadow-[0_10px_30px_rgba(212,175,55,0.25)] hover:shadow-[0_15px_40px_rgba(212,175,55,0.4)]"
                  >
                    {submitting
                      ? <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</>
                      : 'Send via WhatsApp'}
                  </motion.button>
                </form>
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Contact;
