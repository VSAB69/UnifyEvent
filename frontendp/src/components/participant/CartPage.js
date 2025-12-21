// src/components/participant/CartPage.jsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  Save,
  Plus,
  MinusCircle,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import ParticipantService from "./ParticipantService";
import ParticipantDetailsModal from "./modals/ParticipantDetailsModal";
import SlotPickModal from "./modals/SlotPickModal";

/**
 * Reworked CartPage — Flat purple/pink theme (NO gradients)
 * - Theme B chosen: stronger, flat color surfaces (purple + pink)
 * - Preserves all logic, API calls & modal behavior
 * - Adds nicer spacing, shadows, consistent borders and micro-animations
 */

export default function CartPage() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    kind: "success",
  });

  // constraints cache { [eventId]: constraintObj|null }
  const [constraints, setConstraints] = useState({});

  // for adding extra participants (delta)
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addModalCount, setAddModalCount] = useState(0);
  const [addTargetItem, setAddTargetItem] = useState(null);

  // for changing slot
  const [slotModalOpen, setSlotModalOpen] = useState(false);
  const [slotTargetItem, setSlotTargetItem] = useState(null);
  const [slotTeamCount, setSlotTeamCount] = useState(0);

  useEffect(() => {
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCart = async () => {
    setLoading(true);
    try {
      const res = await ParticipantService.getCart();
      setCart(res.data);
    } catch (err) {
      console.error("loadCart", err);
      showToast("Failed to load cart", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, kind = "success") => {
    setToast({ open: true, message: msg, kind });
    setTimeout(() => setToast((s) => ({ ...s, open: false })), 3500);
  };

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
    if (!constraint) return false; // single
    if (constraint.booking_type === "single") return false;
    if (constraint.booking_type === "multiple" && constraint.fixed)
      return false;
    return true;
  };

  const validateCount = (constraint, newCount) => {
    if (!constraint || constraint.booking_type === "single") {
      return newCount === 1 ? null : "This event allows only one participant.";
    }
    if (constraint.booking_type === "multiple" && constraint.fixed) {
      const target = constraint.upper_limit || 1;
      return newCount === target
        ? null
        : `This fixed event requires exactly ${target} participants.`;
    }
    if (constraint.booking_type === "multiple" && !constraint.fixed) {
      const lo = constraint.lower_limit ?? 1;
      const hi = constraint.upper_limit ?? 1;
      if (newCount < lo || newCount > hi) {
        return `Team size must be between ${lo} and ${hi}.`;
      }
      return null;
    }
    return "Invalid constraint.";
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Remove this event from cart?")) return;
    try {
      await ParticipantService.deleteCartItem(itemId);
      await loadCart();
      showToast("Removed from cart", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to remove item", "error");
    }
  };

  const handleSaveParticipant = async (p) => {
    if (!p.name || !p.name.trim())
      return showToast("Participant name is required", "error");
    try {
      await ParticipantService.updateTempBooking(p.id, {
        name: p.name,
        email: p.email || null,
        phone_number: p.phone_number || null,
      });
      showToast("Saved.", "success");
      await loadCart();
    } catch (err) {
      console.error(err);
      showToast("Failed to save participant", "error");
    }
  };

  const handleRemoveParticipant = async (item, participant) => {
    const c = await getConstraint(item.event);
    if (!canEditCount(c)) {
      return showToast("Cannot remove participants for this event", "error");
    }
    const newCount = item.participants_count - 1;
    const err = validateCount(c, newCount);
    if (err) return showToast(err, "error");

    try {
      await ParticipantService.deleteTempBooking(participant.id);
      await ParticipantService.updateCartItem(item.id, {
        participants_count: newCount,
      });
      await loadCart();
      showToast("Participant removed", "success");
    } catch (e) {
      console.error(e);
      showToast("Failed to remove participant", "error");
    }
  };

  const handleAddOneParticipant = async (item) => {
    const c = await getConstraint(item.event);
    if (!canEditCount(c)) {
      return showToast("Cannot add participants for this event", "error");
    }
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
    const extra = list.length;

    try {
      await ParticipantService.updateCartItem(item.id, {
        participants_count: item.participants_count + extra,
      });

      for (const p of list) {
        await ParticipantService.createTempBooking({
          cart_item: item.id,
          name: p.name,
          email: p.email || null,
          phone_number: p.phone_number || null,
        });
      }

      // After adding, check slot availability for assigned slot (if any)
      const updatedCart = (await ParticipantService.getCart()).data;
      const updatedItem = updatedCart.items.find((ci) => ci.id === item.id);
      if (updatedItem?.temp_timeslot?.slot) {
        const slotRes = await ParticipantService.getEventSlotById(
          updatedItem.temp_timeslot.slot
        );
        const s = slotRes.data;
        if (!s.unlimited_participants) {
          const need = updatedItem.participants_count;
          if ((s.available_participants ?? 0) < need) {
            setSlotTargetItem(updatedItem);
            setSlotTeamCount(need);
            setSlotModalOpen(true);
            setAddModalOpen(false);
            await loadCart();
            return;
          }
        }
      }

      setAddTargetItem(null);
      setAddModalOpen(false);
      await loadCart();
      showToast("Participant(s) added", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to add participants", "error");
    }
  };

  // Manage drafts for counts
  const [countDraft, setCountDraft] = useState({});
  const handleCountDraftChange = (itemId, val) => {
    setCountDraft((prev) => ({ ...prev, [itemId]: val }));
  };

  const handleSaveCount = async (item) => {
    const target = Number(countDraft[item.id] ?? item.participants_count);
    const c = await getConstraint(item.event);
    const err = validateCount(c, target);
    if (err) return showToast(err, "error");

    const current = item.participants_count;
    if (target === current) return;

    try {
      if (target < current) {
        const delta = current - target;
        const toDelete = item.temp_participants.slice(-delta);
        for (const p of toDelete) {
          await ParticipantService.deleteTempBooking(p.id);
        }
        await ParticipantService.updateCartItem(item.id, {
          participants_count: target,
        });
        await loadCart();
        showToast("Updated team size", "success");
        return;
      }

      if (target > current) {
        const delta = target - current;
        setAddTargetItem(item);
        setAddModalCount(delta);
        setAddModalOpen(true);
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to update team size", "error");
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
        await ParticipantService.updateTempTimeslot(item.temp_timeslot.id, {
          cart_item: item.id,
          slot: slot.id,
        });
      } else {
        await ParticipantService.createTempTimeslot({
          cart_item: item.id,
          slot: slot.id,
        });
      }
      setSlotTargetItem(null);
      setSlotModalOpen(false);
      await loadCart();
      showToast("Slot updated", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to update slot", "error");
    }
  };

  // price helpers
  const lineTotal = (item) =>
    Number(item.event_price || 0) * Number(item.participants_count || 0) || 0;
  const grandTotal =
    cart?.items?.reduce((sum, it) => sum + lineTotal(it), 0) || 0;

  // UI Animations - variants
  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } },
  };
  const cardVariant = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.h1
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl sm:text-4xl font-extrabold mb-6 text-purple-900"
      >
        Your Cart
      </motion.h1>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div
            className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: "#8b5cf6" }}
          />
        </div>
      ) : !cart || !cart.items?.length ? (
        <div className="text-center py-20 text-gray-500">
          Your cart is empty.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Items (span 8 on large) */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="lg:col-span-8 space-y-4"
          >
            {cart.items.map((item) => (
              <motion.div
                key={item.id}
                variants={cardVariant}
                whileHover={{ scale: 1.01 }}
                className="rounded-2xl border border-purple-200 shadow-sm bg-white overflow-hidden"
              >
                <div className="p-5">
                  {/* Header row */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold text-purple-900">
                        {item.event_name}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Price per participant:{" "}
                        <span className="font-medium text-gray-800">
                          ₹{Number(item.event_price || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-sm text-gray-600 text-right">
                        <div className="font-semibold">Cost</div>
                        <div className="text-lg font-bold text-gray-900">
                          ₹ {lineTotal(item).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-dashed border-purple-100 pt-4 space-y-4">
                    {/* Team size editor */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="text-sm text-gray-800 font-medium">
                          Team Size
                        </div>
                        <input
                          type="number"
                          min="1"
                          value={countDraft[item.id] ?? item.participants_count}
                          onChange={(e) =>
                            handleCountDraftChange(
                              item.id,
                              e.target.value.replace(/\D/g, "")
                            )
                          }
                          className="w-28 px-3 py-2 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-200"
                        />
                        <button
                          onClick={() => handleSaveCount(item)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-700 text-white font-semibold hover:bg-purple-800 transition-shadow shadow"
                        >
                          <Save className="w-4 h-4" /> Save
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="px-3 py-2 rounded-lg bg-white border border-red-100 text-red-600 hover:bg-red-50 inline-flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" /> Remove
                        </button>
                        <button
                          onClick={() => handleAddOneParticipant(item)}
                          className="px-3 py-2 rounded-lg bg-pink-700 text-white hover:bg-pink-800 inline-flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" /> Add participant
                        </button>
                      </div>
                    </div>

                    {/* Participants list */}
                    <div>
                      <div className="text-sm font-medium text-gray-800 mb-2">
                        Participants
                      </div>
                      <div className="space-y-3">
                        {item.temp_participants.map((p) => (
                          <div
                            key={p.id}
                            className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center"
                          >
                            <input
                              className="md:col-span-3 px-3 py-2 rounded-lg border border-purple-100"
                              placeholder="Name"
                              value={p.name}
                              onChange={(e) => {
                                p.name = e.target.value;
                                setCart({ ...cart });
                              }}
                            />
                            <input
                              className="md:col-span-3 px-3 py-2 rounded-lg border border-purple-100"
                              placeholder="Email"
                              value={p.email || ""}
                              onChange={(e) => {
                                p.email = e.target.value;
                                setCart({ ...cart });
                              }}
                            />
                            <input
                              className="md:col-span-3 px-3 py-2 rounded-lg border border-purple-100"
                              placeholder="Phone"
                              value={p.phone_number || ""}
                              onChange={(e) => {
                                p.phone_number = e.target.value;
                                setCart({ ...cart });
                              }}
                            />
                            <div className="md:col-span-3 flex items-center gap-2">
                              <button
                                onClick={() => handleSaveParticipant(p)}
                                className="px-3 py-2 rounded-lg bg-purple-700 text-white inline-flex items-center gap-2"
                              >
                                <Save className="w-4 h-4" /> Save
                              </button>
                              <button
                                onClick={() => handleRemoveParticipant(item, p)}
                                className="px-3 py-2 rounded-lg bg-white border border-red-100 text-red-600 inline-flex items-center gap-2"
                              >
                                <MinusCircle className="w-4 h-4" /> Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Slot & Change */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium text-gray-800">
                          Selected Slot
                        </div>
                        {item.temp_timeslot ? (
                          <div className="text-sm text-gray-800 mt-1">
                            Slot #{item.temp_timeslot.slot}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500 mt-1">
                            No slot selected
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleChangeSlot(item)}
                          className="px-3 py-2 rounded-lg bg-white border border-purple-200 text-purple-800 inline-flex items-center gap-2"
                        >
                          <RefreshCw className="w-4 h-4" /> Change Slot
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Right: Summary (span 4 on large) */}
          <div className="lg:col-span-4">
            <div className="sticky top-6">
              <div className="rounded-2xl p-5 border border-purple-200 bg-purple-50 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-lg font-semibold text-purple-900">
                      Cart Summary
                    </div>
                    <div className="text-sm text-gray-700">
                      Review & checkout
                    </div>
                  </div>
                </div>

                <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                  {cart.items.map((it) => (
                    <div
                      key={it.id}
                      className="flex items-start justify-between gap-2 py-2"
                    >
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {it.event_name} × {it.participants_count}
                        </div>
                        <div className="text-xs text-gray-600">
                          ₹{Number(it.event_price || 0).toFixed(2)} / p
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        ₹ {lineTotal(it).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 border-t border-dashed border-purple-100 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-semibold">Total</div>
                    <div className="text-2xl font-extrabold text-purple-900">
                      ₹ {grandTotal.toFixed(2)}
                    </div>
                  </div>

                  <button
                    onClick={() => navigate("/checkout")}
                    className="w-full mt-4 py-3 rounded-xl bg-purple-700 text-white font-semibold inline-flex items-center justify-center gap-2 hover:bg-purple-800 transition-shadow shadow"
                  >
                    Proceed to Checkout <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Small actions */}
              <div className="mt-4 flex gap-3">
                <button
                  onClick={loadCart}
                  className="flex-1 px-4 py-2 rounded-lg bg-white border border-purple-200 inline-flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> Refresh
                </button>
                <button
                  onClick={() => {
                    setCart(null);
                    showToast("Cleared (demo)", "info");
                  }}
                  className="flex-1 px-4 py-2 rounded-lg bg-white border border-red-100 text-red-600 inline-flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add extra participants modal */}
      {addTargetItem && (
        <ParticipantDetailsModal
          open={addModalOpen}
          onClose={() => {
            setAddModalOpen(false);
            setAddTargetItem(null);
          }}
          count={addModalCount}
          onComplete={onAddParticipantsCollected}
        />
      )}

      {/* Change slot modal */}
      {slotTargetItem && (
        <SlotPickModal
          open={slotModalOpen}
          onClose={() => {
            setSlotModalOpen(false);
            setSlotTargetItem(null);
          }}
          event={{ id: slotTargetItem.event, name: slotTargetItem.event_name }}
          participantsCount={slotTeamCount}
          onPick={onSlotPicked}
          fetchSlots={(eventId) => ParticipantService.getEventSlots(eventId)}
        />
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast.open && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`fixed right-6 bottom-6 z-50 rounded-xl px-5 py-3 shadow-xl text-white ${
              toast.kind === "success"
                ? "bg-green-500"
                : toast.kind === "error"
                ? "bg-red-500"
                : "bg-indigo-500"
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
