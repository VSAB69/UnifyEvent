// src/components/participant/ParentEventEventsPage.jsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Calendar, Star } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import ParticipantService from "./ParticipantService";

// Add-to-cart modals
import ParticipantCountModal from "./modals/ParticipantCountModal";
import ParticipantDetailsModal from "./modals/ParticipantDetailsModal";
import SlotPickModal from "./modals/SlotPickModal";

// View Details Modal
import EventFullDetailsModal from "./EventFullDetailsModal";

export default function ParentEventEventsPage() {
  const { parentId } = useParams();
  const nav = useNavigate();
  const { user, loading } = useAuth();

  const [events, setEvents] = useState([]);
  const [parentName, setParentName] = useState("");
  const [fetching, setFetching] = useState(true);

  // ---------- NEW BOOKING SESSION (key fix) ----------
  const initialSession = {
    event: null,
    constraint: null,
    count: 1,
    participants: [],
    slot: null,
  };

  const [session, setSession] = useState(initialSession);

  // Modals
  const [openCount, setOpenCount] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [openSlot, setOpenSlot] = useState(false);

  const [viewEvent, setViewEvent] = useState(null);

  // Toast
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showToast = (msg, sev = "success") => {
    setAlert({ open: true, message: msg, severity: sev });
    setTimeout(() => setAlert((a) => ({ ...a, open: false })), 2600);
  };

  // ---------- Load Events ----------
  useEffect(() => {
    const load = async () => {
      setFetching(true);
      try {
        const pRes = await ParticipantService.getParentEvent(parentId);
        setParentName(pRes.data?.name || "Events");

        const eRes = await ParticipantService.getEventsByParent(parentId);
        setEvents(eRes.data || []);
      } catch {
        showToast("Error loading events", "error");
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [parentId]);

  const requireLogin = () => {
    if (loading) return false;
    if (!user) {
      nav("/login");
      return false;
    }
    return true;
  };

  // -----------------------------------------------------------
  // START ADD TO CART SESSION
  // -----------------------------------------------------------
  const startAddToCart = async (ev) => {
    if (!requireLogin()) return;

    let constraintData = null;

    if (ev.constraint_id) {
      try {
        const res = await ParticipantService.getConstraintById(
          ev.constraint_id
        );
        constraintData = res.data;
      } catch {}
    }

    let defaultCount = 1;
    if (constraintData) {
      if (constraintData.booking_type === "single") {
        defaultCount = 1;
      } else if (
        constraintData.booking_type === "multiple" &&
        constraintData.fixed
      ) {
        defaultCount = constraintData.upper_limit;
      } else {
        defaultCount = 1;
      }
    }

    setSession({
      event: ev,
      constraint: constraintData,
      count: defaultCount,
      participants: [],
      slot: null,
    });

    if (!constraintData || constraintData.booking_type === "single") {
      setOpenDetails(true);
      return;
    }

    if (constraintData.booking_type === "multiple" && constraintData.fixed) {
      setOpenDetails(true);
      return;
    }

    setOpenCount(true);
  };

  // -----------------------------------------------------------
  // PARTICIPANT DETAILS COMPLETED
  // -----------------------------------------------------------
  const finishParticipants = (list) => {
    setSession((s) => ({ ...s, participants: list }));
    setOpenDetails(false);
    setOpenSlot(true);
  };

  // -----------------------------------------------------------
  // PICK SLOT + ADD TO CART
  // -----------------------------------------------------------
  const chooseSlot = async (slot) => {
    try {
      const cart = await ParticipantService.getOrCreateCart();

      const cartItemRes = await ParticipantService.createCartItem({
        cart: cart.data.id,
        event: session.event.id,
        participants_count: session.count,
      });

      const itemId = cartItemRes.data.id;

      for (const p of session.participants) {
        await ParticipantService.createTempBooking({
          cart_item: itemId,
          name: p.name,
          email: p.email || null,
          phone_number: p.phone_number || null,
        });
      }

      await ParticipantService.createTempTimeslot({
        cart_item: itemId,
        slot: slot.id,
      });

      showToast("Added to cart!");
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to add to cart", "error");
    }

    setSession(initialSession);
    setOpenSlot(false);
  };

  // ---------- DIRECT SLOT BOOKING FROM VIEW MODAL ----------
  const directSlotStart = () => {
    startAddToCart(viewEvent);
  };

  return (
    <div className="relative max-w-7xl mx-auto px-6 py-10 overflow-hidden">
      {/* Background FX */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, -40, 0] }}
          transition={{ duration: 18, repeat: Infinity }}
          className="absolute top-[-160px] left-[-120px] w-[650px] h-[650px] bg-purple-500 rounded-full blur-[180px] opacity-50"
        />
        <motion.div
          animate={{ y: [40, -30, 40] }}
          transition={{ duration: 22, repeat: Infinity }}
          className="absolute bottom-[-160px] right-[-140px] w-[600px] h-[600px] bg-pink-500 rounded-full blur-[200px] opacity-50"
        />
      </div>

      {/* Header */}
      <button
        onClick={() => nav(-1)}
        className="flex items-center gap-2 text-purple-700 font-semibold mb-6"
      >
        <ArrowLeft className="w-5 h-5" /> Back
      </button>

      <h1 className="text-4xl font-extrabold text-purple-900 mb-10">
        {parentName}
      </h1>

      {/* Event Grid */}
      {fetching ? (
        <div className="text-center text-gray-500 py-20">Loading…</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
          {events.map((ev) => (
            <motion.div
              key={ev.id}
              whileHover={{ scale: 1.04, y: -6 }}
              className="relative rounded-3xl overflow-hidden bg-white/40 backdrop-blur-xl border-[2px] border-purple-300 hover:border-purple-500 transition-all group"
            >
              <div className="h-64 overflow-hidden">
                {ev.image ? (
                  <motion.img
                    src={ev.image}
                    alt={ev.name}
                    initial={{ scale: 1.05 }}
                    whileHover={{ scale: 1.12 }}
                    transition={{ duration: 0.8 }}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-300 to-pink-300" />
                )}
              </div>

              <div className="p-7">
                <div className="flex items-center gap-3 mb-3">
                  <Star className="w-6 h-6 text-purple-700" />
                  <h2 className="text-xl font-bold text-gray-900">{ev.name}</h2>
                </div>

                <p className="text-gray-700 text-sm font-medium">
                  Price: ₹{ev.price}
                </p>
                <p className="text-gray-500 text-xs mt-2">
                  <Calendar className="inline w-4 h-4 mr-1 text-purple-700" />
                  {ev.description || "Event details available"}
                </p>
              </div>

              {/* Hover CTA Buttons */}
              <div className="absolute inset-x-0 bottom-0 p-4 bg-white/80 backdrop-blur-xl translate-y-full group-hover:translate-y-0 transition-all">
                <div className="flex gap-3">
                  <button
                    onClick={() => startAddToCart(ev)}
                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold"
                  >
                    Add to Cart
                  </button>

                  <button
                    onClick={() => setViewEvent(ev)}
                    className="flex-1 py-2 rounded-xl bg-white border border-purple-300 text-purple-600 font-semibold"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ---------- VIEW EVENT DETAILS MODAL ---------- */}
      <EventFullDetailsModal
        event={viewEvent}
        open={!!viewEvent}
        onClose={() => setViewEvent(null)}
        onAddToCart={() => startAddToCart(viewEvent)}
        onSlotDirectStart={directSlotStart}
      />

      {/* ---------- ADD TO CART MODALS ---------- */}
      <ParticipantCountModal
        open={openCount}
        onClose={() => {
          setOpenCount(false);
          setSession(initialSession);
        }}
        constraint={session.constraint}
        onChoose={(n) => {
          setSession((s) => ({ ...s, count: n }));
          setOpenCount(false);
          setOpenDetails(true);
        }}
      />

      <ParticipantDetailsModal
        open={openDetails}
        onClose={() => {
          setOpenDetails(false);
          setSession(initialSession);
        }}
        count={session.count}
        onComplete={finishParticipants}
      />

      <SlotPickModal
        open={openSlot}
        onClose={() => {
          setOpenSlot(false);
          setSession(initialSession);
        }}
        event={session.event}
        participantsCount={session.count}
        onPick={chooseSlot}
        fetchSlots={(id) => ParticipantService.getEventSlots(id)}
      />

      {/* ---------- TOAST ---------- */}
      <AnimatePresence>
        {alert.open && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 right-6 px-5 py-3 rounded-xl text-white shadow-xl ${
              alert.severity === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {alert.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
