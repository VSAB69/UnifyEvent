import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, MapPin, FileText } from "lucide-react";
import EventService from "../EventService";

export default function EventDetailsModal({
  open,
  onClose,
  eventId,
  detailsId,
  refreshEvents,
}) {
  const [form, setForm] = useState({
    description: "",
    venue: "",
    start_datetime: "",
    end_datetime: "",
  });

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
    } else {
      setForm({
        description: "",
        venue: "",
        start_datetime: "",
        end_datetime: "",
      });
    }
  }, [open, detailsId]);

  if (!open) return null;

  const handleSubmit = async () => {
    const payload = { event: eventId, ...form };

    if (detailsId) {
      await EventService.updateEventDetails(detailsId, payload);
    } else {
      await EventService.createEventDetails(payload);
    }

    refreshEvents();
    onClose();
  };

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
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8"
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
              Admin
            </p>
            <h2 className="text-2xl font-bold text-gray-900">
              {detailsId ? "Edit Event Details" : "Add Event Details"}
            </h2>
          </div>

          {/* FORM */}
          <div className="space-y-5">
            {/* DESCRIPTION */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Description
              </label>
              <div className="mt-1 flex gap-2 rounded-xl border px-3 py-2">
                <FileText className="w-4 h-4 text-gray-400 mt-1" />
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Brief description of the event"
                  className="w-full resize-none outline-none text-sm"
                />
              </div>
            </div>

            {/* VENUE */}
            <div>
              <label className="text-sm font-medium text-gray-700">Venue</label>
              <div className="mt-1 flex gap-2 rounded-xl border px-3 py-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={form.venue}
                  onChange={(e) => setForm({ ...form, venue: e.target.value })}
                  placeholder="Event venue"
                  className="w-full outline-none text-sm"
                />
              </div>
            </div>

            {/* DATE TIME */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Start Date & Time
                </label>
                <div className="mt-1 flex gap-2 rounded-xl border px-3 py-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <input
                    type="datetime-local"
                    value={form.start_datetime}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        start_datetime: e.target.value,
                      })
                    }
                    className="w-full outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  End Date & Time
                </label>
                <div className="mt-1 flex gap-2 rounded-xl border px-3 py-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <input
                    type="datetime-local"
                    value={form.end_datetime}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        end_datetime: e.target.value,
                      })
                    }
                    className="w-full outline-none text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>

            <motion.button
              onClick={handleSubmit}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition shadow-md"
            >
              Save Details
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
