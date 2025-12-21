import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Clock } from "lucide-react";
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
      setConstraint(null);
      setDetails(null);
      setSlots([]);

      try {
        // constraints
        if (event.constraint_id) {
          try {
            const cRes = await ParticipantService.getConstraintById(
              event.constraint_id
            );
            setConstraint(cRes.data);
          } catch {}
        } else {
          try {
            const cRes = await ParticipantService.getConstraintForEvent(
              event.id
            );
            if (Array.isArray(cRes.data) && cRes.data.length > 0) {
              setConstraint(cRes.data[0]);
            }
          } catch {}
        }

        // event details
        try {
          const dRes = await ParticipantService.getEventDetailsByEvent(
            event.id
          );
          if (Array.isArray(dRes.data) && dRes.data.length > 0) {
            setDetails(dRes.data[0]);
          }
        } catch {}

        // slots
        try {
          const sRes = await ParticipantService.getEventSlots(event.id);
          setSlots(sRes.data || []);
        } catch {}
      } finally {
        setLoading(false);
      }
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
        className="fixed inset-0 bg-black/35 backdrop-blur-sm z-50 flex justify-center items-center p-6"
      >
        <motion.div
          initial={{ scale: 0.97, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.97, opacity: 0 }}
          transition={{ duration: 0.28 }}
          className="relative bg-white rounded-3xl w-full max-w-[1350px] h-[92vh] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.22)] grid grid-cols-1 md:grid-cols-2"
        >
          {/* FIXED CLOSE BUTTON (apple style) */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 bg-white/80 backdrop-blur-lg border border-gray-300 shadow-sm rounded-full p-2 z-[999] hover:bg-white transition"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>

          {/* LEFT IMAGE PANEL */}
          <div className="relative w-full h-full overflow-hidden">
            {/* subtle overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/10 mix-blend-multiply"></div>

            {event.image ? (
              <img
                src={event.image}
                alt={event.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200" />
            )}
          </div>

          {/* RIGHT PANEL */}
          <div className="relative p-10 overflow-y-auto">
            {/* PREMIUM LOW-SLOTS BANNER */}
            {anyLowSlots && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-6"
              >
                <div className="px-5 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 font-medium text-sm text-center shadow-sm">
                  ⚠️ Few slots left — secure your spot now
                </div>
              </motion.div>
            )}

            {/* TITLE */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-4xl font-bold text-gray-900 leading-tight mb-3"
            >
              {event.name}
            </motion.h1>

            {/* PRICE */}
            <div className="flex items-center gap-4 mb-8">
              <span className="text-3xl font-semibold text-purple-700 tracking-tight">
                ₹{Number(event.price).toFixed(2)}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  event.exclusivity
                    ? "bg-purple-100 text-purple-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {event.exclusivity ? "Exclusive event" : "Open event"}
              </span>
            </div>

            {/* EVENT DETAILS CARD */}
            <section className="mb-10">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Event Details
              </h2>

              <div className="bg-gray-50 border border-gray-200 p-6 rounded-2xl shadow-sm space-y-5">
                {loading ? (
                  <p className="text-gray-500">Loading…</p>
                ) : details ? (
                  <>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-800">Venue</p>
                        <p className="text-gray-600 text-sm">{details.venue}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-800">Starts</p>
                        <p className="text-gray-600 text-sm">
                          {fmt(details.start_datetime)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-800">Ends</p>
                        <p className="text-gray-600 text-sm">
                          {fmt(details.end_datetime)}
                        </p>
                      </div>
                    </div>

                    <p className="text-gray-700 leading-relaxed text-sm">
                      {details.description}
                    </p>
                  </>
                ) : (
                  <p className="text-gray-500">No details available.</p>
                )}
              </div>
            </section>

            {/* PARTICIPATION CARD */}
            <section className="mb-10">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Participation Rules
              </h2>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                {constraint ? (
                  <>
                    <p className="text-gray-800 mb-1 text-sm">
                      <strong className="font-medium">Booking type:</strong>{" "}
                      {constraint.booking_type === "single"
                        ? "Single"
                        : "Multiple"}
                    </p>

                    {constraint.booking_type === "single" && (
                      <p className="text-gray-700 text-sm">
                        Team size: <strong>1</strong>
                      </p>
                    )}

                    {constraint.booking_type === "multiple" &&
                      constraint.fixed && (
                        <p className="text-gray-700 text-sm">
                          Team size: <strong>{constraint.upper_limit}</strong>
                        </p>
                      )}

                    {constraint.booking_type === "multiple" &&
                      !constraint.fixed && (
                        <p className="text-gray-700 text-sm">
                          Team size range:{" "}
                          <strong>
                            {constraint.lower_limit} – {constraint.upper_limit}
                          </strong>
                        </p>
                      )}
                  </>
                ) : (
                  <p className="text-gray-500 text-sm">
                    No participation rules.
                  </p>
                )}
              </div>
            </section>

            {/* SLOTS LIST */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Available Slots
              </h2>

              {loading ? (
                <p className="text-gray-500">Loading slots…</p>
              ) : slots.length === 0 ? (
                <p className="text-gray-500">No slots available.</p>
              ) : (
                <div className="space-y-3">
                  {slots.map((s) => {
                    const low =
                      !s.unlimited_participants &&
                      (s.available_participants ?? 0) <= LOW;

                    return (
                      <div
                        key={s.id}
                        className={`p-4 border rounded-xl shadow-sm bg-white transition ${
                          low
                            ? "border-red-300 bg-red-50/40"
                            : "border-gray-200"
                        }`}
                      >
                        <div className="text-sm font-medium text-gray-900">
                          {s.date} — {s.start_time} to {s.end_time}
                        </div>

                        <div className="text-xs text-gray-600 mt-1">
                          {s.unlimited_participants
                            ? "Unlimited participants"
                            : `${s.available_participants} spots left`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* BUTTONS */}
            <motion.button
              onClick={onAddToCart}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-4 rounded-xl bg-purple-700 text-white font-semibold shadow-lg hover:bg-purple-800 transition"
            >
              Add to Cart
            </motion.button>

            <button
              onClick={onClose}
              className="w-full mt-3 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium transition hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
