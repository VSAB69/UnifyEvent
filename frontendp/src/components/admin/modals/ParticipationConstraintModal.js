import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Layers, Users, Zap } from "lucide-react";
import EventService from "../EventService";

export default function ParticipationConstraintModal({ open, onClose, eventId, constraintId, refreshEvents }) {
  const [form, setForm] = useState({ booking_type: "single", fixed: false, lower_limit: "", upper_limit: "" });

  useEffect(() => {
    if (!open) return;
    if (constraintId) {
      EventService.getConstraintById(constraintId).then((res) => {
        const c = res.data;
        setForm({ booking_type: c.booking_type, fixed: c.fixed, lower_limit: c.lower_limit ?? "", upper_limit: c.upper_limit ?? "" });
      });
    } else setForm({ booking_type: "single", fixed: false, lower_limit: "", upper_limit: "" });
  }, [constraintId, open]);

  if (!open) return null;

  const handleSubmit = async () => {
    let payload = { event: eventId, booking_type: form.booking_type };
    if (form.booking_type === "single") { payload.fixed = false; payload.lower_limit = null; payload.upper_limit = null; }
    else if (form.fixed) { payload.fixed = true; payload.lower_limit = null; payload.upper_limit = Number(form.upper_limit); }
    else { payload.fixed = false; payload.lower_limit = Number(form.lower_limit); payload.upper_limit = Number(form.upper_limit); }

    try {
      constraintId ? await EventService.updateConstraint(constraintId, payload) : await EventService.createConstraint(payload);
    } catch {
      const list = await EventService.getConstraints();
      const existing = list.data.find((c) => c.event === eventId);
      if (existing) await EventService.updateConstraint(existing.id, payload);
    }
    refreshEvents();
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center px-4">
        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="relative w-full max-w-4xl bg-[#0a0a0a] border-2 border-white/10 rounded-[45px] p-10 shadow-2xl overflow-hidden">
          <button onClick={onClose} className="absolute top-8 right-8 p-2 rounded-xl hover:bg-white/10 text-white/40"><X size={24} /></button>
          
          <div className="flex items-center gap-3 mb-10">
            <Layers className="text-[#9155FD]" size={24} />
            <h2 className="text-3xl font-[1000] uppercase tracking-tighter text-white">Node_Constraints</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Access_Protocol</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-2xl border border-white/5">
                  {['single', 'multiple'].map((type) => (
                    <button key={type} onClick={() => setForm({ ...form, booking_type: type, fixed: false })} className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${form.booking_type === type ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}>
                      {type}_Unit
                    </button>
                  ))}
                </div>
              </div>

              <label className={`flex items-center justify-between p-6 rounded-3xl border-2 transition-all cursor-pointer ${form.booking_type === 'single' ? 'opacity-20 cursor-not-allowed border-white/5' : 'bg-white/[0.02] border-white/10 hover:border-[#9155FD]/50'}`}>
                <div className="flex items-center gap-4">
                  <Lock className={form.fixed ? 'text-[#9155FD]' : 'text-white/20'} size={20} />
                  <span className="text-xs font-[1000] uppercase tracking-widest text-white/80">Lock_Team_Scale</span>
                </div>
                <input type="checkbox" disabled={form.booking_type === 'single'} checked={form.fixed} onChange={(e) => setForm({ ...form, fixed: e.target.checked })} className="w-6 h-6 accent-[#9155FD]" />
              </label>
            </div>

            <div className="bg-white/[0.02] border-2 border-white/5 rounded-[40px] p-8 space-y-6">
               <div className="flex items-center gap-3 mb-2 text-[#00FF41]">
                  <Users size={18} />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Temporal_Limits</span>
               </div>
               <div className="grid grid-cols-1 gap-6">
                 <Field label="MIN_CAPACITY" type="number" disabled={form.booking_type === 'single' || form.fixed} value={form.lower_limit} onChange={(v) => setForm({ ...form, lower_limit: v })} />
                 <Field label="MAX_CAPACITY" type="number" disabled={form.booking_type === 'single'} value={form.upper_limit} onChange={(v) => setForm({ ...form, upper_limit: v })} />
               </div>
            </div>
          </div>

          <div className="flex gap-4 mt-12">
            <button onClick={onClose} className="flex-1 py-5 rounded-2xl bg-white/[0.05] text-white/40 font-black uppercase tracking-widest text-xs hover:bg-white/10">Abort</button>
            <button onClick={handleSubmit} className="flex-[2] py-5 rounded-2xl bg-white text-black font-[1000] uppercase tracking-widest text-xs hover:bg-[#9155FD] hover:text-white transition-all shadow-xl active:scale-95">Commit_Constraints</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Field({ label, value, onChange, type, disabled }) {
  return (
    <div className="space-y-2">
      <label className="text-[9px] font-black text-white/20 uppercase tracking-widest px-1">{label}</label>
      <input type={type} disabled={disabled} value={value} onChange={(e) => onChange(e.target.value)} className={`w-full bg-black border-2 border-white/5 rounded-2xl px-5 py-4 text-sm font-black text-white focus:border-[#00FF41] outline-none transition-all ${disabled ? 'opacity-20' : ''}`} />
    </div>
  );
}