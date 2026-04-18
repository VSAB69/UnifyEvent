import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Mail, Phone, ArrowRight, ArrowLeft } from "lucide-react";

export default function ParticipantDetailsModal({ open, onClose, count, onComplete }) {
  const [index, setIndex] = useState(0);
  const [list, setList] = useState([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone_number: "" });

  useEffect(() => {
    if (open) {
      setIndex(0);
      setList(Array.from({ length: count }, () => ({ name: "", email: "", phone_number: "" })));
      setForm({ name: "", email: "", phone_number: "" });
      setError("");
    }
  }, [open, count]);

  if (!open) return null;

  const saveCurrent = () => {
    const updated = [...list];
    updated[index] = { ...form };
    setList(updated);
  };

  const handleNext = () => {
    if (!form.name.trim()) {
      setError("Identity identification required");
      return;
    }
    setError("");
    saveCurrent();
    if (index === count - 1) {
      onComplete(list.map((p, i) => (i === index ? form : p)));
    } else {
      const nextIdx = index + 1;
      setIndex(nextIdx);
      setForm(list[nextIdx] || { name: "", email: "", phone_number: "" });
    }
  };

  const handlePrev = () => {
    if (index === 0) return;
    saveCurrent();
    const prevIdx = index - 1;
    setIndex(prevIdx);
    setForm(list[prevIdx] || { name: "", email: "", phone_number: "" });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-[#050505]/85 backdrop-blur-2xl flex items-center justify-center px-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-lg bg-[#111] border border-white/10 rounded-[3rem] shadow-2xl p-10 overflow-hidden"
        >
          {/* Neon Scanner Line */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-pink-500 to-transparent animate-pulse" />

          <button onClick={onClose} className="absolute top-8 right-8 text-white/30 hover:text-white transition">
            <X size={20} />
          </button>

          <div className="mb-10">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-pink-500">Subject {index + 1} / {count}</span>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white mt-2">Data Ingestion</h2>
          </div>

          <div className="space-y-6">
            <InputField icon={<User size={16}/>} label="Full Identity" placeholder="Full Name" value={form.name} error={error}
              onChange={(v) => setForm({ ...form, name: v })} />
            
            <InputField icon={<Mail size={16}/>} label="Neural Link" placeholder="Email (Optional)" value={form.email} 
              onChange={(v) => setForm({ ...form, email: v })} />

            <InputField icon={<Phone size={16}/>} label="Comms Channel" placeholder="Phone (Optional)" value={form.phone_number} 
              onChange={(v) => setForm({ ...form, phone_number: v })} />
          </div>

          <div className="flex gap-4 mt-12">
            <button onClick={handlePrev} disabled={index === 0} 
              className={`flex-1 py-4 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest transition-all
              ${index === 0 ? "opacity-20 cursor-not-allowed" : "text-slate-400 hover:bg-white/5"}`}>
              <div className="flex items-center justify-center gap-2"><ArrowLeft size={14}/> Back</div>
            </button>

            <motion.button onClick={handleNext} whileHover={{ scale: 1.02 }}
              className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-pink-500/20">
              <div className="flex items-center justify-center gap-2">
                {index === count - 1 ? "Finalize" : "Proceed"} <ArrowRight size={14}/>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function InputField({ icon, label, placeholder, value, onChange, error }) {
  return (
    <div>
      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 block">{label}</label>
      <div className={`flex items-center gap-3 bg-white/5 border ${error ? 'border-red-500/50' : 'border-white/10'} px-5 py-4 rounded-2xl focus-within:border-pink-500/50 transition-all`}>
        <div className="text-slate-500">{icon}</div>
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="bg-transparent w-full outline-none text-sm text-white placeholder:text-slate-700 font-medium" />
      </div>
      {error && <p className="text-[9px] font-bold text-red-500 mt-2 uppercase tracking-tighter">{error}</p>}
    </div>
  );
}