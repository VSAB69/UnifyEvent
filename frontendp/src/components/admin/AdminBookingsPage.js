import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import EventService from "../admin/EventService";
import { Search, Users, Calendar } from "lucide-react";

const fade = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function AdminBookingsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("");

  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await EventService.getAllBookedEventsAdmin();
      setEvents(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /* ---------------- Filtering ---------------- */
  const filtered = events.filter((ev) => {
    const matchSearch =
      ev.event_name.toLowerCase().includes(search.toLowerCase()) ||
      ev.participants.some((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );

    const matchEvent = eventFilter ? ev.event === Number(eventFilter) : true;

    return matchSearch && matchEvent;
  });

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-6">
        Admin • All Event Bookings
      </h1>

      {/* ---------------- Search + Filter ---------------- */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="flex items-center bg-white shadow p-2 rounded-xl w-full md:w-1/2">
          <Search className="w-5 h-5 text-gray-400 mr-2" />
          <input
            placeholder="Search by event or participant..."
            className="flex-1 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={eventFilter}
          onChange={(e) => setEventFilter(e.target.value)}
          className="w-full md:w-1/4 bg-white shadow p-2 rounded-xl"
        >
          <option value="">All Events</option>
          {[
            ...new Set(
              events.map((e) => ({ id: e.event, name: e.event_name }))
            ),
          ].map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.name}
            </option>
          ))}
        </select>
      </div>

      {/* ---------------- Card List ---------------- */}
      {loading ? (
        <p className="text-gray-500">Loading bookings…</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500">No bookings found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((ev) => (
            <motion.div
              key={ev.id}
              variants={fade}
              initial="hidden"
              animate="show"
              className="bg-white shadow-lg rounded-2xl p-5 border border-gray-100 hover:border-purple-300 transition"
            >
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  {ev.event_name}
                </h2>

                <div className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-500" />
                  {ev.slot_info?.date} • {ev.slot_info?.start_time} –{" "}
                  {ev.slot_info?.end_time}
                </div>

                <div className="text-sm mt-1 flex items-center gap-2">
                  <Users className="w-4 h-4 text-pink-500" />
                  Team: {ev.participants_count}
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelected(ev)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition"
                >
                  View Details
                </button>

                <button
                  onClick={() =>
                    (window.location.href = `/admin/checkin/${ev.id}`)
                  }
                  className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition"
                >
                  Attendance
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ---------------- Modal ---------------- */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-6"
          >
            <h3 className="text-xl font-bold">{selected.event_name}</h3>

            <p className="mt-1 text-gray-700">
              Slot: {selected.slot_info.date} • {selected.slot_info.start_time}{" "}
              - {selected.slot_info.end_time}
            </p>

            <h4 className="mt-4 font-semibold">Participants</h4>

            <ul className="mt-3 space-y-2">
              {selected.participants.map((p) => (
                <li key={p.id} className="bg-gray-50 p-3 rounded-lg text-sm">
                  <p className="font-medium">{p.name}</p>
                  <p className="text-gray-500 text-xs">
                    {p.email || "No email"} • {p.phone_number || "No phone"}
                  </p>
                </li>
              ))}
            </ul>

            <button
              onClick={() => setSelected(null)}
              className="w-full bg-gray-200 mt-6 py-2 rounded-xl hover:bg-gray-300 transition"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
