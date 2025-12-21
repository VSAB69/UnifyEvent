// src/components/admin/EventGrid.jsx
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

import { useAuth } from "../../context/useAuth";
import { useNavigate } from "react-router-dom";

import EventCard from "./EventCard";
import EventService from "./EventService";

import EventModal from "./modals/EventModal";
import OrganiserModal from "./modals/OrganiserModal";
import ParticipationConstraintModal from "./modals/ParticipationConstraintModal";
import EventDetailsModal from "./modals/EventDetailsModal";
import EventSlotsListModal from "./modals/EventSlotsModal";

/* ---------------- Animation Variants ---------------- */
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

/* ======================================================
   MAIN COMPONENT
====================================================== */
export default function EventGrid() {
  const { user } = useAuth();
  const navigate = useNavigate(); // ⭐ FIXED — NOW VALID
  const role = user?.role;

  /* ---------------- State ---------------- */
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name_asc");

  // pagination
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 9;

  // modals
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

  // alerts
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    tone: "success",
  });

  /* ---------------- Load Events ---------------- */
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await EventService.getAllEvents();
      setEvents(res.data || []);
    } catch (err) {
      setAlert({
        open: true,
        message: "Failed to load events.",
        tone: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Search + Sort Logic ---------------- */
  const filtered = useMemo(() => {
    let list = [...events];
    const q = search.toLowerCase();

    if (q) {
      list = list.filter(
        (e) =>
          (e.name || "").toLowerCase().includes(q) ||
          (e.parent_committee || "").toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case "name_asc":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name_desc":
        list.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "price_asc":
        list.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case "price_desc":
        list.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case "recent":
        list.sort(
          (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
        );
        break;
      default:
        break;
    }

    return list;
  }, [events, search, sortBy]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* ---------------- Modal Helper Functions ---------------- */
  const openSlots = (id, name) => {
    setSlotsEventId(id);
    setSlotsEventName(name);
    setSlotsOpen(true);
  };

  const openOrg = (eventId, orgIds = []) => {
    setEventIdForOrg(eventId);
    setCurrentOrgIds(orgIds);
    setOpenOrgModal(true);
  };

  const openConstraint = (eventId, constraintId = null) => {
    setEventIdForConstraint(eventId);
    setConstraintIdToEdit(constraintId);
    setOpenConstraintModal(true);
  };

  const openDetails = (detailsId, eventId) => {
    setDetailsIdToEdit(detailsId);
    setEventIdForDetails(eventId);
    setOpenDetailsModal(true);
  };

  /* ======================================================
      RENDER
  ====================================================== */
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* ---------- Header ---------- */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            🎉 College Events
          </h1>
          <p className="text-gray-500 text-sm">
            Manage events — slots, organisers, attendance, constraints &
            details.
          </p>
        </div>

        {role === "admin" && (
          <button
            onClick={() => {
              setEditEventData(null);
              setOpenEventModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg hover:scale-105 transition"
          >
            <Plus className="w-4 h-4" />
            Add Event
          </button>
        )}
      </div>

      {/* ---------- Filters ---------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-6">
        <div className="lg:col-span-2 flex gap-3">
          <input
            type="search"
            placeholder="Search events or committee…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="flex-1 px-3 py-2 rounded-md border border-gray-200 focus:ring-2 focus:ring-purple-300"
          />

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-md border border-gray-200 bg-white focus:ring-2 focus:ring-purple-300"
          >
            <option value="name_asc">Name ↑</option>
            <option value="name_desc">Name ↓</option>
            <option value="price_asc">Price ↑</option>
            <option value="price_desc">Price ↓</option>
            <option value="recent">Most Recent</option>
          </select>
        </div>

        <div className="text-right">
          <p className="text-gray-500 text-sm">Total Events</p>
          <p className="text-lg font-semibold">{events.length}</p>
        </div>
      </div>

      {/* ---------- Grid ---------- */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-10 h-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <h2 className="text-lg font-bold text-gray-700">No events found</h2>
          <p className="text-gray-500 mt-1">Try adjusting your filters.</p>
        </div>
      ) : (
        <>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {pageItems.map((ev) => (
              <motion.div key={ev.id} variants={itemVariants}>
                <EventCard
                  event={ev}
                  role={role}
                  onAddConstraints={(id) => openConstraint(id)}
                  onEditConstraints={(cId, eId) => openConstraint(eId, cId)}
                  onAddDetails={(id) => openDetails(null, id)}
                  onEditDetails={(dId, eId) => openDetails(dId, eId)}
                  onAddOrganisers={(id) => openOrg(id)}
                  onEditOrganisers={(id, org) => openOrg(id, org)}
                  onOpenSlots={(id, name) => openSlots(id, name)}
                  /* ⭐ Check-In / Attendance Page ⭐ */
                  onOpenAttendance={(id) => navigate(`/admin/checkin/${id}`)}
                  onDelete={fetchEvents}
                  onEditEvent={(obj) => {
                    setEditEventData(obj);
                    setOpenEventModal(true);
                  }}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* ---------- Pagination ---------- */}
          <div className="flex justify-between items-center mt-6">
            <div className="text-gray-600 text-sm">
              Showing {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </div>

            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 border rounded disabled:opacity-40"
              >
                Prev
              </button>
              <span>
                Page {page} / {pages}
              </span>
              <button
                disabled={page >= pages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 border rounded disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* ---------- Modals ---------- */}
      <EventModal
        open={openEventModal}
        onClose={() => {
          setOpenEventModal(false);
          setEditEventData(null);
        }}
        refreshEvents={fetchEvents}
        editEventData={editEventData}
      />

      <OrganiserModal
        open={openOrgModal}
        onClose={() => setOpenOrgModal(false)}
        eventId={eventIdForOrg}
        currentOrganiserIds={currentOrgIds}
        refreshEvents={fetchEvents}
      />

      <ParticipationConstraintModal
        open={openConstraintModal}
        onClose={() => {
          setOpenConstraintModal(false);
          setConstraintIdToEdit(null);
        }}
        eventId={eventIdForConstraint}
        constraintId={constraintIdToEdit}
        refreshEvents={fetchEvents}
      />

      <EventDetailsModal
        open={openDetailsModal}
        onClose={() => setOpenDetailsModal(false)}
        eventId={eventIdForDetails}
        detailsId={detailsIdToEdit}
        refreshEvents={fetchEvents}
      />

      <EventSlotsListModal
        open={slotsOpen}
        onClose={() => setSlotsOpen(false)}
        eventId={slotsEventId}
        eventName={slotsEventName}
      />

      {/* ---------- Toast ---------- */}
      {alert.open && (
        <div
          className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg ${
            alert.tone === "error"
              ? "bg-red-50 text-red-700"
              : "bg-white text-gray-800"
          }`}
        >
          {alert.message}
          <button
            className="ml-3 text-xs underline"
            onClick={() =>
              setAlert({ open: false, message: "", tone: "success" })
            }
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
