import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";

export default function DeleteSlotModal({ open, onClose, onConfirm, slot, loading }) {
  if (!open) return null;
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-xl flex items-center justify-center px-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-md bg-[#0a0a0a] border-2 border-[#F72585] rounded-[40px] shadow-[0_0_60px_rgba(247,37,133,0.2)] p-10 text-center">
          <div className="w-20 h-20 flex items-center justify-center rounded-full bg-[#F72585]/10 text-[#F72585] mb-6 mx-auto animate-pulse"><Trash2 size={40} /></div>
          <h3 className="text-2xl font-[1000] uppercase tracking-tighter text-white mb-4">Purge_Sector</h3>
          <p className="text-xs font-bold text-white/40 uppercase tracking-widest leading-relaxed mb-8">Confirm deletion of time sector: <br/><span className="text-[#9155FD]">{slot?.date}</span> | <span className="text-white">{slot?.start_time}-{slot?.end_time}</span></p>
          <div className="flex flex-col gap-3">
            <button onClick={onConfirm} disabled={loading} className="w-full py-5 rounded-2xl bg-[#F72585] text-white font-[1000] uppercase tracking-widest text-xs hover:shadow-[#F72585]/40 transition-all disabled:opacity-50">{loading ? "PURGING..." : "Confirm_Purge"}</button>
            <button onClick={onClose} disabled={loading} className="w-full py-5 rounded-2xl bg-white/5 text-white/40 font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all">Cancel</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}