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

  const handleLogout = async () => {
    await logoutUser();
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Soft Color Blobs */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-purple-200 rounded-full blur-3xl opacity-40 translate-x-[-40%] translate-y-[-30%]" />
      <div className="absolute top-20 right-0 w-96 h-96 bg-pink-200 rounded-full blur-3xl opacity-40 translate-x-[20%]" />
      <div className="absolute bottom-0 left-20 w-72 h-72 bg-indigo-200 rounded-full blur-3xl opacity-40 translate-y-[20%]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        {/* --------------------------------------------------------
             PROFILE SECTION
        --------------------------------------------------------- */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-10"
        >
          <div className="w-16 h-16 rounded-full bg-purple-700 flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-purple-300/40">
            {username.charAt(0).toUpperCase()}
          </div>

          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              Welcome, {username} 👋
            </h1>
            <p className="text-gray-600 text-lg">
              Here’s your personalized dashboard.
            </p>
          </div>
        </motion.div>

        {/* --------------------------------------------------------
             QUICK ACTION CARDS
        --------------------------------------------------------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-14">
          <DashboardCard
            title="Browse Events"
            icon={<Calendar />}
            link="/browse-events"
            color="purple"
          />
          <DashboardCard
            title="My Cart"
            icon={<ShoppingCart />}
            link="/cart"
            color="pink"
          />
          <DashboardCard
            title="My Bookings"
            icon={<Ticket />}
            link="/my-bookings"
            color="fuchsia"
          />
          <DashboardCard
            title="My Profile"
            icon={<User />}
            link="/profile"
            color="indigo"
          />
        </div>

        {/* --------------------------------------------------------
             RECENT BOOKINGS
        --------------------------------------------------------- */}
        <SectionTitle title="Recent Bookings" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-14">
          {recent.length === 0 ? (
            <EmptyCard message="No recent bookings found." />
          ) : (
            recent.slice(0, 4).map((b) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                className="rounded-2xl p-6 bg-white shadow-lg border border-purple-100 hover:shadow-xl transition-all"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-xl text-gray-800">
                    Booking #{b.id}
                  </h3>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                    {b.status?.toUpperCase() || "CONFIRMED"}
                  </span>
                </div>

                <p className="text-gray-600 text-sm">
                  Total Paid: ₹{Number(b.total_amount).toFixed(2)}
                </p>

                <div className="flex items-center gap-2 text-gray-500 text-sm mt-2">
                  <Clock className="w-4 h-4" />
                  {new Date(b.created_at).toLocaleString()}
                </div>

                <a
                  href="/my-bookings"
                  className="mt-4 inline-flex items-center gap-2 text-purple-700 font-semibold hover:text-purple-900 transition"
                >
                  View Details <ArrowRight className="w-4 h-4" />
                </a>
              </motion.div>
            ))
          )}
        </div>

        {/* --------------------------------------------------------
             RECOMMENDED EVENTS
        --------------------------------------------------------- */}
        <SectionTitle title="Recommended For You" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
          {events.length === 0 ? (
            <EmptyCard message="No events available at the moment." />
          ) : (
            events.slice(0, 6).map((ev) => (
              <motion.a
                key={ev.id}
                href={`/event/${ev.id}`}
                whileHover={{ scale: 1.03, y: -4 }}
                className="bg-white rounded-2xl border border-purple-100 shadow-md p-6 flex flex-col gap-4 hover:shadow-xl transition relative overflow-hidden"
              >
                {/* Corner Decoration */}
                <div className="absolute right-0 bottom-0 w-24 h-24 bg-fuchsia-200 rounded-tl-full opacity-20 translate-x-1/3 translate-y-1/3"></div>

                <div className="flex items-center gap-3">
                  <Star className="w-7 h-7 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    {ev.name}
                  </h3>
                </div>

                <p className="text-gray-600 text-sm">
                  Price: ₹{Number(ev.price).toFixed(2)}
                </p>
              </motion.a>
            ))
          )}
        </div>

        {/* --------------------------------------------------------
             LOGOUT BUTTON
        --------------------------------------------------------- */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleLogout}
          className="px-6 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 transition shadow-md flex items-center gap-2 font-semibold"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </motion.button>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------
   SMALL COMPONENTS
---------------------------------------------------------- */

function DashboardCard({ title, icon, link, color }) {
  const colorStyles = {
    purple: "bg-purple-600 text-white shadow-purple-300/40",
    pink: "bg-pink-600 text-white shadow-pink-300/40",
    fuchsia: "bg-fuchsia-600 text-white shadow-fuchsia-300/40",
    indigo: "bg-indigo-600 text-white shadow-indigo-300/40",
  };

  return (
    <motion.a
      href={link}
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.97 }}
      className={`rounded-2xl p-6 shadow-xl border border-white/20 ${colorStyles[color]} transition relative overflow-hidden cursor-pointer flex flex-col gap-5`}
    >
      <div className="p-4 bg-white/20 rounded-2xl w-fit backdrop-blur-sm shadow-inner">
        {React.cloneElement(icon, {
          className: "w-8 h-8",
        })}
      </div>

      <div>
        <div className="text-2xl font-bold">{title}</div>
        <div className="text-sm opacity-90">Tap to open →</div>
      </div>

      {/* Decorative Corners */}
      <div className="absolute right-0 bottom-0 w-20 h-20 bg-white/20 rounded-tl-full opacity-40 translate-x-1/3 translate-y-1/3" />
      <div className="absolute left-0 top-0 w-16 h-16 bg-black/10 rounded-br-full opacity-20 translate-x-[-30%] translate-y-[-30%]" />
    </motion.a>
  );
}

function SectionTitle({ title }) {
  return (
    <motion.h2
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-3xl font-bold text-gray-900 mb-6 tracking-tight"
    >
      {title}
    </motion.h2>
  );
}

function EmptyCard({ message }) {
  return (
    <div className="col-span-full text-gray-500 text-center py-10 text-lg opacity-70">
      {message}
    </div>
  );
}
