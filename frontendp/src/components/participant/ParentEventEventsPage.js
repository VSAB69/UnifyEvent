// src/components/participant/ParentEventEventsPage.jsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, ArrowUpRight } from "lucide-react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import ParticipantService from "./ParticipantService";

// Modals
import ParticipantCountModal from "./modals/ParticipantCountModal";
import ParticipantDetailsModal from "./modals/ParticipantDetailsModal";
import SlotPickModal from "./modals/SlotPickModal";
import EventFullDetailsModal from "./EventFullDetailsModal";

export default function ParentEventEventsPage() {
  const { parentId } = useParams();
  const { user, loading } = useAuth();

  const [events, setEvents] = useState([]);
  const [parentName, setParentName] = useState("");
  const [fetching, setFetching] = useState(true);

  // eventId -> signed image url
  const [imageUrls, setImageUrls] = useState({});

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
  const [viewEvent, setViewEvent] = useState(null);

  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showToast = (msg, sev = "success") => {
    setAlert({ open: true, message: msg, severity: sev });
    setTimeout(() => setAlert((a) => ({ ...a, open: false })), 2600);
  };

  /* ─────────────────────────────────────────────
     LOAD EVENTS + PARENT
  ───────────────────────────────────────────── */
  useEffect(() => {
    const load = async () => {
      setFetching(true);
      try {
        const pRes = await ParticipantService.getParentEvent(parentId);
        setParentName(pRes.data?.name || "Events");

        const eRes = await ParticipantService.getEventsByParent(parentId);
        setEvents(eRes.data || []);
      } catch {
        showToast("Failed to load events", "error");
      } finally {
        setFetching(false);
      }
    };

    load();
  }, [parentId]);

  /* ─────────────────────────────────────────────
     FETCH SIGNED IMAGE URLS (FIXED)
  ───────────────────────────────────────────── */
  useEffect(() => {
    events.forEach((ev) => {
      // ✅ MUST use image_key
      if (!ev.image_key) return;

      // already fetched
      if (imageUrls[ev.id]) return;

      ParticipantService.getEventImageSignedUrl(ev.image_key)
        .then((res) => {
          setImageUrls((prev) => ({
            ...prev,
            [ev.id]: res.data.url,
          }));
        })
        .catch(() => {});
    });
  }, [events]); // ✅ DO NOT include imageUrls

  const requireLogin = () => {
    if (loading) return false;
    if (!user) return false;
    return true;
  };

  /* ─────────────────────────────────────────────
     BOOKING FLOW (UNCHANGED)
  ───────────────────────────────────────────── */
  const startAddToCart = async (ev) => {
    if (!requireLogin()) return;

    let constraintData = null;

    try {
      const res = await ParticipantService.getConstraintForEvent(ev.id);
      if (res.data?.length) constraintData = res.data[0];
    } catch {}

    setSession({
      event: ev,
      constraint: constraintData,
      count: 1,
      participants: [],
      slot: null,
    });

    if (!constraintData || constraintData.booking_type === "single") {
      setOpenDetails(true);
      return;
    }

    if (constraintData.booking_type === "multiple" && constraintData.fixed) {
      setSession((s) => ({
        ...s,
        count: constraintData.upper_limit || 1,
      }));
      setOpenDetails(true);
      return;
    }

    setOpenCount(true);
  };

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

      await ParticipantService.createTempTimeslot({
        cart_item: cartItem.data.id,
        slot: slot.id,
      });

      showToast("Added to cart!");
    } catch {
      showToast("Failed to add to cart", "error");
    }

    setSession(initialSession);
    setOpenSlot(false);
  };

  /* ─────────────────────────────────────────────
     UI
  ───────────────────────────────────────────── */
  return (
    <div className="relative max-w-7xl mx-auto px-6 py-14">
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 max-w-2xl"
      >
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          {parentName}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Browse events and view full details.
        </p>
      </motion.header>

      {fetching ? (
        <div className="text-center py-24 text-gray-500">Loading events…</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {events.map((ev) => (
            <motion.div
              key={ev.id}
              whileHover={{ y: -6 }}
              className="bg-white border rounded-xl overflow-hidden flex flex-col"
            >
              <div className="h-40 overflow-hidden">
                {imageUrls[ev.id] ? (
                  <img
                    src={imageUrls[ev.id]}
                    alt={ev.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 animate-pulse" />
                )}
              </div>

              <div className="p-5 flex flex-col flex-1">
                <h2 className="font-bold text-slate-900 mb-2">{ev.name}</h2>

                <div className="flex items-center gap-2 text-xs text-slate-600 mb-4">
                  <Calendar className="w-4 h-4 text-purple-600" />₹ {ev.price}
                </div>

                <button
                  onClick={() => setViewEvent(ev)}
                  className="mt-auto w-full py-2.5 rounded-lg bg-purple-600 text-white font-semibold flex items-center justify-center gap-1.5"
                >
                  View Details
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* MODALS */}
      <EventFullDetailsModal
        event={viewEvent}
        open={!!viewEvent}
        onClose={() => setViewEvent(null)}
        onAddToCart={() => startAddToCart(viewEvent)}
        onSlotDirectStart={() => startAddToCart(viewEvent)}
      />

      <ParticipantCountModal
        open={openCount}
        onClose={() => setOpenCount(false)}
        constraint={session.constraint}
        onChoose={(n) => {
          setSession((s) => ({ ...s, count: n }));
          setOpenCount(false);
          setOpenDetails(true);
        }}
      />

      <ParticipantDetailsModal
        open={openDetails}
        onClose={() => setOpenDetails(false)}
        count={session.count}
        onComplete={finishParticipants}
      />

      <SlotPickModal
        open={openSlot}
        onClose={() => setOpenSlot(false)}
        event={session.event}
        participantsCount={session.count}
        onPick={chooseSlot}
        fetchSlots={(id) => ParticipantService.getEventSlots(id)}
      />

      <AnimatePresence>
        {alert.open && (
          <motion.div className="fixed bottom-6 right-6 px-5 py-3 rounded-xl text-white bg-black">
            {alert.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
