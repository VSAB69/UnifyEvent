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
  Calendar,
} from "lucide-react";

function getNavItems(user) {
  if (!user) return [];

  const shared = [
    { text: "Home", path: "/home", icon: <HomeIcon className="w-6 h-6" /> },
    {
      text: "Browse Events",
      path: "/parent-events",
      icon: <BookOpen className="w-6 h-6" />,
    },
    {
      text: "My Bookings",
      path: "/my-bookings",
      icon: <Ticket className="w-6 h-6" />,
    },
    {
      text: "Cart",
      path: "/cart",
      icon: <ShoppingCart className="w-6 h-6" />,
    },
  ];

  if (user.role === "admin" || user.role === "organiser") {
    return [
      ...shared,
      {
        text: "Manage Events",
        path: "/events",
        icon: <Layers className="w-6 h-6" />,
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

  const toggle = () => setOpen(!open);

  const isActive = (path) => location.pathname.startsWith(path);

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* TOP NAVBAR */}
      <header
        className="fixed inset-x-0 top-0 z-50 bg-white/90 backdrop-blur-md 
                         border-b border-purple-200 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* LEFT */}
            <div className="flex items-center gap-4">
              <button
                onClick={toggle}
                className="p-2 rounded-md hover:bg-gray-100 md:hidden"
              >
                <Menu className="w-6 h-6 text-gray-700" />
              </button>

              <Link to="/" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-purple-700 flex items-center justify-center shadow-md">
                  <span className="text-white text-xl font-bold">U</span>
                </div>
                <span className="text-gray-900 font-semibold text-lg">
                  UnifyEvents
                </span>
              </Link>
            </div>

            {/* DESKTOP NAV */}
            <nav className="hidden md:flex items-center gap-2">
              {getNavItems(user).map((item) => (
                <Link
                  to={item.path}
                  key={item.text}
                  className="relative px-4 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  {item.icon}
                  {item.text}

                  {isActive(item.path) && (
                    <motion.div
                      layoutId="navbar-underline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 rounded-full"
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* RIGHT ICONS */}
            <div className="hidden md:flex gap-3">
              <Link to="/profile" className="p-2 rounded-lg hover:bg-gray-100">
                <User className="w-6 h-6 text-purple-700" />
              </Link>

              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <LogOut className="w-6 h-6 text-red-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE DRAWER */}
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
                <div className="w-10 h-10 bg-purple-700 rounded-xl flex items-center justify-center text-white font-bold">
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
                  onClick={() => {
                    setOpen(false);
                    handleLogout();
                  }}
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

      {/* MOBILE BOTTOM NAVBAR */}
      <nav className="md:hidden fixed bottom-4 inset-x-0 z-50 flex justify-center">
        <div className="bg-white shadow-2xl border border-gray-200 rounded-3xl px-6 py-3 flex items-center gap-8">
          {[
            { icon: <HomeIcon />, path: "/home" },
            { icon: <BookOpen />, path: "/browse-events" },
            { icon: <Ticket />, path: "/my-bookings" },
            { icon: <ShoppingCart />, path: "/cart" },
            { icon: <User />, path: "/profile" },
          ].map((item, i) => {
            const active = isActive(item.path);

            return (
              <Link
                to={item.path}
                key={i}
                className="relative flex flex-col items-center"
              >
                <motion.div
                  animate={{
                    scale: active ? 1.25 : 1,
                    color: active ? "#7c3aed" : "#6b7280",
                  }}
                  className={`text-gray-500`}
                >
                  {React.cloneElement(item.icon, {
                    className: "w-6 h-6",
                  })}
                </motion.div>

                {active && (
                  <motion.div
                    layoutId="mobile-indicator"
                    className="absolute -bottom-1 w-2 h-2 bg-purple-600 rounded-full"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-1 pt-16 pb-24 md:pb-0">{content}</main>
    </div>
  );
}
