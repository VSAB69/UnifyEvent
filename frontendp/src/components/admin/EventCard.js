// src/components/admin/EventCard.jsx
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

/* ---------------- Animation ---------------- */
const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
  hover: { scale: 1.03 },
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
    } catch (err) {
      alert("Failed to delete event.");
    }
  };

  const handleOrganisersClick = () => {
    if (event.organisers && event.organisers.length > 0) {
      // edit existing organisers
      onEditOrganisers(event.id, event.organisers);
    } else {
      // add new organisers
      onAddOrganisers(event.id);
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="show"
      whileHover="hover"
      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition border border-gray-100 overflow-hidden"
    >
      {/* ----------------- HEADER ----------------- */}
      <div className="bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h3 className="text-white text-lg font-bold truncate">
              {event.name}
            </h3>
            <p className="text-white/80 text-sm truncate">
              {event.parent_committee || "—"}
            </p>
          </div>

          <div className="text-right">
            <p className="text-white text-base font-semibold">
              ₹{Number(event.price || 0).toFixed(2)}
            </p>
            <p className="text-white/70 text-xs">
              {event.exclusivity ? "Exclusive" : "Open"}
            </p>
          </div>
        </div>
      </div>

      {/* ----------------- BODY ----------------- */}
      <div className="p-4 flex flex-col gap-4">
        {/* Description */}
        <div className="min-h-[44px] text-sm text-gray-700 leading-relaxed">
          {event.description ? (
            <p className="line-clamp-3">{event.description}</p>
          ) : (
            <p className="text-gray-400 italic">No description provided.</p>
          )}
        </div>

        {/* Meta Row */}
        <div className="flex items-center gap-5 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-purple-600" />
            <span>{event.start_date || "—"}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-pink-500" />
            <span>
              {event.capacity ? `${event.capacity} seats` : "Capacity N/A"}
            </span>
          </div>
        </div>

        {/* ----------------- BUTTON GRID ----------------- */}
        <div className="grid grid-cols-2 gap-2">
          {/* ---- Row 1 ---- */}
          <AnimatedButton primary onClick={() => onEditEvent(event)}>
            <Edit2 className="w-4 h-4" /> Edit
          </AnimatedButton>

          <AnimatedButton
            onClick={() =>
              event.constraint_id
                ? onEditConstraints(event.constraint_id, event.id)
                : onAddConstraints(event.id)
            }
          >
            <Layers className="w-4 h-4" /> Constraints
          </AnimatedButton>

          {/* ---- Row 2 ---- */}
          <AnimatedButton
            onClick={() =>
              event.details_id
                ? onEditDetails(event.details_id, event.id)
                : onAddDetails(event.id)
            }
          >
            <Calendar className="w-4 h-4" /> Details
          </AnimatedButton>

          <AnimatedButton onClick={() => onOpenSlots(event.id, event.name)}>
            <Calendar className="w-4 h-4" /> Slots
          </AnimatedButton>

          {/* ---- Row 3 ---- */}
          <AnimatedButton green onClick={() => onOpenAttendance(event.id)}>
            <CheckCircle className="w-4 h-4" /> Attendance
          </AnimatedButton>

          {/* ⭐ NEW: Organisers button ⭐ */}
          <AnimatedButton onClick={handleOrganisersClick}>
            <Users className="w-4 h-4" />
            {event.organisers && event.organisers.length > 0
              ? "Edit Organisers"
              : "Add Organisers"}
          </AnimatedButton>

          {/* ---- Row 4 (Delete for admin) ---- */}
          {role === "admin" && (
            <AnimatedButton danger onClick={handleDelete}>
              <Trash2 className="w-4 h-4" /> Delete
            </AnimatedButton>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ---------------- Reusable Button ---------------- */
function AnimatedButton({ children, onClick, primary, danger, green }) {
  const base =
    "flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all w-full";

  const colors = primary
    ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:shadow-lg"
    : danger
    ? "bg-red-100 text-red-700 border border-red-300 hover:bg-red-200"
    : green
    ? "bg-green-600 text-white hover:bg-green-700 shadow-md"
    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100";

  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
      className={`${base} ${colors}`}
    >
      {children}
    </motion.button>
  );
}
