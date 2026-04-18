import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Ticket, Activity, Zap, ShieldCheck, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

import ParticipantService from "./ParticipantService";

export default function CheckoutPage() {
  const nav = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  const [toast, setToast] = useState({
    open: false,
    message: "",
    kind: "success",
  });

  const showToast = (msg, kind = "success") => {
    setToast({ open: true, message: msg, kind });
    setTimeout(() => setToast((t) => ({ ...t, open: false })), 3500);
  };

  /* ─────────────────────────────────────────────
      LOAD CART
  ───────────────────────────────────────────── */
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      try {
        const res = await ParticipantService.getCart();
        setCart(res.data);
      } catch {
        showToast("LINK_ERROR: ARCHIVE_UNREACHABLE", "error");
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, []);

  const lineTotal = (item) =>
    Number(item.event_price || 0) * Number(item.participants_count || 0);

  const grandTotal =
    cart?.items?.reduce((sum, it) => sum + lineTotal(it), 0) || 0;

  const handlePlaceBooking = async () => {
    try {
      const res = await ParticipantService.placeBooking();
      if (!res || !res.data || !res.data.id) {
        showToast("PROTOCOL_SYNC_FAILURE: NO_ID", "error");
        return;
      }
      const bookingId = res.data.id;
      nav(`/booking-success/${bookingId}`);
    } catch (err) {
      showToast(
        err?.response?.data?.detail?.toUpperCase().replace(/\s/g, '_') || "PROTOCOL_FAILURE",
        "error"
      );
    }
  };

  // Motion variants
  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.05 } },
  };
  const cardVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  /* ─────────────────────────────────────────────
      LOADING STATE
  ───────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-14 h-14 rounded-full border-4 border-t-transparent border-[#F72585]"
        />
        <p className="mt-6 text-[11px] tracking-[0.5em] text-[#F72585] font-black animate-pulse uppercase">Synchronizing_Data...</p>
      </div>
    );
  }

  /* ─────────────────────────────────────────────
      EMPTY CART
  ───────────────────────────────────────────── */
  if (!cart?.items?.length) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-4 py-10 text-center">
          <Zap className="mx-auto text-white/5 mb-6" size={64} />
          <div className="text-xl font-black text-white/20 uppercase tracking-widest mb-8">Cart_Registry_Empty</div>

          <button
            onClick={() => nav("/cart")}
            className="px-8 py-4 rounded-2xl bg-white text-black font-[1000] uppercase tracking-[0.2em] text-xs inline-flex items-center gap-3 hover:bg-[#F72585] hover:text-white transition-all shadow-xl"
          >
            <ArrowLeft className="w-4 h-4 stroke-[3px]" />
            Return to Cart
          </button>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────
      MAIN UI
  ───────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#F72585] py-16 px-4">
      {/* Background Grids */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#1a101a_0%,#050505_100%)] opacity-70" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-14"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="h-[3px] w-12 bg-[#F72585]" />
            <p className="text-[11px] tracking-[0.7em] text-white/50 uppercase font-black">Secure_Checkout_v2.0</p>
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-[1000] uppercase tracking-tighter leading-none">
            Final <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F72585] via-[#9155FD] to-[#4CC9F0] italic">Review</span>
          </h1>
        </motion.header>

        <div className="grid grid-cols-1 md:grid-cols-12 md:gap-12 gap-8">
          {/* Left: Order summary */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="md:col-span-8 space-y-8 order-1"
          >
            <motion.div
              variants={cardVariant}
              className="rounded-3xl md:rounded-[40px] border-2 border-white/10 bg-[#0a0a0a] shadow-2xl p-6 md:p-10 relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <Activity className="text-[#4CC9F0] stroke-[3px]" size={20} />
                  <h2 className="text-2xl font-[1000] uppercase tracking-widest text-white">
                    Registry_Snapshot
                  </h2>
                </div>
                <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#00FF41] bg-[#00FF41]/10 border border-[#00FF41]/20 px-4 py-1.5 rounded-full">
                  <ShieldCheck size={14} className="stroke-[3px]" /> Verified
                </div>
              </div>

              <div className="space-y-8">
                {cart.items.map((item) => (
                  <div
                    key={item.id}
                    className="group border-b border-white/5 pb-8 mb-8 last:border-b-0 last:pb-0 last:mb-0"
                  >
                    <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                      <div className="flex-1 min-w-0">
                        <div className="text-2xl md:text-3xl font-[1000] uppercase tracking-tighter text-white group-hover:text-[#4CC9F0] transition-colors">
                          {item.event_name}
                        </div>
                        <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mt-2">
                          Rate: ₹{Number(item.event_price).toFixed(2)} / Unit
                        </div>

                        <div className="mt-6 flex flex-wrap gap-4">
                          <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-xs font-bold uppercase tracking-widest text-white/60">
                            <span className="text-[#9155FD]">Size:</span> {item.participants_count} Units
                          </div>
                          <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-xs font-bold uppercase tracking-widest text-white/60">
                            <span className="text-[#4CC9F0]">Slot:</span> {item.temp_timeslot?.slot_info
                              ? `${item.temp_timeslot.slot_info.date} | ${item.temp_timeslot.slot_info.start_time}`
                              : `ID_${item.temp_timeslot?.slot || 'NONE'}`}
                          </div>
                        </div>
                      </div>

                      <div className="text-right w-full md:w-44">
                        <div className="text-3xl font-[1000] italic text-white leading-none">
                          ₹{lineTotal(item).toFixed(2)}
                        </div>
                        <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mt-3">
                          {item.temp_participants?.length ?? 0} ID_ENTITIES_BOUND
                        </div>
                      </div>
                    </div>

                    {/* Bound Participants */}
                    {item.temp_participants?.length > 0 && (
                      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {item.temp_participants.map((p) => (
                          <div
                            key={p.id}
                            className="px-4 py-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest"
                          >
                            <User size={14} className="text-white/20" />
                            <div className="truncate">
                              <span className="text-white/80">{p.name}</span>
                              <span className="text-white/20 mx-2">|</span>
                              <span className="text-white/40">{p.email || "NO_CHANNEL"}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-10 pt-8 border-t-2 border-white/5 text-right flex flex-col items-end">
                <span className="text-[11px] font-black text-[#F72585] uppercase tracking-[0.4em] mb-2">Protocol_Aggregate</span>
                <div className="text-4xl md:text-5xl font-[1000] italic text-white tracking-tighter">
                  ₹ {grandTotal.toFixed(2)}
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Payment box */}
          <motion.div
            variants={cardVariant}
            initial="hidden"
            animate="visible"
            className="md:col-span-4 order-2"
          >
            <div className="sticky top-12 space-y-6 md:space-y-8">
              <div className="rounded-3xl md:rounded-[45px] border-2 border-white/10 bg-[#0a0a0a] shadow-2xl p-6 md:p-10 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 opacity-5">
                  <ShieldCheck size={180} />
                </div>

                <div className="flex items-center gap-3 text-lg font-[1000] uppercase tracking-[0.3em] mb-6">
                  <Ticket className="text-[#F72585] stroke-[3px]" size={20} />
                  Authorization
                </div>

                <div className="text-[11px] font-bold text-white/40 leading-relaxed uppercase tracking-widest mb-10">
                  Sector payments are currently <span className="text-[#00FF41]">bypassed</span>. Confirm protocol synchronization to finalize your access tokens.
                </div>

                <div className="space-y-4 mb-10">
                  <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-white/40">
                    <span>Active_Nodes</span>
                    <span className="text-white">{cart.items.length}</span>
                  </div>
                  <div className="h-[1px] bg-white/5 w-full" />
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-widest text-[#F72585]">Total_Cost</span>
                    <span className="text-3xl font-[1000] italic text-white">₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handlePlaceBooking}
                  className="w-full py-6 rounded-[25px] bg-white text-black font-[1000] uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-4 hover:bg-[#F72585] hover:text-white transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[#F72585]/40 active:scale-95"
                >
                  Confirm Booking <ArrowRight size={22} className="stroke-[3px]" />
                </button>

                <button
                  onClick={() => nav("/cart")}
                  className="w-full mt-4 py-5 rounded-[22px] bg-white/[0.04] border-2 border-white/5 text-white/60 font-black uppercase tracking-[0.3em] text-[10px] hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  <ArrowLeft size={16} /> Reconfigure Cart
                </button>

                <div className="mt-8 text-[9px] font-bold text-white/10 uppercase tracking-[0.4em] text-center">
                  By authorizing, you accept all node protocols.
                </div>
              </div>

              {/* Status Orb */}
              <div className="flex items-center justify-center gap-4 px-6 py-4 bg-white/[0.02] rounded-full border border-white/5">
                <div className="w-2 h-2 rounded-full bg-[#00FF41] animate-ping" />
                <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/30">System_Status: Optimal</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast.open && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`fixed right-10 bottom-10 z-[100] px-8 py-5 rounded-2xl border-2 font-[1000] text-[11px] tracking-[0.3em] uppercase flex items-center gap-4 bg-black shadow-2xl ${toast.kind === "success" ? "border-[#00FF41] text-[#00FF41]" : "border-[#F72585] text-[#F72585]"
              }`}
          >
            <div className={`w-2.5 h-2.5 rounded-full animate-ping ${toast.kind === "success" ? 'bg-[#00FF41]' : 'bg-[#F72585]'}`} />
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #F72585; }
      `}</style>
    </div>
  );
}