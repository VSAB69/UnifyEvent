import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Clock,
  AlertCircle,
  Activity,
  Terminal,
} from "lucide-react";
import EventService from "../EventService";
import EventSlotModal from "./EventSlotModal";
import DeleteSlotModal from "./DeleteSlotModal";

/* -------------------------------------------------- */
/* 🔔 LOCAL ERROR ALERT MODAL */
/* -------------------------------------------------- */
function SlotErrorModal({ open, onClose }) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-xl flex items-center justify-center px-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-md bg-[#0a0a0a] border-2 border-[#F72585] rounded-[40px] shadow-[0_0_60px_rgba(247,37,133,0.2)] p-10 text-center"
        >
          <div className="w-20 h-20 flex items-center justify-center rounded-full bg-[#F72585]/10 text-[#F72585] mb-6 mx-auto animate-pulse">
            <AlertCircle size={40} />
          </div>

          <h3 className="text-2xl font-[1000] uppercase tracking-tighter text-white mb-4">
            Integrity_Violation
          </h3>

          <p className="text-xs font-bold text-white/40 uppercase tracking-widest leading-relaxed mb-8">
            Cannot purge temporal sector as active bookings are linked to this registry node.
          </p>

          <button
            onClick={onClose}
            className="w-full py-5 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-[#F72585] hover:text-white transition-all"
          >
            Acknowledge
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function EventSlotsListModal({
  open,
  onClose,
  eventId,
  eventName,
}) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  const [slotModalOpen, setSlotModalOpen] = useState(false);
  const [slotIdToEdit, setSlotIdToEdit] = useState(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [errorOpen, setErrorOpen] = useState(false);

  const fetchSlots = useCallback(async () => {
    if (!eventId) return;
    setLoading(true);
    try {
      const res = await EventService.getEventSlots(eventId);
      setSlots(res.data || []);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (open) fetchSlots();
  }, [open, fetchSlots]);

  if (!open) return null;

  const handleDeleteConfirm = async () => {
    if (!slotToDelete) return;

    try {
      setDeleting(true);
      await EventService.deleteEventSlot(slotToDelete.id);
      setDeleteOpen(false);
      setSlotToDelete(null);
      fetchSlots();
    } catch (err) {
      setDeleteOpen(false);
      setSlotToDelete(null);
      setErrorOpen(true);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center px-4"
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 20 }}
            transition={{ duration: 0.25 }}
            className="relative w-full max-w-6xl bg-[#0a0a0a] border-2 border-white/10 rounded-[45px] shadow-2xl p-10 overflow-hidden"
          >
            {/* CLOSE */}
            <button
              onClick={onClose}
              className="absolute top-8 right-8 p-2 rounded-xl hover:bg-white/10 text-white/40 transition"
            >
              <X className="w-6 h-6" />
            </button>

            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Terminal className="text-[#F72585]" size={20} />
                  <p className="text-[10px] tracking-[0.6em] text-white/40 uppercase font-black">
                    Registry_Temporal_v4.1
                  </p>
                </div>
                <h2 className="text-3xl md:text-4xl font-[1000] uppercase tracking-tighter text-white">
                  Temporal_Sectors —{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F72585] via-[#9155FD] to-[#4CC9F0] italic">
                    {eventName?.toUpperCase() || `NODE_#${eventId}`}
                  </span>
                </h2>
              </div>

              <motion.button
                onClick={() => {
                  setSlotIdToEdit(null);
                  setSlotModalOpen(true);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-black font-[1000] uppercase tracking-widest text-xs shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:bg-[#00FF41] hover:text-white transition-all"
              >
                <Plus size={18} strokeWidth={3} />
                Add_Sector
              </motion.button>
            </div>

            {/* TABLE HEADER */}
            <div className="grid grid-cols-6 gap-4 px-6 py-4 bg-white/[0.03] border border-white/5 rounded-2xl mb-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
              <div>Date_Stamp</div>
              <div>Start_UTC</div>
              <div>End_UTC</div>
              <div>Access_Type</div>
              <div className="text-right">Availability</div>
              <div className="text-center">Operations</div>
            </div>

            {/* TABLE BODY */}
            <div className="max-h-[50vh] overflow-y-auto custom-scrollbar space-y-3 pr-2">
              {loading ? (
                <div className="flex flex-col items-center py-20">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-10 h-10 border-4 border-[#9155FD] border-t-transparent rounded-full mb-4"
                  />
                  <p className="text-[10px] tracking-widest text-[#9155FD] font-black animate-pulse">
                    SYNCHRONIZING_TIMELINE...
                  </p>
                </div>
              ) : slots.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[32px]">
                  <p className="text-xs font-black text-white/10 uppercase tracking-[0.4em]">
                    No_Temporal_Records_Found
                  </p>
                </div>
              ) : (
                slots.map((s) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="grid grid-cols-6 gap-4 items-center bg-white/[0.01] border border-white/5 rounded-2xl px-6 py-4 hover:border-white/20 transition-all group"
                  >
                    <div className="flex items-center gap-3 text-xs font-black text-white/80">
                      <Calendar className="w-4 h-4 text-[#9155FD]" />
                      {s.date}
                    </div>

                    <div className="flex items-center gap-3 text-xs font-black text-white/80">
                      <Clock className="w-4 h-4 text-[#4CC9F0]" />
                      {s.start_time}
                    </div>

                    <div className="flex items-center gap-3 text-xs font-black text-white/80">
                      <Clock className="w-4 h-4 text-[#F72585]" />
                      {s.end_time}
                    </div>

                    <div className="text-[10px] font-black uppercase tracking-widest text-white/40">
                      {s.unlimited_participants ? (
                        <span className="text-[#00FF41]">Unlimited_Link</span>
                      ) : (
                        `Max_${s.max_participants}_Units`
                      )}
                    </div>

                    <div className="text-xs font-black text-right text-white italic">
                      {s.unlimited_participants ? (
                        <span className="opacity-20">—</span>
                      ) : (
                        s.available_participants
                      )}
                    </div>

                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => {
                          setSlotIdToEdit(s.id);
                          setSlotModalOpen(true);
                        }}
                        className="p-3 rounded-xl bg-white/5 text-[#4CC9F0] hover:bg-[#4CC9F0] hover:text-white transition-all active:scale-90"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          setSlotToDelete(s);
                          setDeleteOpen(true);
                        }}
                        className="p-3 rounded-xl bg-white/5 text-[#F72585] hover:bg-[#F72585] hover:text-white transition-all active:scale-90"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* FOOTER */}
            <div className="mt-10 flex justify-end gap-4 border-t border-white/5 pt-8">
              <button
                onClick={onClose}
                className="px-10 py-4 rounded-2xl bg-white/5 text-white/40 font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all"
              >
                Close_Terminal
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <EventSlotModal
        open={slotModalOpen}
        onClose={() => setSlotModalOpen(false)}
        eventId={eventId}
        slotId={slotIdToEdit}
        refreshList={fetchSlots}
      />

      <DeleteSlotModal
        open={deleteOpen}
        slot={slotToDelete}
        loading={deleting}
        onClose={() => {
          if (!deleting) {
            setDeleteOpen(false);
            setSlotToDelete(null);
          }
        }}
        onConfirm={handleDeleteConfirm}
      />

      <SlotErrorModal open={errorOpen} onClose={() => setErrorOpen(false)} />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #F72585; }
      `}</style>
    </>
  );
}