import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  ShieldCheck,
  Cpu,
  Activity,
  Fingerprint,
} from "lucide-react";
import html2canvas from "html2canvas";
import { useNavigate, useParams } from "react-router-dom";
import ParticipantService from "./ParticipantService";
import { QRCodeCanvas } from "qrcode.react";
import { motion } from "framer-motion";

export default function TicketPage() {
  const { bookedEventId } = useParams();
  const nav = useNavigate();

  const [bookedEvent, setBookedEvent] = useState(null);
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);

  const ticketRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const beRes = await ParticipantService.getBookedEvent(bookedEventId);
        const be = beRes.data;
        setBookedEvent(be);

        if (be?.event) {
          const detRes = await ParticipantService.getEventDetailsByEvent(be.event);
          setVenue(detRes.data?.[0]?.venue || null);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [bookedEventId]);

  const downloadImage = async () => {
    const canvas = await html2canvas(ticketRef.current, {
      scale: 3,
      backgroundColor: "#050505",
      useCORS: true,
    });
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `NEXUS_PERMIT_${bookedEventId}.png`;
    link.click();
  };

  if (loading || !bookedEvent) return null;

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white font-sans selection:bg-[#F72585] relative overflow-x-hidden p-6 md:p-10 flex flex-col items-center">

      {/* --- BACKGROUND OVERLAYS --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#1a101a_0%,#050505_100%)] opacity-60" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* --- TOP CONTROL BAR --- */}
      <div className="relative z-10 w-full max-w-5xl flex justify-between items-center mb-6 sm:mb-10">
        <button onClick={() => nav(-1)} className="group flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 border-2 border-white/10 rounded-full group-hover:bg-[#F72585] group-hover:border-[#F72585] transition-all">
            <ArrowLeft size={16} className="sm:size-[18px]" />
          </div>
          <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.4em] text-white/40 group-hover:text-white">Exit_Archive</span>
        </button>

        <button onClick={downloadImage} className="bg-white text-black px-4 sm:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-[1000] uppercase text-[8px] sm:text-[10px] tracking-[0.1em] sm:tracking-[0.2em] hover:bg-[#F72585] hover:text-white transition-all shadow-xl">
          Download_Permit
        </button>
      </div>

      <div className="relative z-10 w-full max-w-5xl">

        {/* --- HEADER --- */}
        <header className="mb-8 sm:mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-[2px] w-12 bg-[#F72585]" />
          </div>
          <h1 className="text-[32px] sm:text-[40px] md:text-[50px] font-[1000] uppercase tracking-tighter leading-none">
            VALID <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F72585] via-[#9155FD] to-[#4CC9F0] italic">PASS</span>
          </h1>
        </header>

        {/* --- MAIN TICKET MODULE --- */}
        <motion.div
          ref={ticketRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-12 gap-0 border border-white/10 bg-[#080808]/95 rounded-[24px] sm:rounded-[40px] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.8)]"
        >
          {/* LEFT: SPECS PANEL */}
          <div className="col-span-12 lg:col-span-4 p-6 sm:p-10 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col justify-between bg-white/[0.01] relative overflow-hidden">
            <Cpu className="absolute -top-10 -left-10 text-white/[0.02] select-none pointer-events-none" size={250} />

            <div className="relative z-10 space-y-6 sm:space-y-10">
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="p-2 sm:p-3 bg-[#F72585] rounded-lg sm:rounded-xl shadow-[0_0_20px_rgba(247,37,133,0.4)]">
                  <Fingerprint size={24} className="sm:size-[28px] text-black" />
                </div>
                <div>
                  <p className="text-[8px] sm:text-[10px] font-black opacity-30 uppercase tracking-[0.3em] sm:tracking-[0.4em] mb-1">Registry_Key</p>
                  <h3 className="text-2xl sm:text-3xl font-[1000] uppercase tracking-tighter italic">#{bookedEvent.id}</h3>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-6 sm:gap-y-8 gap-x-4">
                <TicketSpec icon={<Calendar />} label="DATE" value={bookedEvent.slot_info?.date} />
                <TicketSpec
                  icon={<Clock />}
                  label="Slot_Time"
                  value={`${bookedEvent.slot_info?.start_time} - ${bookedEvent.slot_info?.end_time}`}
                />
                <TicketSpec icon={<MapPin />} label="Venue" value={venue || "TBA"} color="text-[#4CC9F0]" />
                <TicketSpec icon={<Users />} label="Units" value={`${bookedEvent.participants_count} PAX`} />
              </div>
            </div>

            <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/10 flex flex-col gap-1 relative z-10">
              <span className="text-[8px] sm:text-[10px] font-black opacity-30 uppercase tracking-[0.4em] sm:tracking-[0.5em]">Security_Check</span>
              <div className="flex items-center gap-2 text-[#9DFF00]">
                <ShieldCheck size={18} className="sm:size-[20px]" />
                <span className="text-xl sm:text-2xl font-[1000] uppercase tracking-tighter">Verified</span>
              </div>
            </div>
          </div>


          {/* RIGHT: ACCESS NODES */}
          <div className="col-span-12 lg:col-span-8 p-10 lg:p-14 bg-black/40">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-[10px] font-[1000] uppercase tracking-[0.6em] text-white/30">
                Access_Nodes_Active
              </h2>
              <Activity className="text-[#00FF41] animate-pulse" size={20} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bookedEvent.participants?.map((p, idx) => (
                <div
                  key={p.id}
                  className="bg-[#111] border border-white/5 rounded-[30px] p-6 flex items-center justify-between group transition-all hover:border-[#F72585]/40"
                >
                  <div className="max-w-[160px]">
                    <p className="text-[10px] font-black text-[#F72585] uppercase mb-1 tracking-widest">
                      Node_0{idx + 1}
                    </p>
                    <p className="text-xl font-[1000] uppercase tracking-tighter leading-tight mb-1 truncate">
                      {p.name}
                    </p>
                    <p className="text-[10px] opacity-40 truncate font-bold uppercase">
                      {p.email}
                    </p>
                  </div>

                  <div className="relative flex items-center justify-center">
                    {!p.arrived && p.qr_token ? (
                      <div className="p-2 bg-white rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:scale-105 transition-transform">
                        <QRCodeCanvas
                          value={JSON.stringify({
                            type: "event_checkin",
                            token: p.qr_token,
                            participant_id: p.id
                          })}
                          size={70}
                          bgColor="#ffffff"
                          fgColor="#000000"
                        />
                      </div>
                    ) : (
                      <div className="bg-[#9DFF00]/10 border border-[#9DFF00] px-4 py-2 rounded-xl flex flex-col items-center">
                        <ShieldCheck className="text-[#9DFF00] mb-1" size={18} />
                        <span className="text-[9px] font-[1000] text-[#9DFF00] uppercase">
                          CLEARED
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* --- SYSTEM FOOTER --- */}
        <footer className="mt-20 pb-10 flex flex-col md:flex-row justify-between items-center opacity-20 gap-6">
          <div className="flex items-center gap-4 text-[10px] font-black tracking-[0.5em] uppercase">
            <Activity size={18} className="text-[#00FF41]" /> Heartbeat_Stable
          </div>
          <div className="flex gap-8 text-[9px] font-bold uppercase tracking-[0.3em] italic">
            <span>v.6.2_Stable</span>
            <span>{new Date().toLocaleTimeString()}</span>
            <span>Encrypted_AES</span>
          </div>
        </footer>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        body { font-family: 'Inter', sans-serif; background-color: #050505; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #050505; }
        ::-webkit-scrollbar-thumb { background: #222; }
        ::-webkit-scrollbar-thumb:hover { background: #F72585; }
      `}</style>
    </div>
  );
}

function TicketSpec({ icon, label, value, color = "text-white" }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/20">
        {React.cloneElement(icon, { size: 12, className: "text-[#F72585]" })} {label}
      </div>
      <div className={`text-[14px] font-[1000] uppercase tracking-tighter ${color} leading-tight`}>
        {value}
      </div>
    </div>
  );
}