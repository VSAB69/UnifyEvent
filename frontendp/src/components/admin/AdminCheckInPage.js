import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import EventService from "../admin/EventService";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Users, X, Activity, Clock, ShieldCheck, UserCheck, ChevronDown, AlertCircle, CheckCircle2 } from "lucide-react";

export default function AdminCheckInPage() {
  const { eventId } = useParams();

  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & States
  const [dateFilter, setDateFilter] = useState("");
  const [slotFilter, setSlotFilter] = useState("");
  const [teamSearch, setTeamSearch] = useState("");
  const [showOnlyCheckedIn, setShowOnlyCheckedIn] = useState(false);

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [editedParticipants, setEditedParticipants] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: "", type: "success" });

  const load = async () => {
    setLoading(true);
    try {
      const res = await EventService.getAllBookedEventsAdmin();
      setAllBookings(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const eventBookings = useMemo(
    () => allBookings.filter((b) => Number(b.event) === Number(eventId)),
    [allBookings, eventId]
  );

  const eventTitle = eventBookings[0]?.event_name || `NODE_#${eventId}`;
  const dateOptions = useMemo(() => [...new Set(eventBookings.map(b => b.slot_info?.date))].filter(Boolean), [eventBookings]);
  const slotOptions = useMemo(() => {
    const map = new Map();
    eventBookings.forEach((b) => {
      if (b.slot_info && (!dateFilter || b.slot_info.date === dateFilter)) {
        map.set(b.slot_info.id, { id: b.slot_info.id, label: `${b.slot_info.start_time} - ${b.slot_info.end_time}` });
      }
    });
    return [...map.values()];
  }, [eventBookings, dateFilter]);

  const processedTeams = useMemo(() => {
    let teams = [...eventBookings];

    if (dateFilter) teams = teams.filter(b => b.slot_info?.date === dateFilter);
    if (slotFilter) teams = teams.filter(b => b.slot_info?.id === Number(slotFilter));
    if (teamSearch) {
      teams = teams.filter(b =>
        (b.participants || []).some(p => p.name.toLowerCase().includes(teamSearch.toLowerCase()))
      );
    }

    if (showOnlyCheckedIn) {
      return teams.map(team => ({
        ...team,
        participants: (team.participants || []).filter(p => p.arrived)
      }))
        .filter(team => team.participants.length > 0)
        .sort((a, b) => {
          const getLatestCheckin = (pList) => {
            if (!Array.isArray(pList) || pList.length === 0) return 0;
            const times = pList.map(p =>
              p.checkin_time ? new Date(p.checkin_time).getTime() : 0
            );
            return Math.max(0, ...times);
          };
          return getLatestCheckin(b.participants) - getLatestCheckin(a.participants);
        });
    }

    return teams;
  }, [eventBookings, dateFilter, slotFilter, teamSearch, showOnlyCheckedIn]);

  const stats = useMemo(() => {
    const allP = eventBookings.flatMap(b => b.participants);
    return {
      total: allP.length,
      verified: allP.filter(p => p.arrived).length,
      pending: allP.filter(p => !p.arrived).length
    };
  }, [eventBookings]);

  const toggleLocalAttendance = (p) => {
    setEditedParticipants(prev => ({
      ...prev,
      [p.id]: { ...p, arrived: prev[p.id] ? !prev[p.id].arrived : !p.arrived }
    }));
  };

  const saveAttendance = async () => {
    const changed = Object.values(editedParticipants);
    try {
      for (let p of changed) { if (p.arrived) await EventService.checkInParticipant(p.id); }
      setSnackbar({ open: true, message: "REGISTRY_SYNC_COMPLETE", type: "success" });
      setTimeout(() => setSnackbar(s => ({ ...s, open: false })), 2600);
      setEditedParticipants({});
      load();
      setSelectedBooking(null);
    } catch {
      setSnackbar({ open: true, message: "SYNC_FAILURE", type: "error" });
      setTimeout(() => setSnackbar(s => ({ ...s, open: false })), 2600);
    }
  };

  const formatCheckinTime = (timeStr) => {
    if (!timeStr) return "N/A";
    const date = new Date(timeStr);
    return isNaN(date.getTime()) ? "N/A" : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return (
    <div className="h-screen bg-[#050505] flex flex-col items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-12 h-12 border-4 border-[#F72585] border-t-transparent rounded-full mb-4" />
      <p className="text-[10px] tracking-[0.5em] text-[#F72585] font-black uppercase">Synchronizing_Registry...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white py-12 px-8 selection:bg-[#F72585]">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#1a101a_0%,#050505_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto">
        <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Activity className="text-[#F72585]" size={18} />
              <p className="text-[10px] tracking-[0.6em] text-white/40 uppercase font-black">Attendance_Control_v4.6</p>
            </div>
            <h1 className="text-4xl md:text-6xl font-[1000] uppercase tracking-tighter leading-none">{eventTitle}</h1>
          </div>

          <div className="flex flex-wrap gap-4">
            <FilterBlock label="DATE" value={dateFilter} onChange={setDateFilter} options={dateOptions.map(d => ({ id: d, label: d }))} color="#9155FD" />
            <FilterBlock label="SECTOR" value={slotFilter} onChange={setSlotFilter} options={slotOptions} color="#4CC9F0" />

            <div className="space-y-2">
              <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-2">SORT_MODE</label>
              <button
                onClick={() => setShowOnlyCheckedIn(!showOnlyCheckedIn)}
                className={`flex items-center gap-3 border-2 rounded-2xl px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${showOnlyCheckedIn ? 'bg-[#00FF41] text-black border-[#00FF41]' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
              >
                <Clock size={14} /> {showOnlyCheckedIn ? "Timeline_Active" : "Standard_View"}
              </button>
            </div>
          </div>
        </motion.header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatBox label="TOTAL_REGISTRY" count={stats.total} color="#FFFFFF" icon={<Users />} />
          <StatBox label="VERIFIED_ACCESS" count={stats.verified} color="#00FF41" icon={<ShieldCheck />} glow />
          <StatBox label="PENDING_SYNC" count={stats.pending} color="#F72585" icon={<Clock />} />
        </div>

        <div className="relative mb-10 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#F72585] transition-colors" size={20} />
          <input
            placeholder="SEARCH_REGISTRY_LOGS..."
            value={teamSearch}
            onChange={(e) => setTeamSearch(e.target.value)}
            className="w-full bg-white/[0.02] border-2 border-white/5 rounded-3xl pl-16 pr-8 py-6 text-sm font-black uppercase tracking-widest focus:border-[#F72585] outline-none transition-all"
          />
        </div>

        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {processedTeams.map((team) => (
              <motion.div
                key={team.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0a0a0a] rounded-[40px] border-2 border-white/5 p-8 lg:p-10 shadow-2xl relative overflow-hidden group hover:border-[#F72585]/20 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-white/5 gap-4">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-[#9155FD]/10 flex items-center justify-center border border-[#9155FD]/20">
                      <Users className="text-[#9155FD]" size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-1">TEAM_IDENTIFIER</p>
                      <h2 className="text-3xl font-[1000] uppercase tracking-tighter text-white">{team.participants[0]?.name} <span className="text-white/20 font-black italic ml-2">Node</span></h2>
                    </div>
                  </div>

                  <div className="flex gap-10">
                    <div className="text-right">
                      <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">SECTOR_LOG</p>
                      <span className="text-xs font-bold text-white/60">{team.slot_info?.date}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">WINDOW_UTC</p>
                      <span className="text-xs font-bold text-white/60">{team.slot_info?.start_time} - {team.slot_info?.end_time}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {team.participants.map(p => (
                    <div key={p.id} className={`p-5 rounded-3xl border-2 transition-all ${p.arrived ? 'bg-[#00FF41]/5 border-[#00FF41]/20' : 'bg-white/[0.02] border-white/5'}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div className={`p-2.5 rounded-xl ${p.arrived ? 'bg-[#00FF41]/10 text-[#00FF41]' : 'bg-white/5 text-white/20'}`}>
                          {p.arrived ? <UserCheck size={18} /> : <Users size={18} />}
                        </div>
                        {p.arrived && (
                          <div className="text-right">
                            <p className="text-[8px] font-black text-white/30 uppercase mb-1">SYNCED</p>
                            <p className="text-[10px] font-[1000] text-[#00FF41] italic">
                              {formatCheckinTime(p.checkin_time)}
                            </p>
                          </div>
                        )}
                      </div>
                      <h3 className="text-base font-[1000] uppercase tracking-tight text-white/80">{p.name}</h3>
                      <p className="text-[9px] font-black text-white/20 uppercase tracking-widest truncate">{p.email || "NULL_CHANNEL"}</p>
                    </div>
                  ))}
                </div>

                {!showOnlyCheckedIn && (
                  <button
                    onClick={() => { setSelectedBooking(team); setEditedParticipants({}); }}
                    className="w-full mt-8 py-5 rounded-2xl bg-white text-black font-[1000] uppercase tracking-widest text-[10px] hover:bg-[#F72585] hover:text-white transition-all shadow-xl active:scale-95"
                  >
                    Authorize_Team_Sync
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* --- SNACKBAR NOTIFICATION --- */}
      <AnimatePresence>
        {snackbar.open && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] min-w-[300px]"
          >
            <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl border-2 backdrop-blur-xl shadow-2xl ${snackbar.type === 'success' ? 'bg-[#00FF41]/10 border-[#00FF41]/40 text-[#00FF41]' : 'bg-[#F72585]/10 border-[#F72585]/40 text-[#F72585]'}`}>
              {snackbar.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">{snackbar.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MODAL --- */}
      <AnimatePresence>
        {selectedBooking && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#0a0a0a] border-2 border-white/10 rounded-[45px] w-full max-w-2xl p-10 shadow-2xl relative">
              <button onClick={() => setSelectedBooking(null)} className="absolute top-8 right-8 text-white/20 hover:text-white"><X size={24} /></button>
              <h3 className="text-3xl font-[1000] uppercase tracking-tighter mb-10">Confirm_Identity_Sync</h3>

              <div className="space-y-4 mb-10">
                {selectedBooking.participants.map(p => {
                  const local = editedParticipants[p.id];
                  const arrived = local ? local.arrived : p.arrived;
                  return (
                    <div key={p.id} className={`flex items-center justify-between p-6 rounded-3xl border-2 transition-all ${arrived ? 'bg-[#00FF41]/5 border-[#00FF41]/20' : 'bg-white/5 border-white/5'}`}>
                      <div>
                        <p className="text-lg font-black uppercase">{p.name}</p>
                        {arrived && (
                          <p className="text-[10px] font-black text-[#00FF41] mt-1 italic uppercase tracking-widest">
                            SYNCED @ {formatCheckinTime(p.checkin_time)}
                          </p>
                        )}
                      </div>
                      <button onClick={() => toggleLocalAttendance(p)} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${arrived ? 'bg-[#00FF41] text-black' : 'bg-white/10 text-white hover:bg-white hover:text-black'}`}>
                        {arrived ? "Marked" : "Check_In"}
                      </button>
                    </div>
                  )
                })}
              </div>

              <div className="flex gap-4">
                <button onClick={saveAttendance} className="flex-[2] py-5 rounded-3xl bg-white text-black font-[1000] uppercase tracking-widest text-xs hover:bg-[#00FF41] transition-all">Commit_Sequence</button>
                <button onClick={() => setSelectedBooking(null)} className="flex-1 py-5 rounded-3xl bg-white/5 text-white/40 font-[1000] uppercase tracking-widest text-xs">Abort</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatBox({ label, count, color, icon, glow }) {
  return (
    <div className={`relative bg-white/[0.02] border-2 border-white/5 rounded-[40px] p-10 transition-all ${glow ? 'shadow-[0_0_40px_rgba(0,255,65,0.1)] border-[#00FF41]/20' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div style={{ color }} className="opacity-40">{icon}</div>
        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">{label}</span>
      </div>
      <div className="text-6xl font-[1000] italic tracking-tighter leading-none" style={{ color }}>{count}</div>
    </div>
  );
}

function FilterBlock({ label, value, onChange, options, color }) {
  return (
    <div className="space-y-2">
      <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-2">{label}_NODE</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ borderColor: `${color}30` }}
          className="w-full bg-white/5 border-2 rounded-2xl pl-5 pr-12 py-3 text-[10px] font-black uppercase tracking-widest focus:border-white transition-all outline-none appearance-none cursor-pointer"
        >
          <option value="">ALL_{label}S</option>
          {(options || []).map(o => <option key={o.id || o.label || o.value} value={o.id} className="bg-[#0a0a0a]">{o.label}</option>)}
        </select>
        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
      </div>
    </div>
  );
}