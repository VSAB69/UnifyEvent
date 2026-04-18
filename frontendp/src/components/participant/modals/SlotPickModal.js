import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Calendar, CheckCircle2, ShoppingCart, Info } from "lucide-react";

export default function SlotPickModal({ open, onClose, event, participantsCount, onPick, fetchSlots }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    if (!open || !event?.id || loading) return;

    let isMounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchSlots(event.id);
        if (isMounted) setSlots(res.data || []);
      } catch (err) {
        console.error("Slot fetch failed", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => { isMounted = false; };
  }, [open, event?.id, fetchSlots]);

  useEffect(() => {
    if (!open) setSelectedSlot(null);
  }, [open]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[120] bg-[#050505]/90 backdrop-blur-2xl flex items-center justify-center px-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-2xl bg-[#111] border border-white/10 rounded-[3rem] shadow-2xl p-10 overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-pulse" />
          
          <button onClick={onClose} className="absolute top-8 right-8 text-white/30 hover:text-white transition">
            <X size={20} />
          </button>

          <div className="mb-8">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-500">Timeline Selection</span>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white mt-2">Pick your Slot</h2>
          </div>

          <div className="max-h-[40vh] overflow-y-auto pr-4 custom-scrollbar mb-8">
            {loading ? (
              <div className="py-20 text-center text-slate-500 font-black uppercase tracking-widest animate-pulse text-xs">Scanning Frequencies...</div>
            ) : slots.length === 0 ? (
              <div className="py-20 text-center text-slate-500 uppercase tracking-widest text-xs">No Nodes Available</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {slots.map((slot) => {
                  const isUnlimited = slot.unlimited_participants;
                  const left = slot.available_participants ?? 0;
                  const isAvailable = isUnlimited || left >= participantsCount;
                  const isSelected = selectedSlot?.id === slot.id;

                  return (
                    <motion.button
                      key={slot.id}
                      disabled={!isAvailable}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-5 rounded-2xl border text-left transition-all relative group ${
                        isSelected 
                          ? "bg-cyan-500/10 border-cyan-500 shadow-[0_0_20px_rgba(76,201,240,0.2)]" 
                          : isAvailable 
                            ? "bg-white/5 border-white/10 hover:border-white/30" 
                            : "opacity-30 grayscale cursor-not-allowed border-white/5 bg-transparent"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className={`p-2 rounded-lg ${isSelected ? "bg-cyan-500 text-black" : "bg-white/5 text-cyan-500"}`}>
                          <Calendar size={16} />
                        </div>
                        {isSelected && <CheckCircle2 size={18} className="text-cyan-500" />}
                      </div>

                      <p className="text-white font-black italic uppercase text-sm mb-1">{slot.date}</p>
                      
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4">
                        <Clock size={12} /> {slot.start_time} — {slot.end_time}
                      </div>

                      {/* 🚀 CAPACITY INDICATOR */}
                      <div className={`flex items-center gap-1.5 text-[9px] font-black tracking-tighter uppercase px-2 py-1 rounded-md w-fit ${
                        isUnlimited ? "bg-emerald-500/10 text-emerald-500" : 
                        left <= 5 ? "bg-rose-500/10 text-rose-500" : "bg-white/5 text-slate-400"
                      }`}>
                        <Info size={10} />
                        {isUnlimited ? "Unlimited Capacity" : `${left} Slots Remaining`}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex gap-4">
            <button 
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-white/5 transition"
            >
              Cancel
            </button>
            <motion.button
              disabled={!selectedSlot}
              onClick={() => onPick(selectedSlot)}
              whileHover={selectedSlot ? { scale: 1.02, boxShadow: "0_0_30px_rgba(76,201,240,0.3)" } : {}}
              whileTap={selectedSlot ? { scale: 0.98 } : {}}
              className={`flex-[2] py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all ${
                selectedSlot 
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white" 
                  : "bg-white/5 text-slate-600 cursor-not-allowed border border-white/5"
              }`}
            >
              <ShoppingCart size={16} />
              Confirm & Add to Cart
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}