import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import EventService from "../admin/EventService";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Users, Calendar, CheckCircle, X } from "lucide-react";

export default function AdminCheckInPage() {
  const { eventId } = useParams();

  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [slotFilter, setSlotFilter] = useState("");
  const [teamSearch, setTeamSearch] = useState("");

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [editedParticipants, setEditedParticipants] = useState({});

  /* ---------- SNACKBAR ---------- */
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "success", // success | error
  });

  const showSnackbar = (message, type = "success") => {
    setSnackbar({ open: true, message, type });
    setTimeout(() => {
      setSnackbar((s) => ({ ...s, open: false }));
    }, 2600);
  };

  /* ---------- LOAD ---------- */
  const load = async () => {
    setLoading(true);
    try {
      const res = await EventService.getAllBookedEventsAdmin();
      setAllBookings(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /* ---------- FILTER BY EVENT ---------- */
  const eventBookings = useMemo(
    () => allBookings.filter((b) => Number(b.event) === Number(eventId)),
    [allBookings, eventId]
  );

  /* ---------- SLOT OPTIONS ---------- */
  const slotOptions = useMemo(() => {
    const map = new Map();
    eventBookings.forEach((b) => {
      if (b.slot_info) {
        map.set(b.slot_info.id, {
          id: b.slot_info.id,
          label: `${b.slot_info.date} • ${b.slot_info.start_time} - ${b.slot_info.end_time}`,
        });
      }
    });
    return [...map.values()];
  }, [eventBookings]);

  /* ---------- APPLY FILTERS ---------- */
  const filtered = eventBookings.filter((b) => {
    const matchSlot = slotFilter
      ? b.slot_info?.id === Number(slotFilter)
      : true;
    const matchTeam = b.participants[0]?.name
      ?.toLowerCase()
      .includes(teamSearch.toLowerCase());
    return matchSlot && matchTeam;
  });

  /* ---------- LOCAL TOGGLE ---------- */
  const toggleLocalAttendance = (p) => {
    setEditedParticipants((prev) => ({
      ...prev,
      [p.id]: {
        ...p,
        arrived: prev[p.id] ? !prev[p.id].arrived : !p.arrived,
      },
    }));
  };

  /* ---------- SAVE ---------- */
  const saveAttendance = async () => {
    const changed = Object.values(editedParticipants).filter((local) => {
      const original = selectedBooking.participants.find(
        (x) => x.id === local.id
      );
      return original.arrived !== local.arrived;
    });

    try {
      for (let p of changed) {
        if (p.arrived) await EventService.checkInParticipant(p.id);
      }

      showSnackbar("Attendance saved successfully");
      setEditedParticipants({});
      load();
      setSelectedBooking(null);
    } catch {
      showSnackbar("Failed to save attendance", "error");
    }
  };

  if (loading) return <p className="p-6">Loading…</p>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* ---------- HEADER ---------- */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900">Event Attendance</h1>
        <p className="text-gray-500 mt-1">
          Check-in participants for Event #{eventId}
        </p>
      </motion.div>

      {/* ---------- FILTER BAR ---------- */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <select
          value={slotFilter}
          onChange={(e) => setSlotFilter(e.target.value)}
          className="px-4 py-3 rounded-xl border border-gray-300 bg-white w-full lg:w-1/3"
        >
          <option value="">All Slots</option>
          {slotOptions.map((slot) => (
            <option key={slot.id} value={slot.id}>
              {slot.label}
            </option>
          ))}
        </select>

        <div className="flex items-center px-4 py-3 rounded-xl border border-gray-300 bg-white w-full lg:w-1/2">
          <Search className="w-5 h-5 text-gray-400 mr-2" />
          <input
            placeholder="Search by team leader"
            value={teamSearch}
            onChange={(e) => setTeamSearch(e.target.value)}
            className="flex-1 outline-none"
          />
        </div>
      </div>

      {/* ---------- BOOKINGS ---------- */}
      <div className="grid gap-4">
        {filtered.map((b) => (
          <motion.div
            key={b.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            className="bg-white rounded-2xl border border-gray-200 p-5 flex justify-between items-center"
          >
            <div>
              <h2 className="font-semibold text-lg">
                {b.participants[0]?.name}
              </h2>

              <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {b.slot_info?.date}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {b.participants.length} members
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedBooking(b);
                setEditedParticipants({});
              }}
              className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700"
            >
              View Team
            </button>
          </motion.div>
        ))}
      </div>

      {/* ---------- MODAL ---------- */}
      <AnimatePresence>
        {selectedBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-2xl p-6 shadow-xl"
            >
              <h3 className="text-2xl font-bold mb-1">Team Attendance</h3>

              <div className="space-y-3 mt-6">
                {selectedBooking.participants.map((p) => {
                  const local = editedParticipants[p.id];
                  const arrived = local ? local.arrived : p.arrived;

                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-4 border rounded-xl"
                    >
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-gray-500">{p.email}</p>
                      </div>

                      <div
                        onClick={() => toggleLocalAttendance(p)}
                        className={`w-16 h-8 flex items-center rounded-full p-1 cursor-pointer transition ${
                          arrived ? "bg-green-500" : "bg-gray-300"
                        }`}
                      >
                        <motion.div
                          layout
                          className="w-6 h-6 bg-white rounded-full shadow"
                          style={{
                            marginLeft: arrived ? "32px" : "2px",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={saveAttendance}
                className="w-full mt-6 py-3 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Save Attendance
              </button>

              <button
                onClick={() => setSelectedBooking(null)}
                className="w-full mt-3 py-2 rounded-xl border border-gray-300 hover:bg-gray-100"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------- SNACKBAR ---------- */}
      <AnimatePresence>
        {snackbar.open && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 right-6 z-[100] px-5 py-3 rounded-xl shadow-xl text-white flex items-center gap-3 ${
              snackbar.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            <span className="text-sm font-medium">{snackbar.message}</span>
            <button onClick={() => setSnackbar({ ...snackbar, open: false })}>
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
