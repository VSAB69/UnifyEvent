import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, MapPin, Clock, Zap, Sparkles, Users, CalendarDays
} from "lucide-react";
import { gsap } from "gsap";
import ParticipantService from "./ParticipantService";

// ✅ Modals
import ParticipantCountModal from "./modals/ParticipantCountModal";
import ParticipantDetailsModal from "./modals/ParticipantDetailsModal";
import SlotPickModal from "./modals/SlotPickModal";

export default function EventDetailsPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const headerRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [constraint, setConstraint] = useState(null);
  const [details, setDetails] = useState(null);
  const [slots, setSlots] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const LOW_CAPACITY = 5;

  const [session, setSession] = useState({ event: null, constraint: null, count: 1, participants: [], slot: null });
  const [openCount, setOpenCount] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [openSlot, setOpenSlot] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });

  // 🛡️ STABILIZE FETCH FUNCTION
  const fetchSlotsData = useCallback((id) => {
    return ParticipantService.getEventSlots(id);
  }, []);

  const fmt = (iso) => {
    try {
      const date = new Date(iso);
      return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    } catch { return "TBA"; }
  };

  const fmtTime = (iso) => {
    try {
      const date = new Date(iso);
      return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    } catch { return "TBA"; }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const eRes = await ParticipantService.getAllEvents();
        const ev = eRes.data.find((e) => e.id === eventId);
        setEvent(ev);

        if (ev?.constraint_id) {
          const c = await ParticipantService.getConstraintById(ev.constraint_id);
          setConstraint(c.data);
        }

        const d = await ParticipantService.getEventDetailsByEvent(eventId);
        setDetails(d.data?.[0]);

        const s = await ParticipantService.getEventSlots(eventId);
        setSlots(s.data || []);
      } catch (err) {
        showToast("Signal Interrupted", "error");
      } finally {
        setLoading(false);
      }
    };
    load();

    const move = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [eventId]);

  useEffect(() => {
    if (!loading && headerRef.current) {
      gsap.fromTo(".animate-text", 
        { opacity: 0, x: -20 }, 
        { opacity: 1, x: 0, duration: 0.8, stagger: 0.1, ease: "power4.out" }
      );
    }
  }, [loading]);

  const showToast = (msg, sev = "success") => {
    setAlert({ open: true, message: msg, severity: sev });
    setTimeout(() => setAlert(a => ({ ...a, open: false })), 3000);
  };

  const onInitializeBooking = () => {
    setSession(s => ({ ...s, event: event, constraint: constraint }));
    if (!constraint || constraint.booking_type === "single") {
      setSession(s => ({ ...s, count: 1 }));
      setOpenDetails(true);
      return;
    }
    if (constraint.fixed) {
      setSession(s => ({ ...s, count: constraint.upper_limit }));
      setOpenDetails(true);
      return;
    }
    setOpenCount(true);
  };

  const handleCountSelection = (n) => {
    setSession(s => ({ ...s, count: n }));
    setOpenCount(false);
    setTimeout(() => setOpenDetails(true), 100);
  };

  const handleDetailsCompletion = (list) => {
    setSession(s => ({ ...s, participants: list }));
    setOpenDetails(false);
    setTimeout(() => setOpenSlot(true), 150);
  };

  /* ... existing code ... */

  const handleSlotSelection = async (slot) => {
    if (!slot) return;
    
    try {
      const cart = await ParticipantService.getOrCreateCart();
      const cartItem = await ParticipantService.createCartItem({ 
        cart: cart.data.id, 
        event: event.id, 
        participants_count: session.count 
      });
      
      await Promise.all([
        ...session.participants.map(p => 
          ParticipantService.createTempBooking({ cart_item: cartItem.data.id, ...p })
        ),
        ParticipantService.createTempTimeslot({ cart_item: cartItem.data.id, slot: slot.id })
      ]);

      showToast("Access Granted. Item in Cart.");
      setOpenSlot(false);
      
      // Optional: Navigate to cart or clear session
      // navigate('/cart');
    } catch (err) {
      showToast("Transmission Failed", "error");
    }
  };

