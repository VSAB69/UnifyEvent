// src/components/participant/ParentEventsPage.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ParticipantService from "./ParticipantService";

export default function ParentEventsPage() {
  const nav = useNavigate();
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await ParticipantService.getParentEvents();
      setParents(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.14 } },
  };

  const card = {
    hidden: { opacity: 0, y: 40, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1 },
  };

  return (
    <div className="relative max-w-7xl mx-auto px-6 py-24 overflow-hidden">
      {/* ========================================================= */}
      {/* 🌌  FULL BACKGROUND ANIMATIONS  (BEHIND ENTIRE PAGE) */}
      {/* ========================================================= */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        {/* 💜 Floating Blobs */}
        <motion.div
          animate={{
            y: [0, -60, 0],
            x: [-20, 20, -20],
            opacity: [0.25, 0.45, 0.25],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-0 w-[450px] h-[450px] bg-purple-500/60 rounded-full blur-[160px]"
        />

        <motion.div
          animate={{
            y: [40, -20, 40],
            x: [30, -10, 30],
            opacity: [0.2, 0.35, 0.2],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 right-0 w-[380px] h-[380px] bg-pink-500/60 rounded-full blur-[160px]"
        />

        {/* 💙 Center Glow */}
        <motion.div
          animate={{ opacity: [0.1, 0.25, 0.1], scale: [1, 1.15, 1] }}
          transition={{ duration: 18, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                     w-[700px] h-[700px] bg-indigo-400/40 rounded-full blur-[200px]"
        />

        {/* ✨ Particle Field */}
        <motion.div
          animate={{ opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15),transparent_70%)]"
        />

        {/* 🔥 Light Beam Gradient */}
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          className="absolute left-1/2 top-1/2 w-[130%] h-[130%] 
                     bg-[conic-gradient(from_90deg,rgba(255,100,200,0.15),rgba(80,80,255,0.15),rgba(255,80,150,0.15))] 
                     blur-[180px] opacity-60"
        />
      </div>

      {/* ========================================================= */}
      {/* PAGE TITLE */}
      {/* ========================================================= */}
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center text-5xl sm:text-6xl font-extrabold mb-16
                   bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-500
                   text-transparent bg-clip-text drop-shadow-xl"
      >
        Parent Events
      </motion.h1>

      {/* ========================================================= */}
      {/* CONTENT */}
      {/* ========================================================= */}
      {loading ? (
        <div className="text-center text-gray-500 text-lg">Loading…</div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10"
        >
          {parents.map((p) => (
            <motion.div
              key={p.id}
              variants={card}
              whileHover={{ scale: 1.07 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => nav(`/parent/${p.id}`)}
              className="
                cursor-pointer rounded-3xl overflow-hidden shadow-2xl
                bg-white/30 backdrop-blur-2xl border border-purple-300/40 
                hover:border-pink-400 hover:shadow-pink-300/40 
                transition-all duration-500 group relative"
            >
              {/* IMAGE */}
              <div className="h-64 w-full overflow-hidden relative">
                {p.image ? (
                  <motion.img
                    src={p.image}
                    alt={p.name}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1 }}
                    className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-300 to-pink-300" />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              </div>

              <div className="p-6 min-h-[180px] flex flex-col justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{p.name}</h2>

                <p className="text-gray-700 mt-2 text-sm">
                  Explore all events under this parent category.
                </p>

                <motion.div
                  whileHover={{ x: 6 }}
                  className="mt-5 flex items-center gap-2 text-purple-700 font-semibold"
                >
                  View Events <ChevronRight className="w-5 h-5" />
                </motion.div>
              </div>

              {/* Soft Glow Layer */}
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 0.4 }}
                className="absolute inset-0 bg-gradient-to-br 
                           from-purple-400/40 to-pink-400/40 mix-blend-overlay 
                           pointer-events-none rounded-3xl"
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
