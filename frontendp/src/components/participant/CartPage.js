import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  Save,
  Plus,
  RefreshCw,
  ArrowRight,
  Ticket,
  Zap,
  Activity,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import ParticipantService from "./ParticipantService";
import ParticipantDetailsModal from "./modals/ParticipantDetailsModal";
import SlotPickModal from "./modals/SlotPickModal";

export default function CartPage() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ open: false, message: "", kind: "success" });

  const [constraints, setConstraints] = useState({});
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addModalCount, setAddModalCount] = useState(0);
  const [addTargetItem, setAddTargetItem] = useState(null);

  const [slotModalOpen, setSlotModalOpen] = useState(false);
  const [slotTargetItem, setSlotTargetItem] = useState(null);
  const [slotTeamCount, setSlotTeamCount] = useState(0);

  const showToast = useCallback((msg, kind = "success") => {
    setToast({ open: true, message: msg, kind });
    setTimeout(() => setToast((s) => ({ ...s, open: false })), 3500);
  }, []);

  const loadCart = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ParticipantService.getCart();
      setCart(res.data);
    } catch (err) {
      showToast("Link_Error: Sync Failed", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const getConstraint = async (eventId) => {
    if (constraints[eventId] !== undefined) return constraints[eventId];
    try {
      const res = await ParticipantService.getConstraintForEvent(eventId);
      const c = res.data && res.data.length > 0 ? res.data[0] : null;
      setConstraints((prev) => ({ ...prev, [eventId]: c }));
      return c;
    } catch {
      setConstraints((prev) => ({ ...prev, [eventId]: null }));
      return null;
    }
  };

  const canEditCount = (constraint) => {
    if (!constraint) return false;
    if (constraint.booking_type === "single") return false;
    if (constraint.booking_type === "multiple" && constraint.fixed) return false;
    return true;
  };

  const validateCount = (constraint, newCount) => {
    if (!constraint || constraint.booking_type === "single") {
      return newCount === 1 ? null : "SINGLE_ACCESS_ONLY";
    }
    if (constraint.booking_type === "multiple" && constraint.fixed) {
      const target = constraint.upper_limit || 1;
      return newCount === target ? null : `TARGET_FIXED: ${target}`;
    }
    if (constraint.booking_type === "multiple" && !constraint.fixed) {
      const lo = constraint.lower_limit ?? 1;
      const hi = constraint.upper_limit ?? 1;
      if (newCount < lo || newCount > hi) return `LIMITS: ${lo}-${hi}`;
      return null;
    }
    return "INVALID_PROTOCOL";
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("PURGE NODE FROM CART?")) return;
    try {
      await ParticipantService.deleteCartItem(itemId);
      await loadCart();
      showToast("NODE_PURGED", "success");
    } catch (err) {
      showToast("PURGE_FAILED", "error");
    }
  };

  const handleSaveParticipant = async (p) => {
    if (!p.name?.trim()) return showToast("LABEL_REQUIRED", "error");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (p.email && !emailRegex.test(p.email)) {
      return showToast("INVALID_EMAIL_FORMAT", "error");
    }

    try {
      await ParticipantService.updateTempBooking(p.id, {
        name: p.name,
        email: p.email || null,
        phone_number: p.phone_number || null,
      });
      showToast("SYNC_COMPLETE", "success");
      await loadCart();
    } catch (err) {
      const backendMsg = err.response?.data?.email?.[0] || err.response?.data?.detail || "SYNC_FAILED";
      showToast(backendMsg.toUpperCase().replace(/\s/g, '_'), "error");
    }
  };

  const handleAddOneParticipant = async (item) => {
    const c = await getConstraint(item.event);
    if (!canEditCount(c)) return showToast("SCALE_LOCKED", "error");
    const newCount = item.participants_count + 1;
    const err = validateCount(c, newCount);
    if (err) return showToast(err, "error");

    setAddTargetItem(item);
    setAddModalCount(1);
    setAddModalOpen(true);
  };

  const onAddParticipantsCollected = async (list) => {
    const item = addTargetItem;
    if (!item) return;
    try {
      await ParticipantService.updateCartItem(item.id, { participants_count: item.participants_count + list.length });
      for (const p of list) {
        await ParticipantService.createTempBooking({
          cart_item: item.id,
          name: p.name,
          email: p.email || null,
          phone_number: p.phone_number || null,
        });
      }
      await loadCart();
      showToast("UNITS_ADDED", "success");
      setAddTargetItem(null);
      setAddModalOpen(false);
    } catch (err) {
      showToast("ADD_FAILED", "error");
    }
  };

  const [countDraft, setCountDraft] = useState({});
  const handleCountDraftChange = (itemId, val) => setCountDraft((prev) => ({ ...prev, [itemId]: val }));

  const handleSaveCount = async (item) => {
    const target = Number(countDraft[item.id] ?? item.participants_count);
    const c = await getConstraint(item.event);
    const err = validateCount(c, target);
    if (err) return showToast(err, "error");
    if (target === item.participants_count) return;

    try {
      if (target < item.participants_count) {
        const toDelete = item.temp_participants.slice(-(item.participants_count - target));
        for (const p of toDelete) await ParticipantService.deleteTempBooking(p.id);
        await ParticipantService.updateCartItem(item.id, { participants_count: target });
        await loadCart();
        showToast("SCALED_DOWN", "success");
      } else {
        setAddTargetItem(item);
        setAddModalCount(target - item.participants_count);
        setAddModalOpen(true);
      }
    } catch (err) {
      showToast("SCALE_FAILED", "error");
    }
  };

  const handleChangeSlot = (item) => {
    setSlotTargetItem(item);
    setSlotTeamCount(item.participants_count);
    setSlotModalOpen(true);
  };

  const onSlotPicked = async (slot) => {
    const item = slotTargetItem;
    if (!item) return;
    try {
      if (item.temp_timeslot) {
        await ParticipantService.updateTempTimeslot(item.temp_timeslot.id, { cart_item: item.id, slot: slot.id });
      } else {
        await ParticipantService.createTempTimeslot({ cart_item: item.id, slot: slot.id });
      }
      setSlotTargetItem(null);
      setSlotModalOpen(false);
      await loadCart();
      showToast("SECTOR_UPDATED", "success");
    } catch (err) {
      showToast("UPDATE_FAILED", "error");
    }
  };

  const lineTotal = (item) => Number(item.event_price || 0) * Number(item.participants_count || 0);
  const grandTotal = cart?.items?.reduce((sum, it) => sum + lineTotal(it), 0) || 0;

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#F72585] py-16 px-4">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#1a101a_0%,#050505_100%)] opacity-70" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.header initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="mb-14">
          <h1 className="text-4xl md:text-8xl font-[1000] uppercase tracking-tighter leading-none">
            Cart <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F72585] via-[#9155FD] to-[#4CC9F0] italic">Page</span>
          </h1>
        </motion.header>

        {loading ? (
          <div className="flex flex-col items-center py-48">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-14 h-14 border-4 border-[#F72585] border-t-transparent rounded-full mb-6" />
            <p className="text-[12px] tracking-[0.5em] text-[#F72585] font-black animate-pulse">SYNCHRONIZING_DATA...</p>
          </div>
        ) : !cart || !cart.items?.length ? (
          <div className="text-center py-48 border-2 border-dashed border-white/5 bg-white/[0.01] rounded-[50px]">
            <Zap className="mx-auto text-white/5 mb-6" size={64} />
            <p className="text-white/20 font-black uppercase tracking-[0.5em] text-lg">CART_EMPTY_</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-8">
              {cart.items.map((item) => (
                <motion.div key={item.id} layout initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0a0a0a] border-2 border-white/10 rounded-3xl md:rounded-[40px] overflow-hidden group hover:border-[#F72585]/40 transition-all shadow-2xl">
                  <div className="p-6 md:p-10">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
                      <div>
                        <div className="flex items-center gap-2 text-[#4CC9F0] mb-3">
                          <Activity size={14} className="stroke-[3px]" />
                          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em]">PROTOCOL_NODE</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-[1000] uppercase tracking-tighter leading-tight group-hover:italic transition-all">{item.event_name}</h2>
                        <div className="inline-block mt-4 px-4 py-1.5 bg-white/5 rounded-full border border-white/10">
                          <p className="text-[10px] md:text-[11px] text-[#00FF41] font-black uppercase tracking-widest">Rate: ₹{Number(item.event_price).toFixed(2)} / UNIT</p>
                        </div>
                      </div>
                      <div className="text-left md:text-right">
                        <span className="text-[10px] md:text-[11px] font-black text-white/30 uppercase tracking-[0.3em]">LINE_TOTAL</span>
                        <div className="text-3xl md:text-4xl font-[1000] italic text-white mt-1">₹{lineTotal(item).toFixed(2)}</div>
                      </div>
                    </div>

                    <div className="space-y-10 border-t-2 border-white/5 pt-10">
                      <div className="flex flex-col md:flex-row md:items-end gap-6">
                        <div className="flex-1 w-full">
                          <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-3 block">SCALE_UNITS</span>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <input
                              type="number"
                              value={countDraft[item.id] ?? item.participants_count}
                              onChange={(e) => handleCountDraftChange(item.id, e.target.value.replace(/\D/g, ""))}
                              className="bg-white/5 border-2 border-white/10 rounded-2xl px-6 py-3 text-white font-black text-xl w-full sm:w-32 focus:outline-none focus:border-[#F72585] transition-all"
                            />
                            <button onClick={() => handleSaveCount(item)} className="bg-white text-black px-8 py-3 rounded-2xl font-[1000] text-xs uppercase hover:bg-[#F72585] hover:text-white transition-all shadow-lg active:scale-95 w-full sm:w-auto">UPDATE_SCALE</button>
                          </div>
                        </div>
                        <div className="flex gap-4 w-full md:w-auto">
                          <button onClick={() => handleAddOneParticipant(item)} className="flex-1 md:flex-none bg-[#9155FD]/10 text-[#9155FD] p-4 rounded-2xl hover:bg-[#9155FD] hover:text-white transition-all border-2 border-[#9155FD]/30 active:scale-90 flex justify-center"><Plus size={24} className="stroke-[3px]" /></button>
                          <button onClick={() => handleDeleteItem(item.id)} className="flex-1 md:flex-none bg-[#F72585]/10 text-[#F72585] p-4 rounded-2xl hover:bg-[#F72585] hover:text-white transition-all border-2 border-[#F72585]/30 active:scale-90 flex justify-center"><Trash2 size={24} className="stroke-[3px]" /></button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] block">ASSIGNED_IDENTITIES</span>
                        {item.temp_participants.map((p) => (
                          <div key={p.id} className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            <input placeholder="LABEL (NAME)" className="md:col-span-3 bg-white/[0.04] border-2 border-white/5 rounded-2xl px-5 py-3 text-sm font-black focus:border-[#4CC9F0] outline-none transition-all" value={p.name} onChange={(e) => { p.name = e.target.value; setCart({ ...cart }); }} />
                            <input placeholder="CHANNEL (EMAIL)" className="md:col-span-4 bg-white/[0.04] border-2 border-white/5 rounded-2xl px-5 py-3 text-sm font-black focus:border-[#4CC9F0] outline-none transition-all" value={p.email || ""} onChange={(e) => { p.email = e.target.value; setCart({ ...cart }); }} />
                            <input placeholder="NODE (PHONE)" className="md:col-span-3 bg-white/[0.04] border-2 border-white/5 rounded-2xl px-5 py-3 text-sm font-black focus:border-[#4CC9F0] outline-none transition-all" value={p.phone_number || ""} onChange={(e) => { p.phone_number = e.target.value; setCart({ ...cart }); }} />
                            <button onClick={() => handleSaveParticipant(p)} className="md:col-span-2 bg-white/5 hover:bg-[#00FF41]/20 border-2 border-white/10 rounded-2xl flex items-center justify-center transition-all group/save"><Save size={20} className="text-[#00FF41] stroke-[3px]" /></button>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 bg-white/[0.03] p-6 sm:p-8 rounded-3xl md:rounded-[30px] border-2 border-white/5">
                        <div className="flex items-center gap-4 sm:gap-6">
                          <div className="p-3 sm:p-4 bg-white/5 rounded-2xl text-[#9155FD] shadow-inner"><Calendar size={24} className="stroke-[2.5px]" /></div>
                          <div>
                            <span className="text-[9px] sm:text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-1 block">TEMPORAL_ASSIGNMENT</span>
                            {item.temp_timeslot?.slot_info ? (
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-white">
                                <span className="text-base sm:text-lg font-black">{item.temp_timeslot.slot_info.date}</span>
                                <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-[#9155FD]" />
                                <span className="text-base sm:text-lg font-black italic">{item.temp_timeslot.slot_info.start_time} - {item.temp_timeslot.slot_info.end_time}</span>
                              </div>
                            ) : (
                              <div className="flex flex-col">
                                <span className="text-base sm:text-lg font-black text-[#F72585] uppercase">SLOT_REQUIRED</span>
                                <span className="text-[9px] text-white/20 font-bold">PLEASE_ASSIGN_A_TIME_SECTOR</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleChangeSlot(item)}
                          className="w-full xl:w-auto bg-white/5 hover:bg-white text-white hover:text-black border-2 border-white/10 px-8 py-3 rounded-2xl text-[10px] sm:text-xs font-[1000] uppercase tracking-widest transition-all active:scale-95"
                        >
                          REASSIGN_SECTOR
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="lg:col-span-4">
              <div className="sticky top-12 space-y-8">
                <div className="bg-[#0a0a0a] border-2 border-white/10 rounded-3xl md:rounded-[45px] p-6 md:p-10 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Ticket size={120} />
                  </div>

                  <div className="flex items-center gap-4 mb-8">
                    <Ticket className="text-[#F72585] stroke-[3px]" size={22} />
                    <h3 className="text-lg font-[1000] uppercase tracking-[0.3em]">BILL_SUMMARY</h3>
                  </div>

                  <div className="space-y-5 mb-10">
                    {cart.items.map((it) => (
                      <div key={it.id} className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest text-white/50 gap-4">
                        <span className="truncate max-w-[160px]">{it.event_name} <span className="text-[#9155FD]">x{it.participants_count}</span></span>
                        <span className="text-white shrink-0">₹{lineTotal(it).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t-2 border-white/5 pt-8 mb-10">
                    <div className="flex justify-between items-end gap-4">
                      <span className="text-[11px] font-black text-[#F72585] uppercase tracking-[0.4em]">GRAND_TOTAL</span>
                      <span className="text-3xl sm:text-5xl font-[1000] italic leading-none tracking-tighter">₹{grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate("/checkout")}
                    className="w-full py-5 sm:py-6 rounded-2xl md:rounded-[25px] bg-white text-black font-[1000] uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[12px] sm:text-sm flex items-center justify-center gap-4 hover:bg-[#F72585] hover:text-white transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[#F72585]/40"
                  >
                    CHECKOUT <ArrowRight size={22} className="stroke-[3px]" />
                  </button>
                </div>

                <div className="flex gap-4">
                  <button onClick={loadCart} className="flex-1 bg-white/[0.04] border-2 border-white/10 py-5 rounded-[25px] text-[10px] font-black uppercase tracking-[0.4em] hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                    <RefreshCw size={16} /> REFRESH_SYSTEM
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {addTargetItem && (
        <ParticipantDetailsModal
          open={addModalOpen}
          onClose={() => { setAddModalOpen(false); setAddTargetItem(null); }}
          count={addModalCount}
          onComplete={onAddParticipantsCollected}
        />
      )}
      {slotTargetItem && (
        <SlotPickModal
          open={slotModalOpen}
          onClose={() => { setSlotModalOpen(false); setSlotTargetItem(null); }}
          event={{ id: slotTargetItem.event, name: slotTargetItem.event_name }}
          participantsCount={slotTeamCount}
          onPick={onSlotPicked}
          fetchSlots={(eventId) => ParticipantService.getEventSlots(eventId)}
        />
      )}

      <AnimatePresence>
        {toast.open && (
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className={`fixed right-10 bottom-10 z-[100] px-8 py-5 rounded-2xl border-2 font-[1000] text-[11px] tracking-[0.3em] uppercase flex items-center gap-4 bg-black shadow-2xl ${toast.kind === "success" ? "border-[#00FF41] text-[#00FF41]" : "border-[#F72585] text-[#F72585]"}`}>
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
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>
    </div>
  );
}