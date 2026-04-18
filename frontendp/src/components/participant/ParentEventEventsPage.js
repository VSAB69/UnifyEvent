import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowUpRight, 
  Sparkles, 
  Zap,  
  Calendar, 
  Clock, 
  MapPin, 
  UserPlus 
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom"; // Added useNavigate
import ParticipantService from "./ParticipantService";

// Modals
import ParticipantCountModal from "./modals/ParticipantCountModal";
import ParticipantDetailsModal from "./modals/ParticipantDetailsModal";
import SlotPickModal from "./modals/SlotPickModal";

export default function ParentEventEventsPage() {
  const { parentId } = useParams();
  const navigate = useNavigate(); // Hook for navigation

  const [events, setEvents] = useState([]);
  const [parentName, setParentName] = useState("");
  const [fetching, setFetching] = useState(true);
  const [imageUrls, setImageUrls] = useState({});
  
  const [eventDataMap, setEventDataMap] = useState({});

  const initialSession = {
    event: null,
    constraint: null,
    count: 1,
    participants: [],
    slot: null,
  };

  const [session, setSession] = useState(initialSession);
  const [openCount, setOpenCount] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [openSlot, setOpenSlot] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });

  const showToast = (msg, sev = "success") => {
    setAlert({ open: true, message: msg, severity: sev });
    setTimeout(() => setAlert((a) => ({ ...a, open: false })), 2600);
  };

  useEffect(() => {
    const load = async () => {
      setFetching(true);
      try {
        const pRes = await ParticipantService.getParentEvent(parentId);
        setParentName(pRes.data?.name || "Sector");
        
        const eRes = await ParticipantService.getEventsByParent(parentId);
        const eventList = eRes.data || [];
        setEvents(eventList);

        eventList.forEach(async (ev) => {
          try {
            const [detRes, conRes] = await Promise.all([
              ParticipantService.getEventDetailsByEvent(ev.id),
              ParticipantService.getConstraintForEvent(ev.id)
            ]);
            
            setEventDataMap(prev => ({
              ...prev,
              [ev.id]: {
                details: detRes.data?.[0] || null,
                constraint: conRes.data?.[0] || null
              }
            }));
          } catch (err) {
            console.error(`Failed to fetch extra data for event ${ev.id}`);
          }
        });

      } catch {
        showToast("Link_Error: Archive unreachable", "error");
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [parentId]);

  useEffect(() => {
    events.forEach((ev) => {
      if (!ev.image_key || imageUrls[ev.id]) return;
      ParticipantService.getEventImageSignedUrl(ev.image_key)
        .then((res) => setImageUrls((p) => ({ ...p, [ev.id]: res.data.url })))
        .catch(() => {});
    });
  }, [events, imageUrls]);

  const finishParticipants = (list) => {
    setSession((s) => ({ ...s, participants: list }));
    setOpenDetails(false);
    setOpenSlot(true);
  };

  const chooseSlot = async (slot) => {
    try {
      const cart = await ParticipantService.getOrCreateCart();
      const cartItem = await ParticipantService.createCartItem({
        cart: cart.data.id,
        event: session.event.id,
        participants_count: session.count,
      });
      for (const p of session.participants) {
        await ParticipantService.createTempBooking({
          cart_item: cartItem.data.id,
          name: p.name,
          email: p.email || null,
          phone_number: p.phone_number || null,
        });
      }
      await ParticipantService.createTempTimeslot({ cart_item: cartItem.data.id, slot: slot.id });
      showToast("Protocol_Applied: Item added to cart");
    } catch {
      showToast("Access_Denied: Cart update failed", "error");
    }
    setSession(initialSession);
    setOpenSlot(false);
  };

  const getConstraintDisplay = (con) => {
    if (!con || con.booking_type === 'single') return "Single Participation";
    if (con.fixed) return `Fixed Group: ${con.upper_limit} Members`;
    return `Team: ${con.lower_limit} - ${con.upper_limit} Members`;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#F72585] overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#1a101a_0%,#050505_100%)] opacity-70" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-6 py-16 md:px-12">
        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="h-[2px] w-12 bg-[#F72585]" />
            <p className="text-[10px] tracking-[0.6em] text-white/40 uppercase font-black">Archive_Cluster_v9.4</p>
          </div>
          <h1 className="text-5xl md:text-8xl font-[1000] uppercase tracking-tighter leading-none mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F72585] via-[#9155FD] to-[#4CC9F0] italic">{parentName}</span>
          </h1>
        </motion.header>

        {fetching ? (
          <div className="flex flex-col items-center py-40">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="w-16 h-16 border-2 border-[#F72585] border-t-transparent rounded-full mb-6" />
            <p className="text-[10px] tracking-[0.4em] font-black text-[#F72585] animate-pulse uppercase">Fetching_Data_Packets</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
            {events.map((ev, idx) => {
              const details = eventDataMap[ev.id]?.details;
              const constraint = eventDataMap[ev.id]?.constraint;

              return (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="group relative bg-[#0a0a0a] border border-white/10 rounded-[40px] overflow-hidden flex flex-col md:flex-row h-auto md:h-96 transition-all duration-500 hover:border-[#F72585]/50 shadow-2xl shadow-black"
                >
                  <div className="w-full md:w-2/5 h-64 md:h-full relative overflow-hidden bg-white/5 border-b md:border-b-0 md:border-r border-white/10">
                    {imageUrls[ev.id] ? (
                      <img src={imageUrls[ev.id]} alt={ev.name} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-white/[0.02]"><Zap className="text-white/10 w-12 h-12" /></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black via-transparent to-transparent opacity-80" />
                    <div className="absolute top-6 left-6 flex flex-col gap-2">
                      <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full backdrop-blur-xl border border-white/10 ${ev.exclusivity ? 'bg-[#F72585]/20 text-[#F72585]' : 'bg-white/10 text-white'}`}>
                        {ev.exclusivity ? "★ Exclusive" : "Standard"}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 p-8 md:p-10 flex flex-col justify-between relative overflow-hidden">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-[#4CC9F0]">
                        <Sparkles size={16} />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">{ev.parent_committee || 'General_Node'}</span>
                      </div>
                      
                      <h2 className="text-3xl font-[1000] uppercase tracking-tighter leading-tight group-hover:italic transition-all">
                        {ev.name}
                      </h2>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 text-white/50 bg-white/5 p-2 rounded-xl border border-white/5">
                          <MapPin size={14} className="text-[#F72585]" />
                          <span className="text-[9px] font-bold uppercase truncate">{details?.venue || "Venue TBD"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/50 bg-white/5 p-2 rounded-xl border border-white/5">
                          <Calendar size={14} className="text-[#4CC9F0]" />
                          <span className="text-[9px] font-bold uppercase">
                            {details?.start_datetime ? new Date(details.start_datetime).toLocaleDateString('en-GB', {day:'2-digit', month:'short'}) : "Date TBD"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-white/50 bg-white/5 p-2 rounded-xl border border-white/5 col-span-2">
                          <Clock size={14} className="text-[#9155FD]" />
                          <span className="text-[9px] font-bold uppercase">
                            {details?.start_datetime ? new Date(details.start_datetime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "Time TBD"}
                            {details?.end_datetime ? ` - ${new Date(details.end_datetime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : ""}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 bg-[#F72585]/5 border border-[#F72585]/20 p-2.5 rounded-2xl">
                        <UserPlus size={14} className="text-[#F72585]" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#F72585]">
                          {getConstraintDisplay(constraint)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-6">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Entry_Fee</span>
                        <span className="text-3xl font-black text-white italic">₹{ev.price}</span>
                      </div>
                      {/* CHANGED: Now navigates to the Event Details Page */}
                      <button
                        onClick={() => navigate(`/event/${ev.id}`)}
                        className="w-14 h-14 rounded-2xl bg-white text-black flex items-center justify-center hover:bg-[#F72585] hover:text-white transition-all group-hover:scale-110 active:scale-90 shadow-lg shadow-white/5"
                      >
                        <ArrowUpRight size={24} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Booking Logic Modals */}
      <ParticipantCountModal
        open={openCount} onClose={() => setOpenCount(false)}
        constraint={session.constraint}
        onChoose={(n) => {
          setSession((s) => ({ ...s, count: n }));
          setOpenCount(false);
          setOpenDetails(true);
        }}
      />

      <ParticipantDetailsModal
        open={openDetails} onClose={() => setOpenDetails(false)}
        count={session.count} onComplete={finishParticipants}
      />

      <SlotPickModal
        open={openSlot} onClose={() => setOpenSlot(false)}
        event={session.event} participantsCount={session.count}
        onPick={chooseSlot} fetchSlots={(id) => ParticipantService.getEventSlots(id)}
      />

      <AnimatePresence>
        {alert.open && (
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            className={`fixed bottom-10 right-10 z-[100] px-8 py-4 border rounded-2xl font-black text-xs tracking-widest uppercase flex items-center gap-4 ${
              alert.severity === "success" ? "bg-black border-[#00FF41] text-[#00FF41]" : "bg-black border-[#F72585] text-[#F72585]"
            }`}
          >
            <div className={`w-2 h-2 rounded-full animate-ping ${alert.severity === "success" ? 'bg-[#00FF41]' : 'bg-[#F72585]'}`} />
            {alert.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}