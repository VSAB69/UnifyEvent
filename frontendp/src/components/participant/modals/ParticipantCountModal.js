import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users} from "lucide-react";

export default function ParticipantCountModal({ open, onClose, constraint, onChoose }) {
  const options = useMemo(() => {
    const low = constraint?.lower_limit || 1;
    const high = constraint?.upper_limit || 1;
    const arr = [];
    for (let i = low; i <= high; i++) arr.push(i);
    return arr;
  }, [constraint]);

  const [value, setValue] = useState(options[0] || 1);

  useEffect(() => {
    if (options.length) setValue(options[0]);
  }, [options]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-[#050505]/80 backdrop-blur-xl flex items-center justify-center px-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-sm bg-[#111] border border-white/10 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] p-8 overflow-hidden"
        >
          {/* Subtle Background Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/10 blur-[80px] pointer-events-none" />

          <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 transition text-white/40 hover:text-white">
            <X size={18} />
          </button>

          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
              <Users size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">Team Size</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Configure Unit Count</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-10">
            {options.map((n) => (
              <motion.button
                key={n}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setValue(n)}
                className={`h-14 rounded-2xl font-black italic text-lg transition-all border
                    ${value === n 
                        ? "bg-purple-500 border-purple-400 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]" 
                        : "bg-white/5 border-white/5 text-slate-400 hover:border-white/20"}`}
              >
                {n}
              </motion.button>
            ))}
          </div>

          <div className="flex gap-4">
            <button onClick={onClose} className="flex-1 py-4 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-white/5 transition">
              Abort
            </button>
            <motion.button
              onClick={() => onChoose(value)}
              whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(168,85,247,0.4)" }}
              className="flex-1 py-4 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-all"
            >
              Initialize
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}