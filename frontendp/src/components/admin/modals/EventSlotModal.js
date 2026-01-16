import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Users, AlertTriangle, Calendar } from "lucide-react";
import EventService from "../EventService";

export default function EventSlotModal({
  open,
  onClose,
  eventId,
  slotId,
  refreshList,
}) {
  const editMode = Boolean(slotId);

  const [form, setForm] = useState({
    date: "",
    start_time: "",
    end_time: "",
    unlimited_participants: true,
    max_participants: "",
    booked_participants: "0",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    setError("");

    if (!open) return;

    if (editMode) {
      EventService.getEventSlotById(slotId).then((res) => {
        const s = res.data;
        setForm({
          date: s.date || "",
          start_time: s.start_time?.slice(0, 5) || "",
          end_time: s.end_time?.slice(0, 5) || "",
          unlimited_participants: !!s.unlimited_participants,
          max_participants: s.max_participants ?? "",
          booked_participants: String(s.booked_participants ?? "0"),
        });
      });
    } else {
      setForm({
        date: "",
        start_time: "",
        end_time: "",
        unlimited_participants: true,
        max_participants: "",
        booked_participants: "0",
      });
    }
  }, [slotId, open, editMode]);

  const validateTimes = () => {
    if (!form.start_time || !form.end_time) return true;
    return form.end_time > form.start_time;
  };

  const handleSubmit = async () => {
    setError("");

    if (!validateTimes()) {
      setError("End time must be after start time.");
      return;
    }

    const payload = {
      event: eventId,
      date: form.date,
      start_time: form.start_time,
      end_time: form.end_time,
      unlimited_participants: form.unlimited_participants,
      max_participants:
        form.unlimited_participants || form.max_participants === ""
          ? null
          : Number(form.max_participants),
      booked_participants:
        form.booked_participants === "" ? 0 : Number(form.booked_participants),
    };

    if (editMode) {
      await EventService.updateEventSlot(slotId, payload);
    } else {
      await EventService.createEventSlot(payload);
    }

    await refreshList();
    onClose();
  };

  if (!open) return null;

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
          className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-8"
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
            <p className="text-xs font-semibold tracking-widest uppercase text-purple-600">
              Admin
            </p>
            <h2 className="text-2xl font-bold text-gray-900">
              {editMode ? "Edit Event Slot" : "Add Event Slot"}
            </h2>
          </div>

          {/* ERROR */}
          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* MAIN GRID */}
          <div className="grid grid-cols-2 gap-6">
            {/* LEFT — DATE & TIME */}
            <div className="space-y-5">
              <Field
                label="Date"
                type="date"
                icon={<Calendar className="w-4 h-4" />}
                value={form.date}
                onChange={(v) => setForm({ ...form, date: v })}
              />

              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Start Time"
                  type="time"
                  icon={<Clock className="w-4 h-4" />}
                  value={form.start_time}
                  onChange={(v) => setForm({ ...form, start_time: v })}
                />

                <Field
                  label="End Time"
                  type="time"
                  icon={<Clock className="w-4 h-4" />}
                  value={form.end_time}
                  onChange={(v) => setForm({ ...form, end_time: v })}
                  error={!!form.end_time && !validateTimes()}
                />
              </div>
            </div>

            {/* RIGHT — CAPACITY */}
            <div className="space-y-5">
              <label className="flex items-center gap-3 mt-1">
                <input
                  type="checkbox"
                  checked={form.unlimited_participants}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      unlimited_participants: e.target.checked,
                    })
                  }
                  className="w-5 h-5"
                />
                <span className="text-sm font-medium text-gray-800">
                  Unlimited participants
                </span>
              </label>

              <Field
                label="Max Participants"
                type="number"
                icon={<Users className="w-4 h-4" />}
                disabled={form.unlimited_participants}
                value={form.max_participants}
                onChange={(v) => setForm({ ...form, max_participants: v })}
              />

              <Field
                label="Booked Participants"
                type="number"
                icon={<Users className="w-4 h-4" />}
                value={form.booked_participants}
                onChange={(v) => setForm({ ...form, booked_participants: v })}
                helper="Manually editable (availability auto-updated)"
              />
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
              {editMode ? "Save Changes" : "Add Slot"}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ---------- REUSABLE FIELD ---------- */

function Field({
  label,
  value,
  onChange,
  type = "text",
  icon,
  disabled,
  error,
  helper,
}) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div
        className={`mt-1 flex gap-2 rounded-xl border px-3 py-2 ${
          error ? "border-red-400" : "border-gray-300"
        } ${disabled ? "bg-gray-100" : ""}`}
      >
        {icon && <span className="text-gray-400">{icon}</span>}
        <input
          type={type}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="w-full outline-none text-sm bg-transparent"
        />
      </div>
      {helper && <p className="text-xs text-gray-500 mt-1">{helper}</p>}
    </div>
  );
}
