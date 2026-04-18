// src/components/admin/EventGrid.jsx
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Filter, Activity, Zap, Terminal } from "lucide-react";

import { useAuth } from "../../context/useAuth";
import { useNavigate } from "react-router-dom";

import EventCard from "./EventCard";
import EventService from "./EventService";

import EventModal from "./modals/EventModal";
import OrganiserModal from "./modals/OrganiserModal";
import ParticipationConstraintModal from "./modals/ParticipationConstraintModal";
import EventDetailsModal from "./modals/EventDetailsModal";
import EventSlotsListModal from "./modals/EventSlotsModal";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

export default function EventGrid() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = user?.role;

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name_asc");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 9;

  // Modals state
  const [editEventData, setEditEventData] = useState(null);
  const [openEventModal, setOpenEventModal] = useState(false);
  const [openOrgModal, setOpenOrgModal] = useState(false);
  const [eventIdForOrg, setEventIdForOrg] = useState(null);
  const [currentOrgIds, setCurrentOrgIds] = useState([]);
  const [openConstraintModal, setOpenConstraintModal] = useState(false);
  const [eventIdForConstraint, setEventIdForConstraint] = useState(null);
  const [constraintIdToEdit, setConstraintIdToEdit] = useState(null);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [eventIdForDetails, setEventIdForDetails] = useState(null);
  const [detailsIdToEdit, setDetailsIdToEdit] = useState(null);
  const [slotsOpen, setSlotsOpen] = useState(false);
  const [slotsEventId, setSlotsEventId] = useState(null);
  const [slotsEventName, setSlotsEventName] = useState("");

  const [alert, setAlert] = useState({ open: false, message: "", tone: "success" });

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await EventService.getAllEvents();
      setEvents(res.data || []);
    } catch {
      setAlert({ open: true, message: "SYNC_FAILURE: ARCHIVE_OFFLINE", tone: "error" });
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let list = [...events];
    const q = search.toLowerCase();
    if (q) {
      list = list.filter(e => 
        (e.name || "").toLowerCase().includes(q) || 
        (e.parent_committee || "").toLowerCase().includes(q)
      );
    }
    const sortMap = {
      name_asc: (a, b) => a.name.localeCompare(b.name),
      name_desc: (a, b) => b.name.localeCompare(a.name),
      price_asc: (a, b) => Number(a.price) - Number(b.price),
      price_desc: (a, b) => Number(b.price) - Number(a.price),
      recent: (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0),
    };
    return list.sort(sortMap[sortBy]);
  }, [events, search, sortBy]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-[#050505] text-white py-12 px-4 md:px-8 selection:bg-[#F72585]">
      {/* Background Grids */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#1a101a_0%,#050505_100%)] opacity-70" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-3 mb-3">
              <Zap className="text-[#F72585]" size={20} />
              <p className="text-[10px] tracking-[0.6em] text-white/40 uppercase font-black">Admin_Protocol_v4.1</p>
            </div>
            <h1 className="text-4xl md:text-6xl font-[1000] uppercase tracking-tighter leading-none">
              Command <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F72585] via-[#9155FD] to-[#4CC9F0] italic">Center</span>
            </h1>
          </motion.div>

          {role === "admin" && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setEditEventData(null); setOpenEventModal(true); }}
              className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-black font-[1000] uppercase tracking-widest text-xs shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:bg-[#F72585] hover:text-white transition-all"
            >
              <Plus size={18} strokeWidth={3} /> Add Node
            </motion.button>
          )}
        </header>

        {/* Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-10">
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input
              type="search"
              placeholder="SEARCH_REGISTRY..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border-2 border-white/5 rounded-2xl focus:border-[#4CC9F0]/50 outline-none text-xs font-black uppercase tracking-widest transition-all"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border-2 border-white/5 rounded-2xl focus:border-[#9155FD]/50 outline-none text-xs font-black uppercase tracking-widest transition-all appearance-none cursor-pointer"
            >
              <option value="name_asc" className="bg-black">Name ↑</option>
              <option value="name_desc" className="bg-black">Name ↓</option>
              <option value="price_asc" className="bg-black">Price ↑</option>
              <option value="price_desc" className="bg-black">Price ↓</option>
              <option value="recent" className="bg-black">Recent</option>
            </select>
          </div>
          <div className="flex items-center justify-end px-6 bg-white/[0.02] border-2 border-white/5 rounded-2xl">
            <div className="text-right">
              <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Active_Nodes</p>
              <p className="text-xl font-[1000] text-[#00FF41] leading-none">{events.length}</p>
            </div>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex flex-col items-center py-40">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-12 h-12 border-4 border-[#F72585] border-t-transparent rounded-full mb-4" />
            <p className="text-[10px] tracking-widest text-[#F72585] font-black animate-pulse">SYNCHRONIZING...</p>
          </div>
        ) : (
          <>
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {pageItems.map((ev) => (
                <EventCard
                  key={ev.id}
                  event={ev}
                  onAddConstraints={(id) => { setEventIdForConstraint(id); setConstraintIdToEdit(null); setOpenConstraintModal(true); }}
                  onEditConstraints={(cId, eId) => { setEventIdForConstraint(eId); setConstraintIdToEdit(cId); setOpenConstraintModal(true); }}
                  onAddDetails={(id) => { setEventIdForDetails(id); setDetailsIdToEdit(null); setOpenDetailsModal(true); }}
                  onEditDetails={(dId, eId) => { setEventIdForDetails(eId); setDetailsIdToEdit(dId); setOpenDetailsModal(true); }}
                  onAddOrganisers={(id) => { setEventIdForOrg(id); setCurrentOrgIds([]); setOpenOrgModal(true); }}
                  onEditOrganisers={(id, org) => { setEventIdForOrg(id); setCurrentOrgIds(org); setOpenOrgModal(true); }}
                  onOpenSlots={(id, name) => { setSlotsEventId(id); setSlotsEventName(name); setSlotsOpen(true); }}
                  onOpenAttendance={(id) => navigate(`/admin/checkin/${id}`)}
                  onDelete={fetchEvents}
                  onEditEvent={(obj) => { setEditEventData(obj); setOpenEventModal(true); }}
                />
              ))}
            </motion.div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-12 pt-8 border-t border-white/5">
              <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Sector_{page}_of_{pages}</span>
              <div className="flex gap-4">
                <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-6 py-2 border-2 border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all disabled:opacity-20">Prev</button>
                <button disabled={page >= pages} onClick={() => setPage(page + 1)} className="px-6 py-2 border-2 border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all disabled:opacity-20">Next</button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Standard Modals */}
      <EventModal open={openEventModal} onClose={() => { setOpenEventModal(false); setEditEventData(null); }} refreshEvents={fetchEvents} editEventData={editEventData} />
      <OrganiserModal open={openOrgModal} onClose={() => setOpenOrgModal(false)} eventId={eventIdForOrg} currentOrganiserIds={currentOrgIds} refreshEvents={fetchEvents} />
      <ParticipationConstraintModal open={openConstraintModal} onClose={() => { setOpenConstraintModal(false); setConstraintIdToEdit(null); }} eventId={eventIdForConstraint} constraintId={constraintIdToEdit} refreshEvents={fetchEvents} />
      <EventDetailsModal open={openDetailsModal} onClose={() => setOpenDetailsModal(false)} eventId={eventIdForDetails} detailsId={detailsIdToEdit} refreshEvents={fetchEvents} />
      <EventSlotsListModal open={slotsOpen} onClose={() => setSlotsOpen(false)} eventId={slotsEventId} eventName={slotsEventName} />

      {/* Futuristic Alert */}
      <AnimatePresence>
        {alert.open && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className={`fixed right-10 bottom-10 z-[100] px-8 py-5 rounded-2xl border-2 font-[1000] text-[11px] tracking-[0.3em] uppercase flex items-center gap-4 bg-black shadow-2xl ${ alert.tone === "error" ? "border-[#F72585] text-[#F72585]" : "border-[#00FF41] text-[#00FF41]" }`}>
            <div className={`w-2.5 h-2.5 rounded-full animate-ping ${alert.tone === "error" ? 'bg-[#F72585]' : 'bg-[#00FF41]'}`} />
            {alert.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}