import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, Lock } from "lucide-react";
import EventService from "../EventService";

export default function ParticipationConstraintModal({
  open,
  onClose,
  eventId,
  constraintId,
  refreshEvents,
}) {
  const [form, setForm] = useState({
    booking_type: "single",
    fixed: false,
    lower_limit: "",
    upper_limit: "",
  });

  useEffect(() => {
    if (!open) return;

    if (constraintId) {
      EventService.getConstraintById(constraintId).then((res) => {
        const c = res.data;
        setForm({
          booking_type: c.booking_type,
          fixed: c.fixed,
          lower_limit: c.lower_limit ?? "",
          upper_limit: c.upper_limit ?? "",
        });
      });
    } else {
      setForm({
        booking_type: "single",
        fixed: false,
        lower_limit: "",
        upper_limit: "",
      });
    }
  }, [constraintId, open]);

  if (!open) return null;

  const disableLogic = {
    fixedDisabled: form.booking_type === "single",
    lowerDisabled:
      form.booking_type === "single" ||
      (form.booking_type === "multiple" && form.fixed),
    upperDisabled: form.booking_type === "single",
  };

  const handleSubmit = async () => {
    let payload = { event: eventId, booking_type: form.booking_type };

    if (form.booking_type === "single") {
      payload.fixed = false;
      payload.lower_limit = null;
      payload.upper_limit = null;
    } else if (form.fixed) {
      payload.fixed = true;
      payload.lower_limit = null;
      payload.upper_limit = Number(form.upper_limit);
    } else {
      payload.fixed = false;
      payload.lower_limit = Number(form.lower_limit);
      payload.upper_limit = Number(form.upper_limit);
    }

    try {
      if (constraintId) {
        await EventService.updateConstraint(constraintId, payload);
      } else {
        await EventService.createConstraint(payload);
      }
    } catch {
      const list = await EventService.getConstraints();
      const existing = list.data.find((c) => c.event === eventId);
      if (existing) {
        await EventService.updateConstraint(existing.id, payload);
      }
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
              {constraintId
                ? "Edit Participation Constraints"
                : "Add Participation Constraints"}
            </h2>
          </div>

          {/* MAIN GRID */}
          <div className="grid grid-cols-2 gap-8">
            {/* LEFT — TYPE */}
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Booking Type
                </label>
                <select
                  value={form.booking_type}
                  onChange={(e) =>
                    setForm({ ...form, booking_type: e.target.value })
                  }
                  className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                >
                  <option value="single">Single Participant</option>
                  <option value="multiple">Multiple Participants</option>
                </select>
              </div>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  disabled={disableLogic.fixedDisabled}
                  checked={form.fixed}
                  onChange={(e) =>
                    setForm({ ...form, fixed: e.target.checked })
                  }
                  className="w-5 h-5"
                />
                <span className="text-sm font-medium text-gray-800 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Fixed team size
                </span>
              </label>
            </div>

            {/* RIGHT — LIMITS */}
            <div className="space-y-5">
              <Field
                label="Lower Limit"
                type="number"
                disabled={disableLogic.lowerDisabled}
                value={form.lower_limit}
                onChange={(v) => setForm({ ...form, lower_limit: v })}
              />

              <Field
                label="Upper Limit"
                type="number"
                disabled={disableLogic.upperDisabled}
                value={form.upper_limit}
                onChange={(v) => setForm({ ...form, upper_limit: v })}
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
              Save Constraints
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ---------- FIELD ---------- */

function Field({ label, value, onChange, type, disabled }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm ${
          disabled ? "bg-gray-100 text-gray-500" : ""
        }`}
      />
    </div>
  );
}
