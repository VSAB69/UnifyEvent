import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Cpu,
  PartyPopper,
  CalendarDays,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ParticipantService from "./ParticipantService";

export default function ParentEventsPage() {
  const nav = useNavigate();
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ParticipantService.getParentEvents()
      .then((res) => setParents(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  const getCardTheme = (index) => {
    const themes = [
      {
        // ⚡ PhaseShift
        type: "tech",
        bg: "bg-[#0B0F1A]",
        text: "text-white",
        accent: "text-indigo-400",
        iconBg: "bg-indigo-600",
        label: "PhaseShift • Tech Arena",
        cta: "Explore Arena",
        button:
          "bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-[0_0_20px_rgba(99,102,241,0.6)]",
      },
      {
        // 🟠 UTSAV
        type: "utsav",
        bg: "bg-gradient-to-br from-red-700 via-orange-600 to-red-700",
        text: "text-white",
        accent: "text-orange-200",
        iconBg: "bg-orange-500",
        label: "Utsav • Cultural Fest",
        cta: "Explore Events",
        button: "bg-white text-red-700 hover:bg-red-700 hover:text-white",
      },
      {
        // ⚫ Regular
        type: "regular",
        bg: "bg-[#F8FAFC]",
        text: "text-slate-900",
        accent: "text-slate-700",
        iconBg: "bg-slate-900",
        label: "Regular Events",
        cta: "Explore Events",
        button: "bg-black text-white hover:bg-slate-800",
      },
    ];

    return themes[index % themes.length];
  };

  return (
    <div className="h-screen w-full bg-[#FBFCFE] flex flex-col overflow-hidden font-sans select-none">
      {/* HEADER */}
      <header className="px-8 md:px-16 pt-8 pb-2 flex-shrink-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-[1px] w-6 bg-purple-600" />
            <span className="text-purple-600 text-[10px] font-black uppercase tracking-[0.3em]">
              Event Portal
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-950 leading-[0.95]">
            Explore <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-700 via-purple-600 to-purple-500">
              Events.
            </span>
          </h1>

          <p className="text-slate-600 font-medium mt-4 text-base max-w-lg">
            Discover technology showcases, cultural festivals, and everyday
            events — all in one place.
          </p>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 px-8 md:px-16 pb-8 flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-purple-600 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {parents.map((p, i) => {
                const theme = getCardTheme(i);

                return (
                  <motion.div
                    key={p.id}
                    whileHover={
                      theme.type === "regular"
                        ? { y: -4, scale: 0.99 }
                        : { y: -8 }
                    }
                    transition={{ type: "spring", stiffness: 180 }}
                    className={`relative h-[360px] ${theme.bg}
                    rounded-[2.25rem] overflow-hidden flex flex-col p-8 shadow-2xl`}
                  >
                    {/* ⚡ PhaseShift Neon Border */}
                    {theme.type === "tech" && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        className="absolute inset-0 rounded-[2.25rem] pointer-events-none
                        bg-[conic-gradient(from_180deg,transparent,rgba(99,102,241,0.8),transparent)]
                        animate-spin-slow"
                      />
                    )}

                    {/* 🟠 Utsav Gold Sparkles */}
                    {theme.type === "utsav" && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        className="absolute inset-0 pointer-events-none"
                      >
                        {[...Array(6)].map((_, idx) => (
                          <motion.span
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: [0, 1, 0], y: -30 }}
                            transition={{
                              duration: 1.5,
                              delay: idx * 0.15,
                              repeat: Infinity,
                            }}
                            className="absolute w-1.5 h-1.5 bg-yellow-300 rounded-full"
                            style={{
                              left: `${20 + idx * 10}%`,
                              bottom: "20%",
                            }}
                          />
                        ))}
                      </motion.div>
                    )}

                    {/* CONTENT */}
                    <div className="relative z-10 flex flex-col h-full">
                      <div
                        className={`w-14 h-14 ${theme.iconBg} rounded-[1.2rem]
                        flex items-center justify-center shadow-xl mb-8`}
                      >
                        {theme.type === "tech" ? (
                          <Cpu className="text-white w-6 h-6" />
                        ) : theme.type === "utsav" ? (
                          <PartyPopper className="text-white w-6 h-6" />
                        ) : (
                          <CalendarDays className="text-white w-6 h-6" />
                        )}
                      </div>

                      <h2 className={`text-3xl font-black ${theme.text}`}>
                        {p.name}
                      </h2>

                      <div className="flex items-center gap-2 mt-2 mb-4">
                        <Sparkles size={14} className={theme.accent} />
                        <span
                          className={`text-[10px] font-black uppercase tracking-[0.25em] ${theme.accent}`}
                        >
                          {theme.label}
                        </span>
                      </div>

                      <p
                        className={`${theme.text} opacity-70 text-sm font-medium leading-relaxed max-w-[240px]`}
                      >
                        Explore curated experiences designed to engage,
                        celebrate, and connect communities.
                      </p>

                      {/* CTA */}
                      <motion.button
                        onClick={() => nav(`/parent/${p.id}`)}
                        whileTap={{ scale: 0.95 }}
                        className={`mt-auto w-full py-3 rounded-xl font-black text-sm
                        flex items-center justify-center gap-2 transition-all duration-300
                        ${theme.button}`}
                      >
                        {theme.cta}
                        <ArrowUpRight className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Neon spin utility */}
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 6s linear infinite;
        }
      `}</style>
    </div>
  );
}
