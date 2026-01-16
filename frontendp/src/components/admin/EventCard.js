import React from "react";
import { motion } from "framer-motion";
import {
  Trash2,
  Edit2,
  Layers,
  Calendar,
  Users,
  CheckCircle,
} from "lucide-react";
import EventService from "./EventService";

/* ---------------- Animations ---------------- */
const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function EventCard({
  event,
  role,
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
  const handleDelete = async () => {
    if (!window.confirm(`Delete event "${event.name}"?`)) return;
    try {
      await EventService.deleteEvent(event.id);
      onDelete?.();
    } catch {
      alert("Failed to delete event.");
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
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="show"
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition overflow-hidden"
    >
      {/* ---------- HEADER ---------- */}
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

      {/* ---------- BODY ---------- */}
      <div className="p-4 space-y-4">
        {/* Description */}
        <div className="text-sm text-gray-700 min-h-[48px]">
          {event.description ? (
            <p className="line-clamp-3">{event.description}</p>
          ) : (
            <p className="text-gray-400 italic">No description provided.</p>
          )}
        </div>

        {/* Meta */}
        <div className="flex items-center gap-6 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-purple-600" />
            <span>{event.start_date || "—"}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-indigo-600" />
            <span>
              {event.capacity ? `${event.capacity} seats` : "Capacity N/A"}
            </span>
          </div>
        </div>

        {/* ---------- ACTIONS ---------- */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          {/* Primary */}
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

          <ActionBtn onClick={handleOrganisersClick}>
            <Users className="w-4 h-4" />
            {event.organisers?.length ? "Edit Organisers" : "Add Organisers"}
          </ActionBtn>

          {/* Destructive */}
          {role === "admin" && (
            <ActionBtn danger onClick={handleDelete}>
              <Trash2 className="w-4 h-4" /> Delete
            </ActionBtn>
          )}
        </div>
      </div>
    </motion.div>
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
