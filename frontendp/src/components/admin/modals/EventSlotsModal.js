import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Edit, Trash2, Calendar, Clock } from "lucide-react";
import EventService from "../EventService";
import EventSlotModal from "./EventSlotModal";

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

  return (
    <>
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
            className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl p-8"
          >
            {/* CLOSE */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            {/* HEADER */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase text-purple-600">
                  Admin
                </p>
                <h2 className="text-2xl font-bold text-gray-900">
                  Manage Slots — {eventName || `Event #${eventId}`}
                </h2>
              </div>

              <motion.button
                onClick={() => {
                  setSlotIdToEdit(null);
                  setSlotModalOpen(true);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-2 rounded-xl bg-purple-600 text-white px-4 py-2 font-semibold hover:bg-purple-700 transition shadow-md"
              >
                <Plus className="w-4 h-4" />
                Add Slot
              </motion.button>
            </div>

            {/* TABLE HEADER */}
            <div className="grid grid-cols-6 gap-4 text-xs font-semibold uppercase tracking-wider text-gray-500 border-b pb-3">
              <div>Date</div>
              <div>Start</div>
              <div>End</div>
              <div>Type</div>
              <div className="text-right">Available</div>
              <div className="text-center">Actions</div>
            </div>

            {/* TABLE BODY */}
            <div className="mt-3 space-y-2">
              {loading ? (
                <p className="text-sm text-gray-500">Loading slots…</p>
              ) : slots.length === 0 ? (
                <p className="text-sm text-gray-500">No slots added yet.</p>
              ) : (
                slots.map((s) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-6 gap-4 items-center rounded-xl border px-4 py-3 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {s.date}
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {s.start_time}
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {s.end_time}
                    </div>

                    <div className="text-sm">
                      {s.unlimited_participants
                        ? "Unlimited"
                        : `Max ${s.max_participants}`}
                    </div>

                    <div className="text-sm text-right">
                      {s.unlimited_participants
                        ? "—"
                        : s.available_participants}
                    </div>

                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => {
                          setSlotIdToEdit(s.id);
                          setSlotModalOpen(true);
                        }}
                        className="p-2 rounded-lg hover:bg-purple-100 text-purple-700 transition"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={async () => {
                          if (window.confirm("Delete this slot?")) {
                            await EventService.deleteEventSlot(s.id);
                            fetchSlots();
                          }
                        }}
                        className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* FOOTER */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* CREATE / EDIT SLOT */}
      <EventSlotModal
        open={slotModalOpen}
        onClose={() => setSlotModalOpen(false)}
        eventId={eventId}
        slotId={slotIdToEdit}
        refreshList={fetchSlots}
      />
    </>
  );
}
