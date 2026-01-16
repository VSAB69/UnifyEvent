import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LogOut,
  Calendar,
  Ticket,
  ShoppingCart,
  User,
  Clock,
  ArrowRight,
  Star,
} from "lucide-react";

import { useAuth } from "../../context/useAuth";
import ParticipantService from "../participant/ParticipantService";

export const Home = () => {
  const { user, logoutUser } = useAuth();
  const username = user?.username || "User";

  const [recent, setRecent] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const rec = await ParticipantService.getMyBookings();
      setRecent(rec.data || []);

      const ev = await ParticipantService.getAllEvents();
      setEvents(ev.data || []);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8fc] relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute -top-40 -left-40 w-[420px] h-[420px] bg-purple-300 rounded-full blur-[140px] opacity-30" />
      <div className="absolute top-20 right-[-200px] w-[500px] h-[500px] bg-pink-300 rounded-full blur-[160px] opacity-30" />
      <div className="absolute bottom-[-200px] left-20 w-[420px] h-[420px] bg-indigo-300 rounded-full blur-[160px] opacity-25" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* ================= HEADER ================= */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-6 mb-14"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-xl">
            {username.charAt(0).toUpperCase()}
          </div>

          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              Welcome back, {username}
            </h1>
            <p className="text-gray-600 text-lg">
              Manage your events, bookings and profile from one place
            </p>
          </div>
        </motion.div>

        {/* ================= QUICK ACTIONS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-16">
          <DashboardCard
            title="Browse Events"
            icon={<Calendar />}
            link="/parent-events"
            tone="purple"
          />
          <DashboardCard
            title="My Cart"
            icon={<ShoppingCart />}
            link="/cart"
            tone="pink"
          />
          <DashboardCard
            title="My Bookings"
            icon={<Ticket />}
            link="/my-bookings"
            tone="fuchsia"
          />
          <DashboardCard
            title="My Profile"
            icon={<User />}
            link="/profile"
            tone="indigo"
          />
        </div>

        {/* ================= RECENT BOOKINGS ================= */}
        <SectionTitle title="Recent bookings" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16">
          {recent.length === 0 ? (
            <EmptyCard message="You haven’t made any bookings yet." />
          ) : (
            recent.slice(0, 4).map((b) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                className="rounded-2xl bg-white p-6 border border-gray-100 shadow-sm hover:shadow-lg transition"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-lg text-gray-900">
                    Booking #{b.id}
                  </h3>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                    {b.status?.toUpperCase() || "CONFIRMED"}
                  </span>
                </div>

                <p className="text-gray-600 text-sm">
                  Amount paid: ₹{Number(b.total_amount).toFixed(2)}
                </p>

                <div className="flex items-center gap-2 text-gray-500 text-sm mt-2">
                  <Clock className="w-4 h-4" />
                  {new Date(b.created_at).toLocaleString()}
                </div>

                <a
                  href="/my-bookings"
                  className="mt-4 inline-flex items-center gap-2 text-purple-600 font-semibold hover:text-purple-800 transition"
                >
                  View booking <ArrowRight className="w-4 h-4" />
                </a>
              </motion.div>
            ))
          )}
        </div>

        {/* ================= RECOMMENDED EVENTS ================= */}
        <SectionTitle title="Recommended events" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {events.length === 0 ? (
            <EmptyCard message="No events available right now." />
          ) : (
            events.slice(0, 6).map((ev) => (
              <motion.a
                key={ev.id}
                href={`/event/${ev.id}`}
                whileHover={{ y: -6 }}
                className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-lg transition flex flex-col gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Star className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {ev.name}
                  </h3>
                </div>

                <p className="text-gray-600 text-sm">
                  {Number(ev.price) === 0
                    ? "Free event"
                    : `Price: ₹${Number(ev.price).toFixed(2)}`}
                </p>
              </motion.a>
            ))
          )}
        </div>

        {/* ================= LOGOUT ================= */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={logoutUser}
          className="px-6 py-3 rounded-xl bg-white border border-red-200 text-red-600 hover:bg-red-50 transition shadow-sm flex items-center gap-2 font-semibold"
        >
          <LogOut className="w-5 h-5" />
          Log out
        </motion.button>
      </div>
    </div>
  );
};

/* ================= SMALL COMPONENTS ================= */

function DashboardCard({ title, icon, link, tone }) {
  const tones = {
    purple: "from-purple-600 to-indigo-600",
    pink: "from-pink-600 to-rose-600",
    fuchsia: "from-fuchsia-600 to-purple-600",
    indigo: "from-indigo-600 to-blue-600",
  };

  return (
    <motion.a
      href={link}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.97 }}
      className={`rounded-2xl p-6 bg-gradient-to-br ${tones[tone]} text-white shadow-lg flex flex-col gap-5`}
    >
      <div className="p-4 bg-white/20 rounded-2xl w-fit">
        {React.cloneElement(icon, { className: "w-7 h-7" })}
      </div>

      <div>
        <div className="text-2xl font-bold">{title}</div>
        <div className="text-sm opacity-90">Open →</div>
      </div>
    </motion.a>
  );
}

function SectionTitle({ title }) {
  return (
    <motion.h2
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-3xl font-bold text-gray-900 mb-6 tracking-tight"
    >
      {title}
    </motion.h2>
  );
}

function EmptyCard({ message }) {
  return (
    <div className="col-span-full text-gray-500 text-center py-12 text-lg">
      {message}
    </div>
  );
}
