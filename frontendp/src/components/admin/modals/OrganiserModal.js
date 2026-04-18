import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Plus, Users, ShieldCheck, UserMinus } from "lucide-react";
import EventService from "../EventService";

export default function OrganiserModal({ open, onClose, eventId, currentOrganiserIds = [], refreshEvents }) {
  const [allOrganisers, setAllOrganisers] = useState([]);
  const [assigned, setAssigned] = useState([]);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const loadOrganisers = useCallback(async () => {
    try {
      const res = await EventService.getOrganisers();
      setAllOrganisers(res.data || []);
      setAssigned(currentOrganiserIds || []);
    } catch (err) {
      setError("FAILED_TO_LOAD_STAFF_REGISTRY");
    }
  }, [currentOrganiserIds]);

  useEffect(() => { if (open) loadOrganisers(); }, [open, loadOrganisers]);

  if (!open) return null;

  const assignedOrganisers = allOrganisers.filter((o) => assigned.includes(o.id));
  const availableOrganisers = allOrganisers.filter(
    (o) => !assigned.includes(o.id) && o.user_display.toLowerCase().includes(search.toLowerCase())
  );

  const toggleAssigned = (id) => {
    setAssigned((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await EventService.updateEventJson(eventId, { organisers: assigned });
      if (refreshEvents) await refreshEvents();
      onClose();
    } catch (err) {
      setError("SYNC_FAILURE: ACCESS_DENIED");
    } finally { setSaving(false); }
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center px-4">
        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="relative w-full max-w-5xl bg-[#0a0a0a] border-2 border-white/10 rounded-[45px] shadow-2xl p-10 overflow-hidden">
          <button onClick={onClose} className="absolute top-8 right-8 p-2 rounded-xl hover:bg-white/10 text-white/40"><X size={24} /></button>
          
          <div className="flex items-center gap-3 mb-8">
            <Users className="text-[#9155FD]" size={24} />
            <h2 className="text-3xl font-[1000] uppercase tracking-tighter text-white">Staff_Allocation</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* ASSIGNED PANE */}
            <div className="bg-white/[0.02] border-2 border-white/5 rounded-[32px] p-6 flex flex-col h-[400px]">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck size={14} className="text-[#00FF41]" /> Bound_Organisers
                </span>
                <span className="text-xs font-black text-[#00FF41]">{assignedOrganisers.length}</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {assignedOrganisers.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-[10px] font-black text-white/10 uppercase tracking-widest">No_Units_Bound</div>
                ) : (
                  assignedOrganisers.map((o) => (
                    <div key={o.id} className="flex items-center justify-between bg-black border border-white/10 rounded-2xl px-5 py-3 group">
                      <span className="text-xs font-black text-white/80">{o.user_display}</span>
                      <button onClick={() => toggleAssigned(o.id)} className="p-2 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"><UserMinus size={16} /></button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* SEARCH PANE */}
            <div className="bg-white/[0.02] border-2 border-white/5 rounded-[32px] p-6 flex flex-col h-[400px]">
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                <input placeholder="SEARCH_STAFF_ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-black border-2 border-white/5 rounded-2xl pl-12 pr-4 py-3 text-[10px] font-black uppercase tracking-widest focus:border-[#9155FD] outline-none" />
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {availableOrganisers.map((o) => (
                  <div key={o.id} className="flex items-center justify-between bg-black/40 border border-white/5 rounded-2xl px-5 py-3">
                    <span className="text-xs font-black text-white/40">{o.user_display}</span>
                    <button onClick={() => toggleAssigned(o.id)} className="p-2 text-[#9155FD]/40 hover:text-[#9155FD] hover:bg-[#9155FD]/10 rounded-xl transition-all"><Plus size={16} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {error && <p className="mt-6 text-[10px] font-black text-[#F72585] uppercase tracking-widest text-center">{error}</p>}

          <div className="flex gap-4 mt-10">
            <button onClick={onClose} className="flex-1 py-5 rounded-2xl bg-white/[0.05] text-white/40 font-black uppercase tracking-widest text-xs hover:bg-white/10">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex-[2] py-5 rounded-2xl bg-white text-black font-[1000] uppercase tracking-widest text-xs hover:bg-[#9155FD] hover:text-white transition-all shadow-xl active:scale-95">
              {saving ? "SYNCING..." : "Confirm_Allocation"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}