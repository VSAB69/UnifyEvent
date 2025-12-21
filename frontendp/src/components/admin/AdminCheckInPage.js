import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import EventService from "../admin/EventService";
import { motion } from "framer-motion";
import { Search, Users, Calendar } from "lucide-react";

export default function AdminCheckInPage() {
  const { eventId } = useParams(); // 🔥 REQUIRED: filter bookings by event

  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [slotFilter, setSlotFilter] = useState("");
  const [teamSearch, setTeamSearch] = useState("");

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [editedParticipants, setEditedParticipants] = useState({});

  /* ------------ Load Booked Events ------------ */
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

  /* ------------ Filter only this event's bookings ------------ */
  const eventBookings = useMemo(
    () => allBookings.filter((b) => Number(b.event) === Number(eventId)),
    [allBookings, eventId]
  );

  /* ------------ Slot Options for this event only ------------ */
  const slotOptions = useMemo(() => {
    const map = new Map();
    eventBookings.forEach((b) => {
      if (b.slot && b.slot_info) {
        map.set(b.slot_info.id, {
          id: b.slot_info.id,
          label: `${b.slot_info.date} • ${b.slot_info.start_time} - ${b.slot_info.end_time}`,
        });
      }
    });
    return [...map.values()];
  }, [eventBookings]);

  /* ------------ Apply Filters ------------ */
  const filtered = eventBookings.filter((b) => {
    const matchSlot = slotFilter
      ? b.slot_info?.id === Number(slotFilter)
      : true;
    const matchTeam = b.participants[0]?.name
      ?.toLowerCase()
      .includes(teamSearch.toLowerCase());
    return matchSlot && matchTeam;
  });

  /* ------------ Toggle (UI only) ------------ */
  const toggleLocalAttendance = (p) => {
    setEditedParticipants((prev) => ({
      ...prev,
      [p.id]: {
        ...p,
        arrived: prev[p.id] ? !prev[p.id].arrived : !p.arrived,
      },
    }));
  };

  /* ------------ Save Only Changed Attendance ------------ */
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
        // Undo not supported by backend
      }
      alert("Attendance saved.");
      setEditedParticipants({});
      load();
      setSelectedBooking(null);
    } catch (err) {
      console.log(err);
      alert("Failed to save attendance.");
    }
  };

  /* ------------ UI ------------ */
  if (loading) return <p className="p-6">Loading bookings…</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-3">Attendance – Event #{eventId}</h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <select
          value={slotFilter}
          onChange={(e) => setSlotFilter(e.target.value)}
          className="p-3 bg-white shadow rounded-xl w-full md:w-1/3"
        >
          <option value="">All Slots</option>
          {slotOptions.map((slot) => (
            <option key={slot.id} value={slot.id}>
              {slot.label}
            </option>
          ))}
        </select>

        <div className="flex items-center bg-white shadow p-3 rounded-xl w-full md:w-1/2">
          <Search className="w-5 h-5 text-gray-400 mr-2" />
          <input
            placeholder="Search by team leader…"
            value={teamSearch}
            onChange={(e) => setTeamSearch(e.target.value)}
            className="flex-1 outline-none"
          />
        </div>
      </div>

      {/* Bookings List */}
      <div className="grid gap-4">
        {filtered.map((b) => (
          <motion.div
            key={b.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 bg-white shadow-md rounded-xl border flex justify-between"
          >
            <div>
              <h2 className="text-lg font-semibold">
                Team Leader: {b.participants[0]?.name}
              </h2>

              <p className="text-gray-500 text-sm flex items-center gap-2 mt-1">
                <Calendar className="w-4 h-4" />
                {b.slot_info?.date} • {b.slot_info?.start_time} -{" "}
                {b.slot_info?.end_time}
              </p>

              <p className="text-gray-500 text-sm flex items-center gap-2">
                <Users className="w-4 h-4" /> Members: {b.participants.length}
              </p>
            </div>

            <button
              onClick={() => {
                setSelectedBooking(b);
                setEditedParticipants({});
              }}
              className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
            >
              View
            </button>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl"
          >
            <h3 className="text-2xl font-bold mb-2">
              Team – {selectedBooking.participants[0]?.name}
            </h3>

            <p className="text-sm text-gray-600 mb-4">
              {selectedBooking.slot_info.date} •{" "}
              {selectedBooking.slot_info.start_time} -{" "}
              {selectedBooking.slot_info.end_time}
            </p>

            <div className="grid gap-4">
              {selectedBooking.participants.map((p) => {
                const local = editedParticipants[p.id];
                const arrived = local ? local.arrived : p.arrived;

                return (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl bg-white border border-gray-200 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold">{p.name}</p>
                      <p className="text-gray-500 text-xs">{p.email}</p>

                      {arrived ? (
                        <p className="text-xs text-green-600 mt-1">
                          Marked present
                        </p>
                      ) : (
                        <p className="text-xs text-red-500 mt-1">
                          Not checked-in
                        </p>
                      )}
                    </div>

                    <div
                      onClick={() => toggleLocalAttendance(p)}
                      className={`w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition ${
                        arrived ? "bg-green-500" : "bg-red-400"
                      }`}
                    >
                      <motion.div
                        layout
                        className="w-5 h-5 bg-white rounded-full shadow"
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                        style={{ marginLeft: arrived ? "28px" : "2px" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={saveAttendance}
              className="w-full mt-6 bg-purple-600 py-2 text-white rounded-xl hover:bg-purple-700"
            >
              Save Attendance
            </button>

            <button
              onClick={() => setSelectedBooking(null)}
              className="w-full mt-3 bg-gray-200 py-2 rounded-xl hover:bg-gray-300"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
