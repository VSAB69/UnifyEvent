// src/components/admin/EventCard.jsx
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
  Terminal, 
  ShieldCheck, 
  Ticket,
  Activity // Added missing import
} from "lucide-react";
import EventService from "./EventService";
import DeleteEventModal from "./modals/DeleteEventModal";
import { useAuth } from "../../context/useAuth";

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
  onDelete 
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

  return (
    <>
      <motion.div
        whileHover={{ y: -8, borderColor: "rgba(247, 37, 133, 0.4)" }}
        className="bg-[#0a0a0a] border-2 border-white/5 rounded-[35px] overflow-hidden flex flex-col h-full shadow-2xl transition-all duration-300"
      >
        {/* Header Section */}
        <div className="p-6 bg-white/[0.02] border-b border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Terminal size={80} />
          </div>
          <div className="flex justify-between items-start mb-4">
            <div className="bg-white/5 px-4 py-1 rounded-full border border-white/10">
              <span className="text-[10px] font-black text-[#4CC9F0] uppercase tracking-widest">{event.parent_committee || "UNASSIGNED"}</span>
            </div>
            <div className="text-right">
              <p className="text-2xl font-[1000] italic text-white leading-none tracking-tighter">₹{Number(event.price).toFixed(0)}</p>
              <span className={`text-[8px] font-black uppercase tracking-widest ${event.exclusivity ? 'text-[#F72585]' : 'text-white/40'}`}>
                {event.exclusivity ? "★ Exclusive" : "Public_Node"}
              </span>
            </div>
          </div>
          <h2 className="text-3xl font-[1000] uppercase tracking-tighter text-white leading-tight mb-2 truncate">
            {event.name}
          </h2>
        </div>

        {/* Status Snapshot */}
        <div className="p-6 space-y-3 flex-1">
          <div className="grid grid-cols-1 gap-2">
            <StatusChip label="CONSTRAINTS" isSet={!!event.constraint_id} color="#9155FD" />
            <StatusChip label="DETAILS_LOG" isSet={!!event.details_id} color="#4CC9F0" />
            <StatusChip label="SLOT_SECTORS" isSet={event.slots_count > 0} color="#00FF41" />
          </div>
        </div>

        {/* Action Grid */}
        <div className="p-6 pt-0 grid grid-cols-2 gap-3">
          <AdminBtn color="#FFFFFF" onClick={() => onEditEvent(event)}><Edit2 size={14} /> EDIT</AdminBtn>
          <AdminBtn color="#9155FD" onClick={() => event.constraint_id ? onEditConstraints(event.constraint_id, event.id) : onAddConstraints(event.id)}><Layers size={14} /> LIMITS</AdminBtn>
          <AdminBtn color="#4CC9F0" onClick={() => event.details_id ? onEditDetails(event.details_id, event.id) : onAddDetails(event.id)}><Calendar size={14} /> INFO</AdminBtn>
          <AdminBtn color="#00FF41" onClick={() => onOpenSlots(event.id, event.name)}><Activity size={14} /> SLOTS</AdminBtn>
          <AdminBtn color="#F72585" onClick={() => onOpenAttendance(event.id)} full><CheckCircle size={14} /> ATTENDANCE</AdminBtn>
          {role === "admin" && (
            <AdminBtn color="#FFFFFF" onClick={() => event.organisers?.length ? onEditOrganisers(event.id, event.organisers) : onAddOrganisers(event.id)} full><Users size={14} /> STAFF</AdminBtn>
          )}
          {role === "admin" && (
            <button onClick={() => setDeleteOpen(true)} className="col-span-2 mt-2 py-3 rounded-2xl bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
              PURGE_NODE
            </button>
          )}
        </div>
      </motion.div>

      <DeleteEventModal open={deleteOpen} event={event} onClose={() => setDeleteOpen(false)} onConfirm={handleDeleteConfirm} loading={deleting} />
      <DeleteEventErrorModal open={errorOpen} onClose={() => setErrorOpen(false)} />
    </>
  );
}

function StatusChip({ label, isSet, color }) {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white/[0.02] border border-white/5 rounded-xl">
      <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">{label}</span>
      {isSet ? (
        <CheckCircle size={12} style={{ color }} className="stroke-[3px]" />
      ) : (
        <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
      )}
    </div>
  );
}

function AdminBtn({ children, onClick, color, full }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{ borderColor: `${color}20` }}
      className={`flex items-center justify-center gap-2 py-3 border-2 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all ${full ? 'col-span-2' : ''}`}
    >
      {children}
    </motion.button>
  );
}

function DeleteEventErrorModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0a0a0a] border-2 border-[#F72585] rounded-[40px] p-10 max-w-md w-full text-center">
        <AlertCircle size={60} className="text-[#F72585] mx-auto mb-6" />
        <h3 className="text-2xl font-[1000] uppercase tracking-tighter text-white mb-4">Integrity_Violation</h3>
        <p className="text-xs font-bold text-white/40 uppercase tracking-widest leading-relaxed mb-8">Node cannot be purged while active dependencies (bookings) exist in the registry.</p>
        <button onClick={onClose} className="w-full py-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-xs">Acknowledge</button>
      </motion.div>
    </div>
  );
}