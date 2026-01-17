import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  Edit2,
  Layers,
  Calendar,
  Users,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react";
import EventService from "./EventService";
import DeleteEventModal from "./modals/DeleteEventModal";
import { useAuth } from "../../context/useAuth";

/* ---------------- Animations ---------------- */
const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

/* -------------------------------------------------- */
/* 🔔 LOCAL DELETE ERROR MODAL */
/* -------------------------------------------------- */
function DeleteEventErrorModal({ open, onClose }) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6"
        >
          {/* CLOSE */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          {/* ICON */}
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>

          {/* CONTENT */}
          <h3 className="text-xl font-semibold text-center text-gray-900">
            Unable to Delete Event
          </h3>

          <p className="mt-2 text-sm text-center text-gray-600">
            This event cannot be deleted because it is linked to existing
            bookings or related data.
          </p>

          {/* ACTION */}
          <div className="mt-6">
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition shadow-md"
            >
              OK
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function EventCard({
  event,
  onAddConstraints,
  onEditConstraints,
  onAddDetails,
  onEditDetails,
  onAddOrganisers,
  onEditOrganisers,
  onEditEvent,
  onOpenSlots,
  onOpenAttendance,
  onDelete,
}) {
  const { user } = useAuth();
  const role = user?.role;

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);

  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true);
      await EventService.deleteEvent(event.id);
      setDeleteOpen(false);
      onDelete?.();
    } catch {
      setDeleteOpen(false);
      setErrorOpen(true);
    } finally {
      setDeleting(false);
    }
  };

  const handleOrganisersClick = () => {
    if (event.organisers && event.organisers.length > 0) {
      onEditOrganisers(event.id, event.organisers);
    } else {
      onAddOrganisers(event.id);
    }
  };

  return (
    <>
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="show"
        whileHover={{ y: -4 }}
        className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition overflow-hidden"
      >
        {/* HEADER */}
        <div className="p-4 border-b bg-gradient-to-r from-purple-600 to-indigo-600">
          <div className="flex justify-between items-start gap-4">
            <div className="min-w-0">
              <h3 className="text-white text-lg font-semibold truncate">
                {event.name}
              </h3>
              <p className="text-white/80 text-sm truncate">
                {event.parent_committee || "—"}
              </p>
            </div>

            <div className="text-right shrink-0">
              <p className="text-white font-semibold">
                ₹{Number(event.price || 0).toFixed(2)}
              </p>
              <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-white/20 text-white">
                {event.exclusivity ? "Exclusive" : "Open"}
              </span>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="p-4 space-y-4">
          {/* Description */}
          <div className="text-sm text-gray-700 min-h-[48px]">
            {event.description ? (
              <p className="line-clamp-3">{event.description}</p>
            ) : (
              <p className="text-gray-400 italic">No description provided.</p>
            )}
          </div>

          {/* ACTIONS */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <ActionBtn primary onClick={() => onEditEvent(event)}>
              <Edit2 className="w-4 h-4" /> Edit
            </ActionBtn>

            <ActionBtn
              onClick={() =>
                event.constraint_id
                  ? onEditConstraints(event.constraint_id, event.id)
                  : onAddConstraints(event.id)
              }
            >
              <Layers className="w-4 h-4" /> Constraints
            </ActionBtn>

            <ActionBtn
              onClick={() =>
                event.details_id
                  ? onEditDetails(event.details_id, event.id)
                  : onAddDetails(event.id)
              }
            >
              <Calendar className="w-4 h-4" /> Details
            </ActionBtn>

            <ActionBtn onClick={() => onOpenSlots(event.id, event.name)}>
              <Calendar className="w-4 h-4" /> Slots
            </ActionBtn>

            <ActionBtn green onClick={() => onOpenAttendance(event.id)}>
              <CheckCircle className="w-4 h-4" /> Attendance
            </ActionBtn>

            {/* ADMIN ONLY — ORGANISERS */}
            {role === "admin" && (
              <ActionBtn onClick={handleOrganisersClick}>
                <Users className="w-4 h-4" />
                {event.organisers?.length
                  ? "Edit Organisers"
                  : "Add Organisers"}
              </ActionBtn>
            )}

            {/* ADMIN ONLY — DELETE */}
            {role === "admin" && (
              <ActionBtn danger onClick={() => setDeleteOpen(true)}>
                <Trash2 className="w-4 h-4" /> Delete
              </ActionBtn>
            )}
          </div>
        </div>
      </motion.div>

      {/* DELETE CONFIRM MODAL */}
      <DeleteEventModal
        open={deleteOpen}
        event={event}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
      />

      {/* DELETE ERROR MODAL */}
      <DeleteEventErrorModal
        open={errorOpen}
        onClose={() => setErrorOpen(false)}
      />
    </>
  );
}

/* ---------- BUTTON ---------- */
function ActionBtn({ children, onClick, primary, danger, green }) {
  const base =
    "flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all w-full";

  const styles = primary
    ? "bg-purple-600 text-white hover:bg-purple-700 shadow-sm"
    : green
    ? "bg-green-600 text-white hover:bg-green-700"
    : danger
    ? "bg-red-100 text-red-700 border border-red-300 hover:bg-red-200"
    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100";

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.03 }}
      onClick={onClick}
      className={`${base} ${styles}`}
    >
      {children}
    </motion.button>
  );
}
