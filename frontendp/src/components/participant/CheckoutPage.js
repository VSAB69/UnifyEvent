// src/components/participant/CheckoutPage.jsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

import ParticipantService from "./ParticipantService";

/**
 * Updated CheckoutPage
 * - Flat purple / pink theme (NO gradients)
 * - Clean, premium cards, subtle shadows, motion micro-interactions
 * - Preserves all existing business logic & API calls
 */

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

  const loadCart = async () => {
    setLoading(true);
    try {
      const res = await ParticipantService.getCart();
      setCart(res.data);
    } catch (e) {
      showToast("Failed to load cart", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const lineTotal = (item) =>
    Number(item.event_price || 0) * Number(item.participants_count || 0);

  const grandTotal =
    cart?.items?.reduce((sum, it) => sum + lineTotal(it), 0) || 0;

  const handlePlaceBooking = async () => {
    try {
      const res = await ParticipantService.placeBooking();
      const bookingId = res.data.id;
      nav(`/booking-success/${bookingId}`);
    } catch (err) {
      showToast(
        err?.response?.data?.detail || "Failed to place booking",
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
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div
          className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: "#7c3aed" }}
          aria-hidden
        />
      </div>
    );
  }

  if (!cart?.items?.length) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 text-center">
        <div className="text-xl text-gray-600 mb-6">Your cart is empty.</div>

        <button
          onClick={() => nav("/cart")}
          className="px-6 py-3 rounded-xl bg-purple-700 text-white font-semibold inline-flex items-center gap-2 hover:bg-purple-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Cart
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.h1
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl sm:text-4xl font-extrabold mb-8 text-purple-900"
      >
        Checkout
      </motion.h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Order summary */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="lg:col-span-8 space-y-5"
        >
          <motion.div
            variants={cardVariant}
            className="rounded-2xl border border-purple-100 bg-white shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-xl font-semibold text-purple-900">
                Order Summary
              </div>
              <div className="inline-flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-1 rounded-full">
                <CheckCircle className="w-4 h-4" /> Ready
              </div>
            </div>

            {cart.items.map((item) => (
              <div
                key={item.id}
                className="border-b border-gray-100 pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="text-lg font-bold text-gray-900">
                      {item.event_name}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      ₹{Number(item.event_price).toFixed(2)} per participant
                    </div>

                    <div className="mt-3 text-sm text-gray-700">
                      <span className="font-medium">Team size:</span>{" "}
                      <span className="ml-1">{item.participants_count}</span>
                    </div>

                    <div className="mt-1 text-sm text-gray-700">
                      <span className="font-medium">Slot:</span>{" "}
                      <span className="ml-1 font-semibold text-gray-800">
                        {item.temp_timeslot
                          ? `Slot #${item.temp_timeslot.slot}`
                          : "Not selected"}
                      </span>
                    </div>
                  </div>

                  <div className="text-right w-36">
                    <div className="text-lg font-extrabold text-gray-900">
                      ₹ {lineTotal(item).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      {item.temp_participants?.length ?? 0} participants
                    </div>
                  </div>
                </div>

                {/* Participants list */}
                {item.temp_participants?.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {item.temp_participants.map((p) => (
                      <div
                        key={p.id}
                        className="px-3 py-2 bg-gray-50 rounded-md flex items-center justify-between text-sm"
                      >
                        <div className="truncate">
                          <span className="font-medium">{p.name}</span>{" "}
                          <span className="text-gray-500">
                            · {p.email || "No email"}
                          </span>
                        </div>
                        <div className="text-gray-500 text-xs">
                          {p.phone_number || "No phone"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="text-right text-2xl font-extrabold text-purple-900 mt-4">
              Total: ₹ {grandTotal.toFixed(2)}
            </div>
          </motion.div>
        </motion.div>

        {/* Right: Booking action */}
        <motion.div
          variants={cardVariant}
          initial="hidden"
          animate="visible"
          className="lg:col-span-4"
        >
          <div className="sticky top-8">
            <div className="rounded-2xl border border-purple-100 bg-white shadow-md p-6">
              <div className="text-lg font-semibold text-purple-900 mb-3">
                Payment
              </div>

              <div className="text-sm text-gray-600 mb-6">
                We'll integrate payments soon. For now, complete booking for
                free.
              </div>

              <button
                onClick={handlePlaceBooking}
                className="w-full py-3 rounded-xl bg-purple-700 text-white text-lg font-semibold shadow hover:bg-purple-800 transition inline-flex items-center justify-center gap-2"
              >
                Book Now
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => nav("/cart")}
                className="w-full mt-3 py-3 rounded-xl bg-white border border-purple-200 text-purple-700 font-semibold hover:bg-purple-50 inline-flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Cart
              </button>

              <div className="mt-4 text-xs text-gray-500">
                By placing the booking you agree to our terms & conditions.
              </div>
            </div>

            {/* small summary card */}
            <motion.div
              whileHover={{ translateY: -4 }}
              className="mt-4 rounded-xl border border-purple-100 bg-purple-50 p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">Items</div>
                <div className="text-sm font-semibold text-gray-900">
                  {cart.items.length}
                </div>
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="text-sm text-gray-700">Total</div>
                <div className="text-lg font-bold text-purple-900">
                  ₹ {grandTotal.toFixed(2)}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast.open && (
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`fixed right-6 bottom-6 z-50 px-5 py-3 rounded-xl shadow-lg text-white ${
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
