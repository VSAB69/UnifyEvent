import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut } from "lucide-react";

export default function LogoutConfirmModal({ open, onClose, onConfirm }) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center px-4"
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-sm sm:max-w-md bg-[#0a0a0a] border-2 border-[#F72585]/30 rounded-[32px] sm:rounded-[40px] shadow-[0_0_60px_rgba(247,37,133,0.2)] p-6 sm:p-10 text-center"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-full bg-[#F72585]/10 text-[#F72585] mb-6 mx-auto animate-pulse">
            <LogOut className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>

          <h3 className="text-xl sm:text-2xl font-[1000] uppercase tracking-tighter text-white mb-4">Terminate_Session</h3>
          <p className="text-[10px] sm:text-xs font-bold text-white/40 uppercase tracking-widest leading-relaxed mb-8">
            Are you sure you want to disconnect? Active protocol syncs may be interrupted.
          </p>

          <div className="flex flex-col gap-3">
            <button 
              onClick={onConfirm} 
              className="w-full py-4 sm:py-5 rounded-2xl bg-[#F72585] text-white font-[1000] uppercase tracking-widest text-[10px] sm:text-xs shadow-lg hover:shadow-[#F72585]/40 transition-all active:scale-95"
            >
              Confirm_Logout
            </button>
            <button 
              onClick={onClose} 
              className="w-full py-4 sm:py-5 rounded-2xl bg-white/5 text-white/40 font-black uppercase tracking-widest text-[10px] sm:text-xs hover:bg-white/10 transition-all"
            >
              Cancel_Abort
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}