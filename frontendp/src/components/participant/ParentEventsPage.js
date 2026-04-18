import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Lock, Unlock, Users, Sparkles, Box } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import ParticipantService from "./ParticipantService"; // Imported service

export default function PhaseShiftEvents() {
  const nav = useNavigate();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [categories, setCategories] = useState([]); // Dynamic state
  const [loading, setLoading] = useState(true);

  const leftDoorRef = useRef(null);
  const rightDoorRef = useRef(null);
  const cardContainerRef = useRef(null);

  // Fetching data and mapping icons/colors based on names or index
  useEffect(() => {
    ParticipantService.getParentEvents()
      .then((res) => {
        const data = res.data || [];
        // Map the API data to include the UI properties needed for your specific design
        const mapped = data.map((item, index) => {
          const themes = [
            { label: "Tech Symposium", icon: <Zap size={32} />, color: "#00ffcc", secondary: "#0066ff" },
            { label: "Cultural Fest", icon: <Sparkles size={32} />, color: "#ff00ff", secondary: "#ff8800" },
            { label: "Student Guilds", icon: <Users size={32} />, color: "#ffff00", secondary: "#00ff00" }
          ];
          const theme = themes[index % themes.length];
          return {
            ...item,
            label: theme.label,
            icon: theme.icon,
            color: theme.color,
            secondary: theme.secondary
          };
        });
        setCategories(mapped);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSequence = () => {
    const tl = gsap.timeline({ onComplete: () => setIsUnlocked(true) });

    tl.to(".lock-indicator", { scale: 0, opacity: 0, duration: 0.4, ease: "back.in" })
      .to(leftDoorRef.current, { xPercent: -100, duration: 1.2, ease: "power4.inOut" }, "-=0.2")
      .to(rightDoorRef.current, { xPercent: 100, duration: 1.2, ease: "power4.inOut" }, "<")
      .from(".event-card", {
        scale: 0.8,
        opacity: 0,
        y: 50,
        stagger: 0.1,
        duration: 0.8,
        ease: "expo.out"
      }, "-=0.6")
      .from(".nav-element", { opacity: 0, y: -20, stagger: 0.1, duration: 0.5 }, "-=0.5");
  };

  return (
    <div className="h-screen w-full bg-[#080808] text-white overflow-hidden font-sans relative">

      {/* --- REVEALED CONTENT (Lower Z-Index) --- */}
      <div className="absolute inset-0 flex flex-col p-10 z-0">
        <nav className="flex justify-between items-center mb-8 nav-element">
          <div className="flex items-center gap-3">
            <Box className="text-white/20" size={20} />
            <span className="text-[10px] font-black tracking-[0.5em] uppercase opacity-40">Nexus_Interface_v2</span>
          </div>
          <div className="flex gap-4">
            <div className="px-4 py-1 border border-white/10 rounded-full text-[9px] font-bold tracking-widest uppercase text-green-400">
              {loading ? "System: Syncing..." : "System: Online"}
            </div>
          </div>
        </nav>

        <header className="mb-8 sm:mb-12 nav-element">
          <h1 className="text-4xl sm:text-6xl md:text-[8vw] font-black uppercase leading-[0.8] tracking-tighter">
            Select <span className="text-white/10 italic">Domain</span>
          </h1>
        </header>

        <div ref={cardContainerRef} className="flex-1 flex flex-col md:grid md:grid-cols-3 gap-4 md:gap-6 mb-12 overflow-y-auto md:overflow-visible pr-2">
          {!loading && categories.map((cat) => (
            <motion.div
              key={cat.id}
              whileHover={{ y: -10 }}
              // Routing updated to match second file logic
              onClick={() => nav(`/parent/${cat.id}`)}
              className="event-card relative group min-h-[300px] md:min-h-0 rounded-3xl md:rounded-[2.5rem] overflow-hidden bg-white/5 border border-white/10 flex flex-col p-6 md:p-10 cursor-pointer shadow-2xl"
            >
              {/* Massive Saturation Glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-700 blur-[80px]"
                style={{ background: `radial-gradient(circle at center, ${cat.color}, transparent)` }}
              />

              <div
                className="w-20 h-20 rounded-[1.5rem] flex items-center justify-center mb-auto relative z-10"
                style={{ background: `linear-gradient(135deg, ${cat.color}, ${cat.secondary})`, boxShadow: `0 0 40px ${cat.color}44` }}
              >
                <div className="text-black">{cat.icon}</div>
              </div>

              <div className="relative z-10">
                <p className="text-[9px] md:text-[11px] font-black tracking-[0.2em] md:tracking-[0.4em] uppercase mb-2" style={{ color: cat.color }}>
                  {cat.label}
                </p>
                <h2 className="text-2xl sm:text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-4 md:mb-6">
                  {cat.name}
                </h2>
                <div className="flex items-center gap-4 group-hover:gap-6 transition-all duration-300">
                  <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.3em] md:tracking-[0.5em] uppercase opacity-30">Enter Node</span>
                  <ArrowRight size={20} style={{ color: cat.color }} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <footer className="mt-auto flex justify-between items-end nav-element opacity-20 text-[8px] font-black tracking-[0.8em] uppercase">
          <span>Access_Level: Authorized</span>
          <span>© BMSCE_EVENTS_2026</span>
        </footer>
      </div>

      {/* --- THE VAULT SHUTTERS --- */}
      <div className="fixed inset-0 z-50 flex pointer-events-none">
        {/* Left Shutter */}
        <div ref={leftDoorRef} className="h-full w-1/2 bg-[#0c0c0c] border-r border-white/5 flex items-center justify-end pointer-events-auto relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_right,_#ffffff11_0%,_transparent_70%)]" />
          <div className="w-[1px] h-32 bg-white/20 translate-x-[0.5px]" />
        </div>

        {/* Right Shutter */}
        <div ref={rightDoorRef} className="h-full w-1/2 bg-[#0c0c0c] border-l border-white/5 flex items-center justify-start pointer-events-auto relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_left,_#ffffff11_0%,_transparent_70%)]" />
          <div className="w-[1px] h-32 bg-white/20 -translate-x-[0.5px]" />
        </div>

        {/* Center Lock Button */}
        {!isUnlocked && (
          <div className="lock-indicator absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
            <button
              disabled={loading}
              onClick={handleSequence}
              className={`w-32 h-32 rounded-full bg-white text-black flex flex-col items-center justify-center gap-2 hover:scale-110 active:scale-90 transition-all shadow-[0_0_80px_rgba(255,255,255,0.2)] group ${loading ? 'opacity-50 cursor-wait' : ''}`}
            >
              <Lock size={28} className="group-hover:hidden" />
              <Unlock size={28} className="hidden group-hover:block" />
              <span className="text-[8px] font-black tracking-widest uppercase">
                {loading ? "Loading" : "Unlock"}
              </span>
            </button>
          </div>
        )}
      </div>

      <style>{`
        body { background: #080808; overflow: hidden; }
        .event-card { transition: border 0.3s ease; }
        .event-card:hover { border-color: rgba(255,255,255,0.3); }
      `}</style>
    </div>
  );
}