/* ... rest of the render code remains the same ... */

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#050505]">
      <Zap className="text-purple-500 animate-pulse" size={48} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-pink-500/50 overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-[800px] h-[800px] rounded-full blur-[120px] opacity-20"
          style={{
            background: 'radial-gradient(circle, #7209B7 0%, transparent 70%)',
            left: mousePos.x - 400,
            top: mousePos.y - 400,
          }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-12 z-10">
        <motion.button
          onClick={() => navigate(-1)}
          className="group mb-8 flex items-center gap-3 text-slate-500 hover:text-[#4cc9f0] transition-all text-[10px] font-black uppercase tracking-[0.4em]"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
          Return to Hub
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7">
            <header ref={headerRef} className="mb-12">
              <div className="animate-text flex items-center gap-2 mb-6">
                <span className="h-[1px] w-8 bg-pink-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.6em] text-pink-500">Live Experience</span>
              </div>
              <h1 className="animate-text text-7xl md:text-9xl font-black italic tracking-tighter uppercase leading-[0.8] mb-8">
                {event?.name.split(' ')[0]} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F72585] via-[#7209B7] to-[#4cc9f0]">
                  {event?.name.split(' ').slice(1).join(' ') || "Protocol"}
                </span>
              </h1>
              <p className="animate-text max-w-xl text-slate-400 font-medium text-lg leading-relaxed border-l-2 border-white/5 pl-6 mb-12">
                {details?.description || "Synchronize your schedule with the nebula."}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InteractiveCard icon={<MapPin />} label="Sector / Venue" value={details?.venue || "Neural Hub"} color="#F72585" isVenue={true} />
                <InteractiveCard icon={<Users />} label="Participation" value={!constraint ? "Solo Entry" : constraint.booking_type === "single" ? "Solo Operator" : constraint.fixed ? `${constraint.upper_limit} Members` : `${constraint.lower_limit}-${constraint.upper_limit} Members`} color="#7209B7" />
                <InteractiveCard icon={<CalendarDays />} label="Sync Date" value={details?.start_datetime ? fmt(details.start_datetime) : "Live Now"} color="#4cc9f0" />
                <InteractiveCard icon={<Clock />} label="Node Timing" value={details?.start_datetime ? fmtTime(details.start_datetime) : "Rolling"} color="#F72585" />
              </div>
            </header>
          </div>

          <div className="lg:col-span-5 lg:sticky lg:top-12">
            <motion.div className="bg-white/5 border border-white/10 p-8 rounded-[3rem] backdrop-blur-3xl relative overflow-hidden">
              <h3 className="text-[10px] font-black tracking-[0.5em] text-slate-500 uppercase mb-8">Scheduling Interface</h3>
              <div className="space-y-4 mb-10">
                {slots.slice(0, 4).map((s) => (
                  <div key={s.id} className={`flex justify-between items-center p-5 rounded-2xl border transition-all ${(!s.unlimited_participants && (s.available_participants ?? 0) <= LOW_CAPACITY) ? "bg-[#F72585]/5 border-[#F72585]/30" : "bg-black/20 border-white/5"}`}>
                    <div>
                      <p className="text-white font-black italic uppercase text-sm tracking-tight">{s.date}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{s.start_time} — {s.end_time}</p>
                    </div>
                    <div className={`px-3 py-1.5 rounded-full text-[9px] font-black tracking-tighter ${(!s.unlimited_participants && (s.available_participants ?? 0) <= LOW_CAPACITY) ? "bg-[#F72585] text-white" : "bg-white/5 text-slate-400"}`}>
                      {s.unlimited_participants ? "∞ SLOTS" : `${s.available_participants} LEFT`}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-end mb-8 px-2">
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Entry Fee</p>
                  <p className="text-4xl font-black italic text-white leading-none">₹{event?.price}</p>
                </div>
                <div className="text-right"><span className="text-[10px] font-black text-pink-500 uppercase tracking-widest flex items-center gap-2"><Sparkles size={12} /> Priority Access</span></div>
              </div>
              <motion.button onClick={onInitializeBooking} whileHover={{ scale: 1.02, backgroundColor: "#fff", color: "#000" }} whileTap={{ scale: 0.98 }} className="w-full bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-3">Initialize Access</motion.button>
            </motion.div>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {openCount && <ParticipantCountModal open={openCount} onClose={() => setOpenCount(false)} constraint={session.constraint} onChoose={handleCountSelection} />}
        {openDetails && <ParticipantDetailsModal open={openDetails} onClose={() => setOpenDetails(false)} count={session.count} onComplete={handleDetailsCompletion} />}
        {openSlot && <SlotPickModal open={openSlot} onClose={() => setOpenSlot(false)} event={session.event} participantsCount={session.count} onPick={handleSlotSelection} fetchSlots={fetchSlotsData} />}
      </AnimatePresence>

      <AnimatePresence>
        {alert.open && (
          <motion.div initial={{ opacity: 0, y: 50, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, scale: 0.9, x: "-50%" }} className={`fixed bottom-10 left-1/2 z-[100] px-8 py-4 rounded-2xl border backdrop-blur-xl flex items-center gap-4 ${alert.severity === 'error' ? 'bg-rose-500/20 border-rose-500 text-rose-200' : 'bg-purple-500/20 border-purple-500 text-purple-100'}`}>
            <div className={`w-2 h-2 rounded-full animate-ping ${alert.severity === 'error' ? 'bg-rose-500' : 'bg-purple-500'}`} />
            <span className="text-[11px] font-black uppercase tracking-widest">{alert.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InteractiveCard({ icon, label, value, color, isVenue = false }) {
  return (
    <motion.div whileHover={{ y: -5, borderColor: color }} className="p-6 bg-white/5 border border-white/5 rounded-[2rem] transition-all group relative overflow-hidden">
      <div className="relative z-10">
        <div className="mb-3 text-slate-500 group-hover:text-white transition-colors">{React.cloneElement(icon, { size: 22 })}</div>
        <p className="text-[8px] font-black tracking-[0.3em] text-slate-500 uppercase mb-1">{label}</p>
        <p className={`text-white font-black italic uppercase tracking-tighter leading-tight ${isVenue ? 'text-sm md:text-base' : 'text-base truncate'}`}>{value}</p>
      </div>
    </motion.div>
  );
}