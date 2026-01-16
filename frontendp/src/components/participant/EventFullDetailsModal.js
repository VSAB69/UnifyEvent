import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Clock, Calendar } from "lucide-react";
import ParticipantService from "./ParticipantService";

export default function EventFullDetailsModal({
  event,
  open,
  onClose,
  onAddToCart,
}) {
  const [loading, setLoading] = useState(false);
  const [constraint, setConstraint] = useState(null);
  const [details, setDetails] = useState(null);
  const [slots, setSlots] = useState([]);

  const LOW = 5;

  const fmt = (iso) => {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  useEffect(() => {
    if (!open || !event) return;

    const load = async () => {
      setLoading(true);
      try {
        if (event.constraint_id) {
          const c = await ParticipantService.getConstraintById(
            event.constraint_id
          );
          setConstraint(c.data);
        }

        const d = await ParticipantService.getEventDetailsByEvent(event.id);
        if (Array.isArray(d.data) && d.data.length > 0) {
          setDetails(d.data[0]);
        }

        const s = await ParticipantService.getEventSlots(event.id);
        setSlots(s.data || []);
      } catch {}
      setLoading(false);
    };

    load();
  }, [open, event]);

  if (!open || !event) return null;

  const anyLowSlots = slots.some(
    (s) => !s.unlimited_participants && (s.available_participants ?? 0) <= LOW
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-6"
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="
            relative bg-white rounded-3xl w-full max-w-4xl
            shadow-2xl p-8
          "
        >
          {/* CLOSE */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full border bg-white hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>

          {/* HEADER */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">
              {event.name}
            </h1>

            <div className="flex items-center gap-4 mt-2">
              <span className="text-2xl font-semibold text-purple-700">
                {event.price === 0 ? "Free" : `₹ ${event.price}`}
              </span>

              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                {event.exclusivity ? "Exclusive" : "Open Event"}
              </span>
            </div>
          </div>

          {/* LOW SLOT WARNING */}
          {anyLowSlots && (
            <div className="mb-5 px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
              ⚠️ Few slots left — book soon
            </div>
          )}

          {/* INFO GRID */}
          {details && (
            <div className="grid grid-cols-3 gap-6 mb-6">
              <Info icon={<MapPin />} label="Venue" value={details.venue} />
              <Info
                icon={<Calendar />}
                label="Starts"
                value={fmt(details.start_datetime)}
              />
              <Info
                icon={<Clock />}
                label="Ends"
                value={fmt(details.end_datetime)}
              />
            </div>
          )}

          {/* DESCRIPTION */}
          {details?.description && (
            <p className="text-gray-700 text-sm leading-relaxed line-clamp-3 mb-6">
              {details.description}
            </p>
          )}

          {/* PARTICIPATION + SLOTS */}
          <div className="grid grid-cols-3 gap-6">
            {/* PARTICIPATION */}
            <div className="col-span-1 border rounded-xl p-4 bg-gray-50 text-sm">
              <h3 className="font-semibold text-gray-900 mb-2">
                Participation
              </h3>

              {constraint ? (
                <>
                  <p>
                    <strong>Type:</strong>{" "}
                    {constraint.booking_type === "single"
                      ? "Single"
                      : "Multiple"}
                  </p>
                  <p>
                    <strong>Team size:</strong>{" "}
                    {constraint.booking_type === "single"
                      ? "1"
                      : constraint.fixed
                      ? constraint.upper_limit
                      : `${constraint.lower_limit}–${constraint.upper_limit}`}
                  </p>
                </>
              ) : (
                <p className="text-gray-500">No rules</p>
              )}
            </div>

            {/* SLOTS */}
            <div className="col-span-2">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">
                Available Slots
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {loading ? (
                  <p className="text-gray-500">Loading…</p>
                ) : slots.length === 0 ? (
                  <p className="text-gray-500">No slots available</p>
                ) : (
                  slots.slice(0, 4).map((s) => {
                    const low =
                      !s.unlimited_participants &&
                      (s.available_participants ?? 0) <= LOW;

                    return (
                      <motion.div
                        key={s.id}
                        whileHover={{ y: -2 }}
                        className={`p-3 rounded-xl border text-xs ${
                          low
                            ? "border-red-300 bg-red-50"
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        <div className="font-medium text-gray-900">
                          {s.date}
                        </div>
                        <div className="text-gray-600">
                          {s.start_time} – {s.end_time}
                        </div>
                        <div className="text-gray-500 mt-1">
                          {s.unlimited_participants
                            ? "Unlimited"
                            : `${s.available_participants} left`}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* CTA */}
          <motion.button
            onClick={onAddToCart}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            className="mt-8 w-full py-3 rounded-xl bg-purple-700 text-white font-semibold hover:bg-purple-800 transition shadow-md"
          >
            Add to Cart
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ---------- HELPERS ---------- */

function Info({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
        {React.cloneElement(icon, { className: "w-5 h-5" })}
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="text-sm text-gray-900">{value}</p>
      </div>
    </div>
  );
}
