import React, { useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/useAuth";
import LogoutConfirmModal from "./modals/LogoutConfirmModal";

import {
  Menu,
  LogOut,
  User,
  BookOpen,
  Layers,
  ShoppingCart,
  Home as HomeIcon,
  Ticket,
  Search,
  X,
  Activity,
  ShieldAlert,
  Power
} from "lucide-react";

function getNavItems(user) {
  if (!user) return [];
  const shared = [
    { text: "HOME", path: "/home", icon: <HomeIcon className="w-4 h-4" /> },
    { text: "EVENTS", path: "/parent-events", icon: <BookOpen className="w-4 h-4" /> },
    { text: "MY BOOKINGS", path: "/my-bookings", icon: <Ticket className="w-4 h-4" /> },
  ];
  if (user.role === "admin" || user.role === "organiser") {
    shared.push({ text: "ADMIN", path: "/events", icon: <Layers className="w-4 h-4" /> });
  }
  return shared;
}

export default function NavBar({ content }) {
  const { user, logoutUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const isActive = useCallback((path) => location.pathname === path, [location.pathname]);

  const handleLogoutConfirm = async () => {
    setLogoutModalOpen(false);
    await logoutUser();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-white font-sans selection:bg-[#F72585]/30 overflow-x-hidden">
      
      {/* ───────── NEXUS TOP HUD ───────── */}
      <header className="fixed inset-x-0 top-0 z-[100] bg-black/60 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 h-16 sm:h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-4 lg:gap-12">
            <Link to="/" className="flex flex-col group shrink-0">
              <span className="text-lg sm:text-xl font-black tracking-tighter uppercase leading-none">
                Unify<span className="text-[#F72585]">.</span>
              </span>
              <span className="text-[7px] sm:text-[8px] font-black tracking-[0.4em] text-white/20 uppercase">Nexus_Global</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {getNavItems(user).map((item) => (
                <Link
                  key={item.text}
                  to={item.path}
                  className={`px-4 xl:px-6 py-2 rounded-full text-[10px] font-black tracking-[0.2em] transition-all relative
                    ${isActive(item.path) ? "text-[#F72585]" : "text-white/40 hover:text-white"}`}
                >
                  {item.text}
                  {isActive(item.path) && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-[#F72585]/5 border border-[#F72585]/20 rounded-full -z-10"
                    />
                  )}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-6">
            <div className="hidden xl:flex items-center gap-3 bg-white/5 border border-white/5 rounded-xl px-4 py-2 w-64 focus-within:border-[#F72585]/40 transition-all">
              <Search className="w-3.5 h-3.5 text-white/20" />
              <input 
                type="text" 
                placeholder="SEARCH_DB..." 
                className="bg-transparent border-none outline-none text-[10px] font-bold text-white placeholder:text-white/10 w-full tracking-widest"
              />
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link to="/cart" className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 hover:bg-[#F72585]/10 hover:border-[#F72585]/40 transition-all group">
                <ShoppingCart className="w-4 h-4 text-white/40 group-hover:text-[#F72585]" />
              </Link>

              <div className="h-6 w-px bg-white/10 mx-1 hidden sm:block" />

              <Link 
                to="/profile" 
                className="flex items-center gap-2 sm:gap-3 px-2 py-1 sm:py-1.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 transition-all"
              >
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-br from-[#7209B7] to-[#F72585] flex items-center justify-center shadow-lg shadow-[#F72585]/20">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                </div>
                <div className="hidden sm:block text-left leading-none">
                    <p className="text-[10px] font-bold uppercase tracking-tighter truncate max-w-[80px]">{user?.username || "Guest"}</p>
                </div>
              </Link>

              <button 
                onClick={() => setLogoutModalOpen(true)}
                className="hidden md:flex items-center gap-2 h-9 sm:h-10 px-4 rounded-xl bg-white/5 border border-white/5 hover:bg-red-500/10 hover:border-red-500/40 transition-all group"
              >
                <Power className="w-4 h-4 text-white/40 group-hover:text-red-500" />
                <span className="text-[9px] font-[1000] uppercase tracking-widest text-white/40 group-hover:text-red-500">Exit</span>
              </button>

              <button
                onClick={() => setOpen(true)}
                className="lg:hidden w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/5"
              >
                <Menu className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MODAL INTEGRATION */}
      <LogoutConfirmModal 
        open={logoutModalOpen} 
        onClose={() => setLogoutModalOpen(false)} 
        onConfirm={handleLogoutConfirm} 
      />

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-md z-[110]"
            />

            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-[120] w-[280px] sm:w-80 bg-[#0a0a0a] border-l border-white/5 p-6 sm:p-10 flex flex-col"
            >
              <div className="flex justify-between items-center mb-12 sm:mb-16">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="text-[#F72585]" size={14} />
                  <span className="text-[9px] font-black tracking-[0.4em] uppercase">Navigation</span>
                </div>
                <button onClick={() => setOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                   <X size={16} />
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {getNavItems(user).map((item) => (
                  <Link
                    key={item.text}
                    to={item.path}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      isActive(item.path) 
                        ? "bg-[#F72585]/10 border-[#F72585]/40 text-white" 
                        : "bg-white/5 border-transparent text-white/40 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-4 text-[10px] sm:text-[11px] font-black tracking-[0.2em] sm:tracking-[0.3em] uppercase">
                      {item.icon}
                      {item.text}
                    </div>
                    {isActive(item.path) && <Activity size={14} className="text-[#F72585] animate-pulse" />}
                  </Link>
                ))}
              </div>

              <div className="mt-auto pt-10 border-t border-white/5">
                <button
                  onClick={() => {
                    setOpen(false);
                    setLogoutModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-white text-black text-[10px] sm:text-[11px] font-black tracking-[0.3em] sm:tracking-[0.4em] uppercase hover:bg-red-500 hover:text-white transition-all shadow-xl"
                >
                  <LogOut size={16} />
                  Disconnect
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 pt-16 sm:pt-20 relative">
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-[-5%] right-[-5%] w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-[#7209B7]/5 blur-[80px] sm:blur-[150px] rounded-full" />
          <div className="absolute bottom-[5%] left-[-5%] w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-[#F72585]/5 blur-[80px] sm:blur-[150px] rounded-full" />
        </div>
        
        {content}
      </main>

      <style>{`
        ::-webkit-scrollbar { display: none; }
        input::placeholder { color: rgba(255,255,255,0.1); }
      `}</style>
    </div>
  );
}
