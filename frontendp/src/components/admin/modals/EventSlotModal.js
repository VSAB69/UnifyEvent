import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Users, AlertTriangle, Calendar, Zap, Activity } from "lucide-react";
import EventService from "../EventService";

export default function EventSlotModal({ open, onClose, eventId, slotId, refreshList }) {
  const editMode = Boolean(slotId);
  const [form, setForm] = useState({ date: "", start_time: "", end_time: "", unlimited_participants: true, max_participants: "", booked_participants: "0" });
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    if (!open) return;
    if (editMode) {
      EventService.getEventSlotById(slotId).then((res) => {
        const s = res.data;
        setForm({ date: s.date || "", start_time: s.start_time?.slice(0, 5) || "", end_time: s.end_time?.slice(0, 5) || "", unlimited_participants: !!s.unlimited_participants, max_participants: s.max_participants ?? "", booked_participants: String(s.booked_participants ?? "0") });
      });
    } else setForm({ date: "", start_time: "", end_time: "", unlimited_participants: true, max_participants: "", booked_participants: "0" });
  }, [slotId, open, editMode]);

  const handleSubmit = async () => {
    if (form.end_time <= form.start_time) return setError("TEMPORAL_SEQUENCE_ERROR: END_TIME < START_TIME");
    const payload = { event: eventId, date: form.date, start_time: form.start_time, end_time: form.end_time, unlimited_participants: form.unlimited_participants, max_participants: form.unlimited_participants ? null : Number(form.max_participants), booked_participants: Number(form.booked_participants) };
    editMode ? await EventService.updateEventSlot(slotId, payload) : await EventService.createEventSlot(payload);
    await refreshList();
    onClose();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center px-4">
        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="relative w-full max-w-4xl bg-[#0a0a0a] border-2 border-white/10 rounded-[45px] p-10 shadow-2xl">
          <button onClick={onClose} className="absolute top-8 right-8 p-2 rounded-xl hover:bg-white/10 text-white/40"><X size={24} /></button>
          
          <div className="flex items-center gap-3 mb-10">
            <Activity className="text-[#00FF41]" size={24} />
            <h2 className="text-3xl font-[1000] uppercase tracking-tighter text-white">Time_Sector_Init</h2>
          </div>

          {error && <div className="mb-6 flex items-center gap-3 rounded-2xl bg-red-500/10 border border-red-500/20 px-5 py-3 text-[10px] font-black text-red-500 uppercase tracking-widest"><AlertTriangle size={16} /> {error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <SlotField label="DATE_STAMP" type="date" value={form.date} onChange={(v) => setForm({ ...form, date: v })} />
              <div className="grid grid-cols-2 gap-4">
                <SlotField label="START_UTC" type="time" value={form.start_time} onChange={(v) => setForm({ ...form, start_time: v })} />
                <SlotField label="END_UTC" type="time" value={form.end_time} onChange={(v) => setForm({ ...form, end_time: v })} />
              </div>
            </div>

            <div className="bg-white/[0.02] border-2 border-white/5 rounded-[40px] p-8 space-y-6">
              <label className="flex items-center justify-between group cursor-pointer">
                <span className="text-[10px] font-[1000] uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">Unlimited_Access</span>
                <input type="checkbox" checked={form.unlimited_participants} onChange={(e) => setForm({ ...form, unlimited_participants: e.target.checked })} className="w-6 h-6 accent-[#00FF41]" />
              </label>
              <SlotField label="NODE_CAPACITY" type="number" disabled={form.unlimited_participants} value={form.max_participants} onChange={(v) => setForm({ ...form, max_participants: v })} />
              <SlotField label="MANUAL_BOOKING_OVERRIDE" type="number" value={form.booked_participants} onChange={(v) => setForm({ ...form, booked_participants: v })} />
            </div>
          </div>

          <div className="flex gap-4 mt-12">
            <button onClick={onClose} className="flex-1 py-5 rounded-2xl bg-white/[0.05] text-white/40 font-black uppercase tracking-widest text-xs hover:bg-white/10">Abort</button>
            <button onClick={handleSubmit} className="flex-[2] py-5 rounded-2xl bg-white text-black font-[1000] uppercase tracking-widest text-xs hover:bg-[#00FF41] hover:text-white transition-all shadow-xl active:scale-95">Synchronize_Sector</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function SlotField({ label, value, onChange, type, disabled }) {
  return (
    <div className="space-y-2">
      <label className="text-[9px] font-black text-white/20 uppercase tracking-widest px-1">{label}</label>
      <input type={type} disabled={disabled} value={value} onChange={(e) => onChange(e.target.value)} className={`w-full bg-black border-2 border-white/5 rounded-2xl px-5 py-4 text-xs font-black text-white focus:border-white outline-none transition-all ${disabled ? 'opacity-20' : ''}`} style={{ colorScheme: 'dark' }} />
    </div>
  );
}