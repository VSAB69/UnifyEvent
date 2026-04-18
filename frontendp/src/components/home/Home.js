import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import {
  Sparkles,
  ChevronRight,
  Activity,
  Cpu,
  Fingerprint,
  Zap,
  Terminal,
  Code2,
  Music,
  Ghost,
  Calendar,
  Clock,
  ArrowUpRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import ParticipantService from "../participant/ParticipantService";

// --- SUB-COMPONENT: SECURE IMAGE ---
const SecureImage = ({ imageKey, alt, className }) => {
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (imageKey) {
      setLoading(true);
      ParticipantService.getEventImageSignedUrl(imageKey)
        .then((res) => {
          setUrl(res.data.url);
        })
        .catch((err) => {
          console.error("Image Load Error:", err);
          setUrl(null);
        })
        .finally(() => setLoading(false));
    }
  }, [imageKey]);

  if (loading) return <div className="w-full h-full bg-white/5 animate-pulse flex items-center justify-center"><Zap size={20} className="text-white/20" /></div>;
  if (!url) return <div className="w-full h-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors"><Zap size={24} className="text-white/10" /></div>;

  return <img src={url} alt={alt} className={className} />;
};

export const Home = () => {
  const { user } = useAuth();
  const nav = useNavigate();
  const username = user?.username || "OPERATOR";

  const [recent, setRecent] = useState([]);
  const [events, setEvents] = useState([]);
  const [parentEvents, setParentEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const [bookingsRes, eventsRes, parentsRes] = await Promise.all([
        ParticipantService.getMyBookings(),
        ParticipantService.getAllEvents(),
        ParticipantService.getParentEvents()
      ]);

      setRecent(bookingsRes.data || []);
      setEvents(eventsRes.data || []);
      setParentEvents(parentsRes.data || []);
    } catch (e) {
      console.error("System_Link_Failure", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white relative font-sans selection:bg-[#F72585] overflow-y-auto custom-scrollbar">

      {/* --- BACKGROUND HUD OVERLAYS --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#1a101a_0%,#050505_100%)] opacity-70" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:60px_60px]" />
        {/* Subtle scanline effect */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px]" />
      </div>

      <div className="relative z-10 flex flex-col p-4 sm:p-6 md:p-10 lg:p-16 max-w-[1800px] mx-auto">

        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 sm:mb-16 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-[3px] w-12 bg-[#F72585]" />
              <p className="text-[9px] sm:text-[10px] tracking-[0.5em] sm:tracking-[0.7em] text-white/50 uppercase font-black">
                Terminal_Access_v6.2
              </p>
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-[1000] uppercase tracking-tighter leading-none">
              Welcome <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F72585] via-[#9155FD] to-[#4CC9F0] italic">{username}</span>
            </h1>
          </motion.div>

          <div className="flex flex-col items-end gap-3 w-full md:w-auto">
            <div className="flex items-center gap-4 bg-white/[0.03] border-2 border-white/5 px-6 py-3 rounded-2xl backdrop-blur-md shadow-2xl w-full md:w-auto justify-center md:justify-end">
              <Fingerprint size={18} className="text-[#9155FD] animate-pulse" />
              <div className="text-right">
                <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Operator_Auth</p>
                <p className="text-sm font-black uppercase tracking-tighter text-white">ID_{user?.id?.toString().padStart(3, '0') || '000'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* --- 1. PARENT EVENT CATEGORIES --- */}
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <Zap size={22} className="text-[#F72585] fill-[#F72585]/20" />
            <h2 className="text-[12px] tracking-[0.6em] text-white/60 uppercase font-black">
              Primary_Event_Sectors
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {parentEvents.length > 0 ? parentEvents.map((pe, idx) => {
              const config = [
                { icon: <Code2 />, color: "#4CC9F0", label: "Technical" },
                { icon: <Music />, color: "#F72585", label: "Cultural" },
                { icon: <Ghost />, color: "#9DFF00", label: "Recreational" }
              ];
              const theme = config[idx % config.length];
              return (
                <CategoryCard
                  key={pe.id}
                  id={pe.id}
                  name={pe.name}
                  label={theme.label}
                  icon={theme.icon}
                  themeColor={theme.color}
                  imageKey={pe.image}
                  glitchText={`NEXUS.NODE_${pe.id.toString().padStart(2, '0')}`}
                />
              )
            }) : (
              [1, 2, 3].map(i => <div key={i} className="h-80 rounded-[45px] bg-white/5 border-2 border-white/5 animate-pulse" />)
            )}
          </div>
        </section>

        {/* --- MAIN CONTENT GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* LEFT: REGISTRY LOGS (Your Bookings) */}
          <section className="lg:col-span-4 flex flex-col order-2 lg:order-1">
            <div className="flex items-center gap-4 mb-8">
              <Activity size={20} className="text-[#00FF41]" />
              <h2 className="text-[12px] tracking-[0.6em] text-white/60 uppercase font-black">
                Active_Registry_Logs
              </h2>
            </div>

            <div className="space-y-5">
              {loading ? (
                [1, 2, 3].map(i => <div key={i} className="h-32 bg-white/5 rounded-[30px] border border-white/5 animate-pulse" />)
              ) : recent.length === 0 ? (
                <div className="border-2 border-dashed border-white/5 rounded-[40px] p-16 text-center group hover:border-white/10 transition-all">
                  <Terminal size={32} className="mx-auto mb-4 text-white/10 group-hover:text-[#F72585] transition-colors" />
                  <p className="text-[10px] uppercase font-black tracking-[0.4em] text-white/20">Empty_Registry</p>
                </div>
              ) : (
                recent.slice(0, 5).map((booking) => (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={booking.id}
                    className="p-6 bg-[#0a0a0a] border-2 border-white/5 rounded-[35px] hover:border-[#F72585]/30 transition-all shadow-2xl relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                      <Fingerprint size={80} />
                    </div>
                    {booking.booked_events.map((be) => (
                      <div key={be.id} className="relative z-10">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-[9px] font-[1000] text-[#F72585] tracking-[0.3em] uppercase bg-[#F72585]/10 px-3 py-1 rounded-full">
                            LOG_#{booking.id}
                          </span>
                          <span className="text-lg font-[1000] text-[#00FF41] tracking-tighter italic">₹{Number(be.line_total).toFixed(0)}</span>
                        </div>
                        <h4 className="text-2xl font-[1000] uppercase tracking-tighter mb-4 leading-none">{be.event_name}</h4>
                        <div className="flex flex-wrap gap-5 text-white/40">
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                            <Calendar size={14} className="text-[#9155FD]" /> {be.slot_info.date}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                            <Clock size={14} className="text-[#4CC9F0]" /> {be.slot_info.start_time}
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                ))
              )}
            </div>
          </section>

          {/* RIGHT: AVAILABLE NODES (All Events) */}
          <section className="lg:col-span-8 flex flex-col order-1 lg:order-2">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Cpu size={22} className="text-[#4CC9F0] fill-[#4CC9F0]/10" />
                <h2 className="text-[12px] tracking-[0.6em] text-white/60 uppercase font-black">
                  Available_Access_Nodes
                </h2>
              </div>
              <Sparkles size={18} className="text-[#9155FD] animate-pulse" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {events.map((ev) => (
                <motion.div
                  key={ev.id}
                  whileHover={{ y: -10 }}
                  onClick={() => nav(`/event/${ev.id}`)}
                  className="group relative flex flex-col h-[420px] rounded-[45px] overflow-hidden border-2 border-white/5 bg-[#080808] cursor-pointer hover:border-[#4CC9F0]/40 transition-all shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                >
                  <div className="h-3/5 relative overflow-hidden bg-white/5">
                    <SecureImage
                      imageKey={ev.image_key}
                      alt={ev.name}
                      className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:scale-110 group-hover:opacity-100 transition-all duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent" />

                    {/* Floating Price Badge */}
                    <div className="absolute top-6 right-6 px-5 py-2 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
                      <p className="text-[10px] font-black tracking-widest text-[#00FF41]">
                        {Number(ev.price) === 0 ? "PUBLIC_DOMAIN" : `UNIT_${ev.price}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-[9px] font-black text-[#4CC9F0] uppercase tracking-[0.4em] mb-3">
                        <Terminal size={12} />System_Node_{ev.id.toString().padStart(2, '0')}
                      </div>
                      <h3 className="text-3xl font-[1000] uppercase tracking-tighter leading-none group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-[#4CC9F0] transition-all">
                        {ev.name}
                      </h3>
                    </div>

                    <div className="flex justify-between items-center mt-6">
                      <div className="flex items-center gap-2 text-white/30 text-[10px] font-black uppercase tracking-widest">
                        <Activity size={12} className="text-[#00FF41]" /> Online_Pulse
                      </div>
                      <div className="w-14 h-14 rounded-2xl bg-white/5 border-2 border-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-500 shadow-2xl group-hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                        <ArrowUpRight size={24} strokeWidth={3} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #050505; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1a1a1a; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #F72585; }
      `}</style>
    </div>
  );
};

// --- ENHANCED 3D CATEGORY CARD ---
const CategoryCard = ({ id, name, label, icon, themeColor, imageKey, glitchText }) => {
  const nav = useNavigate();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <motion.div
      onClick={() => nav(`/parent-events/${id}`)}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="relative h-80 rounded-[45px] bg-[#0a0a0a] border-2 border-white/5 cursor-pointer group shadow-2xl transition-colors hover:border-white/10"
    >
      <div className="absolute inset-0 rounded-[45px] overflow-hidden">
        <SecureImage
          imageKey={imageKey}
          alt={name}
          className="w-full h-full object-cover opacity-10 grayscale group-hover:grayscale-0 group-hover:scale-110 group-hover:opacity-30 transition-all duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      </div>

      <div
        style={{ background: `radial-gradient(circle at center, ${themeColor}20 0%, transparent 70%)` }}
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
      />

      <div className="relative h-full p-10 flex flex-col justify-between z-10" style={{ transform: "translateZ(60px)" }}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div style={{ backgroundColor: themeColor }} className="w-14 h-14 rounded-2xl text-black flex items-center justify-center shadow-2xl">
              {React.cloneElement(icon, { size: 24, strokeWidth: 3 })}
            </div>
            <div>
              <p style={{ color: themeColor }} className="text-[11px] font-[1000] uppercase tracking-[0.5em]">{label}</p>
              <p className="text-[9px] font-mono text-white/20 uppercase tracking-widest mt-1 group-hover:text-white/50 transition-colors">{glitchText}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-end">
          <h3 className="text-4xl font-[1000] uppercase tracking-tighter leading-[0.85] w-2/3 group-hover:italic transition-all">
            {name}
          </h3>
          <div className="w-14 h-14 rounded-full border-2 border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-500 shadow-2xl">
            <ChevronRight size={28} strokeWidth={3} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};