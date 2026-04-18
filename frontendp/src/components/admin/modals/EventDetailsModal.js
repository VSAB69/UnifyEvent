import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, MapPin, FileText, Activity } from "lucide-react";
import EventService from "../EventService";

export default function EventDetailsModal({ open, onClose, eventId, detailsId, refreshEvents }) {
  const [form, setForm] = useState({ description: "", venue: "", start_datetime: "", end_datetime: "" });

  useEffect(() => {
    if (!open) return;
    if (detailsId) {
      EventService.getEventDetailById(detailsId).then((res) => {
        const d = res.data;
        setForm({
          description: d.description || "",
          venue: d.venue || "",
          start_datetime: d.start_datetime?.slice(0, 16) || "",
          end_datetime: d.end_datetime?.slice(0, 16) || "",
        });
      });
    } else setForm({ description: "", venue: "", start_datetime: "", end_datetime: "" });
  }, [open, detailsId]);

  if (!open) return null;

  const handleSubmit = async () => {
    const payload = { event: eventId, ...form };
    detailsId ? await EventService.updateEventDetails(detailsId, payload) : await EventService.createEventDetails(payload);
    refreshEvents();
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center px-4">
        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="relative w-full max-w-2xl bg-[#0a0a0a] border-2 border-white/10 rounded-[45px] p-10 shadow-2xl">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-xl hover:bg-white/10 text-white/40"><X size={24} /></button>
          
          <div className="flex items-center gap-3 mb-8">
            <Activity className="text-[#4CC9F0]" size={20} />
            <h2 className="text-3xl font-[1000] uppercase tracking-tighter text-white">Log_Event_Details</h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block px-1">Detailed_Description</label>
              <div className="relative group">
                <FileText className="absolute left-4 top-4 text-white/20 group-focus-within:text-[#9155FD] transition-colors" size={18} />
                <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Enter event log description..." className="w-full bg-black border-2 border-white/10 rounded-2xl pl-12 pr-5 py-4 text-sm font-black text-white focus:border-[#9155FD] outline-none resize-none transition-all" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block px-1">Physical_Venue</label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#4CC9F0] transition-colors" size={18} />
                <input type="text" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} placeholder="LOC_GRID_REF" className="w-full bg-black border-2 border-white/10 rounded-2xl pl-12 pr-5 py-4 text-sm font-black text-white focus:border-[#4CC9F0] outline-none transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <DateTimeInput label="START_TEMPORAL" value={form.start_datetime} onChange={(v) => setForm({ ...form, start_datetime: v })} color="#00FF41" />
              <DateTimeInput label="END_TEMPORAL" value={form.end_datetime} onChange={(v) => setForm({ ...form, end_datetime: v })} color="#F72585" />
            </div>
          </div>

          <div className="flex gap-4 mt-12">
            <button onClick={onClose} className="flex-1 py-5 rounded-2xl bg-white/[0.05] text-white/40 font-black uppercase tracking-widest text-xs hover:bg-white/10">Abort</button>
            <button onClick={handleSubmit} className="flex-[2] py-5 rounded-2xl bg-white text-black font-[1000] uppercase tracking-widest text-xs hover:bg-[#4CC9F0] hover:text-white transition-all shadow-xl">Sync_Node_Details</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function DateTimeInput({ label, value, onChange, color }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block px-1">{label}</label>
      <div className="relative group">
        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
        <input type="datetime-local" value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-black border-2 border-white/10 rounded-2xl pl-12 pr-4 py-4 text-xs font-black text-white focus:border-white transition-all outline-none" style={{ colorScheme: 'dark' }} />
      </div>
    </div>
  );
}