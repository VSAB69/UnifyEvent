import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Image as ImageIcon, IndianRupee, Zap, Terminal, Activity } from "lucide-react";
import EventService from "../EventService";

export default function EventModal({ open, onClose, refreshEvents, editEventData }) {
  const [categories, setCategories] = useState([]);
  const [parentEvents, setParentEvents] = useState([]);
  const [form, setForm] = useState({
    parent_committee: "",
    name: "",
    parent_event: "",
    category: "",
    price: "0",
    exclusivity: false,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (!open) return;
    EventService.getCategories().then((r) => setCategories(r.data || []));
    EventService.getParentEvents().then((r) => setParentEvents(r.data || []));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (editEventData) {
      setForm({
        parent_committee: editEventData.parent_committee || "",
        name: editEventData.name || "",
        parent_event: editEventData.parent_event || "",
        category: editEventData.category || "",
        price: editEventData.price ?? "0",
        exclusivity: editEventData.exclusivity || false,
      });
      if (editEventData.image_key) {
        EventService.getSecureImage(editEventData.image_key)
          .then((res) => setImagePreview(res.data.url))
          .catch(() => setImagePreview(null));
      } else setImagePreview(null);
      setImageFile(null);
    } else {
      setForm({ parent_committee: "", name: "", parent_event: "", category: "", price: "0", exclusivity: false });
      setImagePreview(null);
      setImageFile(null);
    }
  }, [editEventData, open]);

  if (!open) return null;

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (imageFile) fd.append("image", imageFile);
    editEventData ? await EventService.updateEvent(editEventData.id, fd) : await EventService.createEvent(fd);
    refreshEvents();
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center px-4">
        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="relative w-full max-w-5xl bg-[#0a0a0a] border-2 border-white/10 rounded-[40px] shadow-2xl p-10 overflow-hidden">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-xl hover:bg-white/10 transition text-white/40"><X size={24} /></button>
          
          <div className="flex items-center gap-3 mb-8">
            <Terminal className="text-[#F72585]" size={20} />
            <h2 className="text-3xl font-[1000] uppercase tracking-tighter text-white">
              {editEventData ? "Edit_Protocol" : "Initialize_Node"}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <Field label="COMMITTEE_ID" value={form.parent_committee} onChange={(v) => setForm({ ...form, parent_committee: v })} />
                <Field label="NODE_NAME" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
                <Select label="PARENT_SECTOR" value={form.parent_event} onChange={(v) => setForm({ ...form, parent_event: v })} options={parentEvents} />
                <Select label="CATEGORY_LOG" value={form.category} onChange={(v) => setForm({ ...form, category: v })} options={categories} />
              </div>

              <div className="flex items-end gap-10 bg-white/[0.03] p-6 rounded-3xl border border-white/5">
                <div className="flex-1">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block">ACCESS_COST (INR)</label>
                  <div className="flex items-center gap-3 bg-black border-2 border-white/10 rounded-2xl px-4 py-2 focus-within:border-[#4CC9F0] transition-all">
                    <IndianRupee size={16} className="text-[#00FF41]" />
                    <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="bg-transparent w-full outline-none font-black text-xl text-white" />
                  </div>
                </div>
                <label className="flex items-center gap-4 cursor-pointer group">
                  <input type="checkbox" checked={form.exclusivity} onChange={(e) => setForm({ ...form, exclusivity: e.target.checked })} className="w-6 h-6 rounded-lg accent-[#F72585]" />
                  <span className="text-[11px] font-[1000] text-white/60 uppercase tracking-widest group-hover:text-white transition-colors">Exclusive_Protocol</span>
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block">NODE_VISUAL_ASSET</label>
              <label className="flex flex-col items-center justify-center gap-3 aspect-square rounded-[35px] border-2 border-dashed border-white/10 cursor-pointer hover:bg-white/[0.02] transition-all group overflow-hidden">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <ImageIcon size={32} className="text-white/20 group-hover:text-[#F72585] transition-colors" />
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Upload_Asset</span>
                  </>
                )}
                <input type="file" accept="image/*" hidden onChange={handleImageChange} />
              </label>
            </div>
          </div>

          <div className="flex gap-4 mt-12">
            <button onClick={onClose} className="flex-1 py-5 rounded-2xl bg-white/[0.05] text-white/40 font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all">Abort_Process</button>
            <button onClick={handleSubmit} className="flex-[2] py-5 rounded-2xl bg-white text-black font-[1000] uppercase tracking-widest text-xs hover:bg-[#F72585] hover:text-white transition-all shadow-xl">Deploy_Changes</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Field({ label, value, onChange }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-black border-2 border-white/10 rounded-2xl px-5 py-3 text-sm font-black text-white focus:border-[#9155FD] outline-none transition-all" />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-black border-2 border-white/10 rounded-2xl px-5 py-3 text-sm font-black text-white focus:border-[#4CC9F0] outline-none appearance-none cursor-pointer">
        <option value="" className="bg-black text-white/20">NULL_SET</option>
        {options.map((o) => <option key={o.id} value={o.id} className="bg-black text-white">{o.name.toUpperCase()}</option>)}
      </select>
    </div>
  );
}