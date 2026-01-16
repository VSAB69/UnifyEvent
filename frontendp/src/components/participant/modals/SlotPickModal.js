import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Users } from "lucide-react";

export default function SlotPickModal({
  open,
  onClose,
  event,
  participantsCount,
  onPick,
  fetchSlots,
}) {
  const [slots, setSlots] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !event) return;

    const load = async () => {
      setLoading(true);
      setSelectedId(null);
      try {
        const res = await fetchSlots(event.id);
        setSlots(res.data || []);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [open, event?.id, fetchSlots]);

  if (!open) return null;

  const selected = slots.find((s) => String(s.id) === String(selectedId));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4"
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-8"
        >
          {/* CLOSE */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          {/* HEADER */}
          <div className="mb-6">
            <p className="text-xs font-semibold tracking-widest uppercase text-purple-600 mb-1">
              Step 3 of 3
            </p>
            <h2 className="text-2xl font-bold text-gray-900">
              Pick a Time Slot
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Select a slot that fits {participantsCount} participant
              {participantsCount > 1 ? "s" : ""}
            </p>
          </div>

          {/* SLOTS */}
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              Loading slots…
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No slots available
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 mb-8">
              {slots.map((s) => {
                const canFit =
                  s.unlimited_participants ||
                  (s.available_participants ?? 0) >= participantsCount;

                const selected = String(s.id) === String(selectedId);

                return (
                  <motion.button
                    key={s.id}
                    whileHover={canFit ? { y: -3 } : {}}
                    whileTap={canFit ? { scale: 0.97 } : {}}
                    onClick={() =>
                      canFit ? setSelectedId(String(s.id)) : null
                    }
                    className={`text-left p-4 rounded-xl border transition-all
                      ${
                        selected
                          ? "border-purple-600 ring-2 ring-purple-200 bg-purple-50"
                          : "border-gray-200 bg-white"
                      }
                      ${
                        canFit
                          ? "hover:border-purple-400"
                          : "opacity-40 cursor-not-allowed"
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                        <Clock className="w-4 h-4" />
                      </div>

                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 text-sm">
                          {s.date}
                        </div>
                        <div className="text-xs text-gray-600">
                          {s.start_time} – {s.end_time}
                        </div>

                        <div className="mt-2 flex items-center gap-1 text-xs text-gray-600">
                          <Users className="w-3.5 h-3.5" />
                          {s.unlimited_participants
                            ? "Unlimited capacity"
                            : canFit
                            ? `${s.available_participants} spots available`
                            : `${s.available_participants} spots (not enough)`}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}

          {/* ACTIONS */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>

            <motion.button
              disabled={!selected}
              onClick={() => onPick(selected)}
              whileHover={selected ? { scale: 1.03 } : {}}
              whileTap={selected ? { scale: 0.96 } : {}}
              className={`flex-1 py-3 rounded-xl font-semibold transition shadow-md
                ${
                  selected
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
            >
              Confirm Slot
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
