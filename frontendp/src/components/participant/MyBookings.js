import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Fingerprint,
  Loader2,
  ShieldCheck,
  Ticket,
  Users,
  Hash,
  Clock,
  ExternalLink,
  Activity
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

  useEffect(() => { load(); }, []);

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white font-sans selection:bg-[#F72585] relative overflow-x-hidden">

      {/* --- INDUSTRIAL BACKGROUND --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#1a101a_0%,#050505_100%)] opacity-60" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:50px_50px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] z-50 pointer-events-none bg-[length:100%_4px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-10 py-12 sm:py-24">

        {/* --- REINFORCED HEADER (ONE LINE) --- */}
        <header className="mb-32">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-[3px] w-16 bg-[#F72585]" />
            <p className="text-xs font-black tracking-[0.8em] text-[#F72585] uppercase italic">
              Terminal_Inventory_Access // 2026
            </p>
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-[80px] font-[1000] uppercase tracking-tighter leading-none">
            MY <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F72585] via-[#9155FD] to-[#4CC9F0] italic">INVENTORY</span>
          </h1>
        </header>

        <AnimatePresence mode="wait">
          {loading ? (
            <div className="h-96 flex flex-col items-center justify-center gap-6">
              <Loader2 className="animate-spin text-[#F72585]" size={64} />
              <span className="text-xs font-black tracking-[1.5em] uppercase text-white/20">Establishing_Link...</span>
            </div>
          ) : (
            <div className="space-y-48">
              {bookings.map((b, bIdx) => (
                <motion.section
                  key={b.id}
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="relative group"
                >
                  {/* BACKGROUND INDEX */}
                  <span className="absolute -top-24 -left-12 text-[240px] font-[1000] text-white/[0.02] select-none pointer-events-none leading-none">
                    0{bIdx + 1}
                  </span>

                  {/* DATA WRAPPER BOX */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border-2 border-white/10 bg-[#080808]/95 rounded-3xl md:rounded-[50px] overflow-hidden shadow-[0_60px_120px_rgba(0,0,0,0.9)]">

                    {/* SIDEBAR: SYSTEM SPECS */}
                    <div className="col-span-12 lg:col-span-4 p-6 sm:p-14 border-b lg:border-b-0 lg:border-r-2 border-white/10 flex flex-col justify-between bg-white/[0.01]">
                      <div className="space-y-16">
                        <div className="flex items-center gap-6">
                          <div className="p-4 bg-[#F72585] rounded-2xl shadow-[0_0_25px_rgba(247,37,133,0.5)]">
                            <Fingerprint size={32} className="text-black" />
                          </div>
                          <div>
                            <p className="text-xs font-black opacity-30 uppercase tracking-[0.5em] mb-1">Packet_Registry</p>
                            <h3 className="text-4xl font-[1000] uppercase tracking-tighter">#TXN-{b.id}</h3>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-y-12 gap-x-8">
                          <SpecItem icon={<Calendar />} label="Cycle" value={new Date(b.created_at).toLocaleDateString()} />
                          <SpecItem icon={<Clock />} label="Auth" value={new Date(b.created_at).toLocaleTimeString()} />
                          <SpecItem icon={<Hash />} label="Nodes" value={b.booked_events.length} />
                          <div className="px-5 py-2 border-2 border-[#9DFF00]/40 bg-[#9DFF00]/5 rounded-xl w-fit flex items-center gap-3">
                            <ShieldCheck size={16} className="text-[#9DFF00]" />
                            <span className="text-xs font-black text-[#9DFF00] uppercase tracking-widest">Confirmed</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-16 pt-12 border-t border-white/10 flex flex-col gap-2">
                        <span className="text-xs font-black opacity-30 uppercase tracking-[0.6em]">Transfer_Value</span>
                        <span className="text-6xl font-[1000] text-[#4CC9F0] tracking-tighter leading-none">
                          ₮{b.total_amount || b.line_total}
                        </span>
                      </div>
                    </div>

                    {/* MAIN: PERMIT CELLS */}
                    <div className="col-span-12 lg:col-span-8 p-6 lg:p-16 bg-black/40">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {b.booked_events.map((be) => (
                          <motion.div
                            key={be.id}
                            whileHover={{ scale: 1.05, borderColor: "rgba(247,37,133,0.6)" }}
                            onClick={() => nav(`/ticket/${be.id}`)}
                            className="group/cell cursor-pointer bg-[#111] border-2 border-white/5 rounded-[35px] overflow-hidden flex transition-all shadow-3xl"
                          >
                            <div className="p-6 md:p-10 flex-1 flex flex-col justify-between min-h-[220px] relative">
                              <div className="absolute inset-0 bg-gradient-to-br from-[#F72585]/10 to-transparent opacity-0 group-hover/cell:opacity-100 transition-opacity" />

                              <div className="relative z-10 space-y-2 sm:space-y-6">
                                <div className="flex items-center gap-3">
                                  <Ticket size={16} className="text-[#F72585]" />
                                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em] sm:tracking-[0.6em] text-white/40">Access_Key</span>
                                </div>
                                <h4 className="text-xl sm:text-2xl md:text-4xl font-[1000] uppercase tracking-tighter leading-[0.9] group-hover/cell:text-[#F72585] transition-colors italic">
                                  {be.event_name}
                                </h4>
                              </div>

                              <div className="relative z-10 space-y-3 opacity-50 mt-4">
                                <div className="flex items-center gap-3 text-[10px] sm:text-xs font-black uppercase tracking-widest">
                                  <Users size={12} className="text-[#F72585]" /> Unit: 0{be.participants_count}
                                </div>
                              </div>
                            </div>

                            <div className="w-16 sm:w-20 border-l-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-4 sm:gap-8 group-hover/cell:bg-[#F72585]/20 transition-all">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white/10 flex items-center justify-center bg-white/5 group-hover/cell:border-[#F72585] group-hover/cell:rotate-45 transition-all">
                                <ExternalLink size={16} className="text-white group-hover/cell:text-[#F72585]" />
                              </div>
                              <span className="[writing-mode:vertical-lr] text-[8px] sm:text-[10px] font-[1000] uppercase tracking-[0.4em] sm:tracking-[0.6em] opacity-20 group-hover/cell:opacity-100 transition-opacity">
                                OPEN_CELL
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.section>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* --- SYSTEM FOOTER --- */}
        <footer className="mt-64 pt-16 border-t-2 border-white/5 flex flex-col md:flex-row justify-between items-center opacity-30 gap-10">
          <div className="flex items-center gap-6 text-xs font-black tracking-[0.8em] uppercase">
            <Activity size={24} className="text-[#00FF41] animate-pulse" /> Data_Stream: Stable
          </div>
          <div className="flex gap-12 text-[10px] font-[1000] uppercase tracking-[0.4em] italic">
            <span>Core_Interface_V.6.2</span>
            <span>Local_Time: {new Date().toLocaleTimeString()}</span>
            <span>Status: Verified</span>
          </div>
        </footer>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        body { font-family: 'Inter', sans-serif; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #050505; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 0px; }
        ::-webkit-scrollbar-thumb:hover { background: #F72585; }
      `}</style>
    </div>
  );
}

function SpecItem({ icon, label, value }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/20">
        {React.cloneElement(icon, { size: 14, className: "text-[#F72585]" })} {label}
      </div>
      <div className="text-xl font-[1000] uppercase tracking-tighter">{value}</div>
    </div>
  );
}