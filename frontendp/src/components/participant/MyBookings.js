// src/components/participant/MyBookings.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Ticket,
  Calendar,
  CreditCard,
  ChevronRight,
  Users,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ParticipantService from "./ParticipantService";

export default function MyBookings() {
  const nav = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await ParticipantService.getMyBookings();
      setBookings(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  };

  const card = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* PAGE HEADER */}
      <motion.h1
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl sm:text-4xl font-extrabold mb-6 text-purple-800"
      >
        My Bookings
      </motion.h1>

      {/* LOADING */}
      {loading && (
        <div className="text-gray-600 text-lg animate-pulse">Loading…</div>
      )}

      {/* EMPTY */}
      {!loading && bookings.length === 0 && (
        <div className="text-gray-500 text-lg">No bookings yet.</div>
      )}

      {/* BOOKINGS LIST */}
      {!loading && bookings.length > 0 && (
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {bookings.map((b) => (
            <motion.div
              variants={card}
              key={b.id}
              className="rounded-2xl bg-white shadow-md border border-purple-200 p-6 hover:shadow-lg transition"
            >
              {/* TOP BAR */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Ticket className="w-6 h-6 text-purple-700" />
                  <div className="text-xl font-bold text-gray-900">
                    Booking #{b.id}
                  </div>
                </div>

                {/* DETAILS ROW */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-700" />
                    {new Date(b.created_at).toLocaleString()}
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      b.status === "cancelled"
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {b.status?.toUpperCase() || "CONFIRMED"}
                  </span>

                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-purple-700" />
                    Total:{" "}
                    <span className="font-semibold text-gray-900">
                      ₹{Number(b.total_amount || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* DIVIDER */}
              <div className="border-t border-purple-200 my-4" />

              {/* EVENTS INSIDE BOOKING */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {b.booked_events.map((be) => (
                  <motion.div
                    key={be.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-purple-50 border border-purple-200 rounded-xl shadow-sm p-4"
                  >
                    <div className="text-lg font-semibold text-purple-800">
                      {be.event_name}
                    </div>

                    <div className="text-gray-700 text-sm mt-1 flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-700" />
                      Team size:{" "}
                      <span className="font-semibold">
                        {be.participants_count}
                      </span>
                    </div>

                    <div className="text-gray-700 text-sm mt-1">
                      Cost:{" "}
                      <span className="font-semibold text-gray-900">
                        ₹ {Number(be.line_total || 0).toFixed(2)}
                      </span>
                    </div>

                    <div className="text-gray-600 text-xs mt-2 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-600" />
                      Slot #{be.slot} — {be.slot_info?.date} •{" "}
                      {be.slot_info?.start_time} – {be.slot_info?.end_time}
                    </div>

                    <button
                      onClick={() => nav(`/ticket/${be.id}`)}
                      className="mt-3 px-4 py-2 w-full rounded-lg bg-purple-700 text-white text-sm font-semibold hover:bg-purple-800 transition flex items-center justify-center gap-2"
                    >
                      View Ticket
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
