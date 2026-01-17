import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Plus, Users } from "lucide-react";
import EventService from "../EventService";

export default function OrganiserModal({
  open,
  onClose,
  eventId,
  currentOrganiserIds = [],
  refreshEvents,
}) {
  const [allOrganisers, setAllOrganisers] = useState([]);
  const [assigned, setAssigned] = useState([]);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const loadOrganisers = useCallback(async () => {
    try {
      const res = await EventService.getOrganisers();
      setAllOrganisers(res.data || []);
      setAssigned(currentOrganiserIds || []);
    } catch (err) {
      console.error("Failed to load organisers", err);
      setError("Failed to load organisers");
    }
  }, [currentOrganiserIds]);

  useEffect(() => {
    if (!open) return;
    loadOrganisers();
  }, [open, loadOrganisers]);

  if (!open) return null;

  const assignedOrganisers = allOrganisers.filter((o) =>
    assigned.includes(o.id)
  );

  const availableOrganisers = allOrganisers.filter(
    (o) =>
      !assigned.includes(o.id) &&
      o.user_display.toLowerCase().includes(search.toLowerCase())
  );

  const toggleAssigned = (id) => {
    setAssigned((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!eventId) {
      setError("Invalid event ID");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // 🔥 JSON ONLY (fixes 415)
      await EventService.updateEventJson(eventId, {
        organisers: assigned,
      });

      if (typeof refreshEvents === "function") {
        await refreshEvents();
      }

      onClose();
    } catch (err) {
      console.error("Failed to save organisers", err);
      setError("Failed to save organisers. Please try again.");
    } finally {
      setSaving(false);
    }
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
          <div className="mb-6">
            <p className="text-xs font-semibold tracking-widest uppercase text-purple-600">
              Admin
            </p>
            <h2 className="text-2xl font-bold text-gray-900">
              Manage Organisers
            </h2>
          </div>

          {/* MAIN GRID */}
          <div className="grid grid-cols-2 gap-8">
            {/* ASSIGNED */}
            <div className="border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Assigned Organisers
                </h3>
              </div>

              {assignedOrganisers.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No organisers assigned yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {assignedOrganisers.map((o) => (
                    <div
                      key={o.id}
                      className="flex items-center justify-between rounded-xl border px-4 py-2 hover:bg-gray-50 transition"
                    >
                      <span className="text-sm font-medium">
                        {o.user_display}
                      </span>

                      <button
                        onClick={() => toggleAssigned(o.id)}
                        className="text-xs font-semibold text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AVAILABLE */}
            <div className="border rounded-2xl p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Available Organisers
              </h3>

              <div className="flex items-center gap-2 border rounded-xl px-3 py-2 mb-4">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  placeholder="Search organisers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full outline-none text-sm"
                />
              </div>

              {availableOrganisers.length === 0 ? (
                <p className="text-sm text-gray-500">No matching organisers.</p>
              ) : (
                <div className="space-y-2">
                  {availableOrganisers.map((o) => (
                    <div
                      key={o.id}
                      className="flex items-center justify-between rounded-xl border px-4 py-2 hover:bg-gray-50 transition"
                    >
                      <span className="text-sm font-medium">
                        {o.user_display}
                      </span>

                      <button
                        onClick={() => toggleAssigned(o.id)}
                        className="flex items-center gap-1 text-xs font-semibold text-purple-700 hover:underline"
                      >
                        <Plus className="w-3 h-3" />
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-600 font-medium">{error}</p>
          )}

          {/* ACTIONS */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>

            <motion.button
              onClick={handleSave}
              disabled={saving}
              whileHover={!saving ? { scale: 1.03 } : undefined}
              whileTap={!saving ? { scale: 0.97 } : undefined}
              className={`flex-1 py-2.5 rounded-xl font-semibold transition shadow-md ${
                saving
                  ? "bg-purple-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700 text-white"
              }`}
            >
              {saving ? "Saving..." : "Save Changes"}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
