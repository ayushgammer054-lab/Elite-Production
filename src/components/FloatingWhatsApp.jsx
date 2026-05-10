import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Official WhatsApp SVG logo
const WhatsAppIcon = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M16 2C8.268 2 2 8.268 2 16c0 2.415.633 4.68 1.74 6.645L2 30l7.545-1.717A13.938 13.938 0 0016 30c7.732 0 14-6.268 14-14S23.732 2 16 2z"
      fill="#fff"
    />
    <path
      d="M23.5 20.475c-.3-.15-1.775-.875-2.05-.975-.275-.1-.475-.15-.675.15-.2.3-.775.975-.95 1.175-.175.2-.35.225-.65.075-.3-.15-1.265-.465-2.41-1.485-.89-.795-1.49-1.775-1.665-2.075-.175-.3-.019-.462.131-.611.135-.134.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.584-.49-.505-.675-.514l-.575-.01c-.2 0-.525.075-.8.375s-1.05 1.025-1.05 2.5 1.075 2.9 1.225 3.1c.15.2 2.115 3.227 5.125 4.527.716.31 1.274.494 1.71.633.719.229 1.373.197 1.89.12.576-.086 1.775-.726 2.025-1.426.25-.7.25-1.3.175-1.426-.075-.125-.275-.2-.575-.35z"
      fill="#25D366"
    />
  </svg>
);

const PHONE = '919563212598';
const MESSAGE = 'Hello! I found Elite Studio online and I would like to know more about your services.';

const FloatingWhatsApp = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isTyping, setIsTyping] = useState(true);

  const waUrl = `https://wa.me/${PHONE}?text=${encodeURIComponent(MESSAGE)}`;

  useEffect(() => {
    let typingTimer;
    if (showTooltip) {
      setIsTyping(true);
      typingTimer = setTimeout(() => {
        setIsTyping(false);
      }, 1500);
    }
    return () => clearTimeout(typingTimer);
  }, [showTooltip]);

  return (
    <div className="fixed bottom-6 right-5 sm:right-6 z-[90]">
      {/* Tooltip popup */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 250, damping: 20 }}
            className="absolute bottom-[calc(100%+20px)] right-0 bg-[#EFEAE2] dark:bg-[#111B21] border border-gray-200 dark:border-zinc-800 rounded-[20px] shadow-2xl w-[320px] pointer-events-auto overflow-hidden"
            style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))' }}
          >
            {/* Header */}
            <div className="bg-[#075E54] dark:bg-[#202C33] px-4 py-3 flex items-center gap-3 shadow-md relative z-10">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0 border-2 border-[#128C7E]">
                  <img src="/logo.png" alt="Elite Studio" className="w-9 h-9 object-contain rounded-full" onError={(e) => e.target.style.display='none'} />
                </div>
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#25D366] border-2 border-[#075E54] dark:border-[#202C33] rounded-full"></div>
              </div>
              <div>
                <p className="font-semibold text-white text-base">Elite Studio</p>
                <p className="text-[11px] text-white/80 mt-0.5">Typically replies instantly</p>
              </div>
            </div>
            
            {/* Chat background */}
            <div className="relative p-5 min-h-[120px] bg-[#efeae2] dark:bg-[#0b141a]">
              {/* WhatsApp chat background pattern (optional, simulated with color) */}
              
              <div className="relative bg-white dark:bg-[#202C33] rounded-2xl rounded-tl-none px-4 py-2 shadow-sm border border-black/5 dark:border-white/5 inline-block max-w-[90%]">
                <AnimatePresence mode="wait">
                  {isTyping ? (
                    <motion.div
                      key="typing"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex gap-1.5 items-center py-2 px-1"
                    >
                      <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0 }} className="w-1.5 h-1.5 bg-[#8696A0] rounded-full" />
                      <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.15 }} className="w-1.5 h-1.5 bg-[#8696A0] rounded-full" />
                      <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.3 }} className="w-1.5 h-1.5 bg-[#8696A0] rounded-full" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="message"
                      initial={{ opacity: 0, scale: 0.95, originX: 0, originY: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }}
                    >
                      <p className="text-[#111b21] dark:text-[#e9edef] text-[15px] leading-relaxed pr-2">
                        👋 Hi! Ready to capture your forever moments? Let us know how we can help.
                      </p>
                      <div className="flex justify-end items-center gap-1 mt-1 -mb-1">
                        <span className="text-[10px] text-[#667781] dark:text-[#8696a0]">12:00</span>
                        <svg viewBox="0 0 16 11" width="16" height="11" className="fill-[#53bdeb]"><path d="M11.8 1L15.4 4.6C15.8 5 15.8 5.6 15.4 6L11.8 9.6M5.8 1L9.4 4.6C9.8 5 9.8 5.6 9.4 6L5.8 9.6M2.8 1L6.4 4.6C6.8 5 6.8 5.6 6.4 6L2.8 9.6M1 4.6L2.8 6.4"></path></svg>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                {/* Bubble tail */}
                <div className="absolute -left-[8px] top-0 w-2 h-3 overflow-hidden">
                  <div className="w-4 h-4 bg-white dark:bg-[#202C33] rounded-sm transform rotate-45 -translate-y-2 translate-x-1 shadow-sm"></div>
                </div>
              </div>

              {/* Chat CTA Button */}
              {!isTyping && (
                <motion.a 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  href={waUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-4 bg-[#25D366] hover:bg-[#128C7E] text-white w-full py-3 rounded-full flex items-center justify-center font-bold text-sm shadow-lg transition-colors duration-300"
                >
                  Start Chat
                </motion.a>
              )}
            </div>
            
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Button */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.5, type: 'spring', stiffness: 260, damping: 20 }}
        className="relative flex items-center gap-3 group"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Label (Optional: only visible on desktop hover) */}
        <div className="hidden sm:block absolute right-[75px] bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-200 text-sm font-medium py-1.5 px-3 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap border border-gray-100 dark:border-zinc-700">
          Chat with us
        </div>

        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="relative flex items-center justify-center w-[60px] h-[60px] rounded-full cursor-pointer shadow-2xl transition-transform hover:scale-110 active:scale-95"
        >
          {/* Green Background */}
          <div className="absolute inset-0 bg-[#25D366] rounded-full shadow-[0_4px_14px_0_rgba(37,211,102,0.39)]"></div>
          
          {/* WhatsApp logo */}
          <div className="relative z-10">
            <WhatsAppIcon size={34} />
          </div>
          
          {/* Ping indicator */}
          <span className="absolute top-0 right-0 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-[#25D366]"></span>
          </span>
        </a>
      </motion.div>
    </div>
  );
};

export default FloatingWhatsApp;

