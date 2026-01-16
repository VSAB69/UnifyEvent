// src/components/NavBar.jsx
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/useAuth";

import {
  Menu,
  LogOut,
  User,
  BookOpen,
  Layers,
  ShoppingCart,
  Home as HomeIcon,
  Ticket,
} from "lucide-react";

function getNavItems(user) {
  if (!user) return [];

  const shared = [
    { text: "Home", path: "/home", icon: <HomeIcon className="w-5 h-5" /> },
    {
      text: "Events",
      path: "/parent-events",
      icon: <BookOpen className="w-5 h-5" />,
    },
    {
      text: "My Bookings",
      path: "/my-bookings",
      icon: <Ticket className="w-5 h-5" />,
    },
    {
      text: "Cart",
      path: "/cart",
      icon: <ShoppingCart className="w-5 h-5" />,
    },
  ];

  if (user.role === "admin" || user.role === "organiser") {
    return [
      ...shared,
      {
        text: "Manage",
        path: "/events",
        icon: <Layers className="w-5 h-5" />,
      },
    ];
  }

  return shared;
}

export default function NavBar({ content }) {
  const { user, logoutUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);

  const isActive = (path) => location.pathname.startsWith(path);

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5FF]">
      {/* ───────── FLOATING NAVBAR ───────── */}
      <header className="fixed inset-x-0 top-4 z-50 px-4">
        <div className="max-w-7xl mx-auto">
          <div
            className="h-16 px-6 flex items-center justify-between
            rounded-2xl bg-white/80 backdrop-blur-xl
            shadow-lg border border-purple-100"
          >
            {/* LEFT */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setOpen(true)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <Menu className="w-6 h-6 text-gray-700" />
              </button>

              <Link to="/" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-lg">U</span>
                </div>
                <span className="text-lg font-bold text-gray-900">
                  Unify<span className="text-purple-600">Events</span>
                </span>
              </Link>
            </div>

            {/* CENTER NAV */}
            <nav className="hidden md:flex items-center gap-6">
              {getNavItems(user).map((item) => (
                <Link
                  key={item.text}
                  to={item.path}
                  className={`relative text-sm font-medium transition-colors
                    ${
                      isActive(item.path)
                        ? "text-purple-700"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                >
                  {item.text}

                  {isActive(item.path) && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2
                      w-1.5 h-1.5 bg-purple-600 rounded-full"
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* RIGHT */}
            <div className="hidden md:flex items-center gap-3">
              <Link to="/profile" className="p-2 rounded-lg hover:bg-gray-100">
                <User className="w-5 h-5 text-gray-700" />
              </Link>

              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl
                bg-gradient-to-r from-purple-600 to-pink-500
                text-white text-sm font-semibold shadow-md
                hover:opacity-90 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ───────── MOBILE DRAWER (UNCHANGED LOGIC) ───────── */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/40 z-40"
            />

            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 25 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl border-r"
            >
              <div className="p-4 border-b flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold">
                  U
                </div>
                <span className="text-gray-900 text-lg font-semibold">
                  UnifyEvents
                </span>
              </div>

              <ul className="p-3 space-y-1">
                {getNavItems(user).map((item) => (
                  <li key={item.text}>
                    <Link
                      to={item.path}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                        isActive(item.path)
                          ? "bg-purple-100 text-purple-700 font-medium"
                          : "text-gray-800 hover:bg-gray-100"
                      }`}
                    >
                      {item.icon}
                      {item.text}
                    </Link>
                  </li>
                ))}

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 text-red-600"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </ul>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ───────── MOBILE BOTTOM NAV (UNCHANGED) ───────── */}
      <nav className="md:hidden fixed bottom-4 inset-x-0 z-50 flex justify-center">
        <div className="bg-white shadow-2xl border border-gray-200 rounded-3xl px-6 py-3 flex items-center gap-8">
          {[HomeIcon, BookOpen, Ticket, ShoppingCart, User].map((Icon, i) => (
            <Icon key={i} className="w-6 h-6 text-gray-500" />
          ))}
        </div>
      </nav>

      {/* ───────── MAIN CONTENT ───────── */}
      <main className="flex-1 pt-24 pb-24 md:pb-0">{content}</main>
    </div>
  );
}
