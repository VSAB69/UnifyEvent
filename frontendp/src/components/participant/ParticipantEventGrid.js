import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import ParticipantService from "./ParticipantService";
import ParticipantEventCard from "./ParticipantEventCard";
import ParticipantCountModal from "./modals/ParticipantCountModal";
import ParticipantDetailsModal from "./modals/ParticipantDetailsModal";
import SlotPickModal from "./modals/SlotPickModal";

export default function ParticipantEventGrid() {
  const { user, loading } = useAuth();
  const nav = useNavigate();

  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [fetching, setFetching] = useState(true);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Flow state
  const [activeEvent, setActiveEvent] = useState(null);
  const [constraint, setConstraint] = useState(null);
  const [participantsCount, setParticipantsCount] = useState(1);
  const [participantsData, setParticipantsData] = useState([]);
  const [pickedSlot, setPickedSlot] = useState(null);

  // Modals
  const [openCount, setOpenCount] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [openSlot, setOpenSlot] = useState(false);

  const loadEvents = async () => {
    setFetching(true);
    try {
      const res = await ParticipantService.getAllEvents();
      setEvents(res.data);
    } catch {
      setAlert({
        open: true,
        message: "Failed to load events",
        severity: "error",
      });
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const requireLogin = () => {
    if (loading) return false;
    if (!user) {
      nav("/login");
      return false;
    }
    return true;
  };

  const startAddToCart = async (event) => {
    if (!requireLogin()) return;

    setActiveEvent(event);
    setParticipantsData([]);
    setPickedSlot(null);

    let c = null;
    if (event.constraint_id) {
      try {
        const res = await ParticipantService.getConstraintById(
          event.constraint_id
        );
        c = res.data;
      } catch {
        c = null;
      }
    }

    setConstraint(c);

    if (!c || c.booking_type === "single") {
      setParticipantsCount(1);
      setOpenDetails(true);
      return;
    }

    if (c.booking_type === "multiple" && c.fixed) {
      setParticipantsCount(c.upper_limit || 1);
      setOpenDetails(true);
      return;
    }

    setOpenCount(true);
  };

  const handleCountChosen = (n) => {
    setOpenCount(false);
    setParticipantsCount(n);
    setOpenDetails(true);
  };

  const handleParticipantsCollected = (list) => {
    setParticipantsData(list);
    setOpenDetails(false);
    setOpenSlot(true);
  };

  const handleSlotPicked = async (slot) => {
    setPickedSlot(slot);
    setOpenSlot(false);

    try {
      const cartRes = await ParticipantService.getOrCreateCart();
      const cartId = cartRes.data.id;

      const cartItemRes = await ParticipantService.createCartItem({
        cart: cartId,
        event: activeEvent.id,
        participants_count: participantsCount,
      });
      const cartItemId = cartItemRes.data.id;

      for (const p of participantsData) {
        await ParticipantService.createTempBooking({
          cart_item: cartItemId,
          name: p.name,
          email: p.email || null,
          phone_number: p.phone_number || null,
        });
      }

      await ParticipantService.createTempTimeslot({
        cart_item: cartItemId,
        slot: slot.id,
      });

      setAlert({
        open: true,
        message: "Added to cart!",
        severity: "success",
      });

      // Reset
      setActiveEvent(null);
      setConstraint(null);
      setParticipantsCount(1);
      setParticipantsData([]);
      setPickedSlot(null);
    } catch (err) {
      console.error(err);
      setAlert({
        open: true,
        message: "Failed to add to cart.",
        severity: "error",
      });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Title */}
      <motion.h1
        className="text-4xl font-bold mb-6 bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        🛒 Browse Events
      </motion.h1>

      {/* Search Bar */}
      <motion.input
        type="text"
        placeholder="Search events..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-3 mb-6 rounded-xl border border-purple-300 
        bg-white shadow-md focus:ring-2 focus:ring-pink-400 outline-none transition-all"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      {/* Loading state */}
      {fetching ? (
        <div className="flex justify-center py-10">
          <motion.div className="w-10 h-10 border-4 border-pink-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.1 }}
        >
          {events
            .filter((e) => e.name.toLowerCase().includes(search.toLowerCase()))
            .map((ev) => (
              <ParticipantEventCard
                key={ev.id}
                event={ev}
                onAddToCart={() => startAddToCart(ev)}
              />
            ))}
        </motion.div>
      )}

      {/* Modals */}
      {activeEvent && (
        <ParticipantCountModal
          open={openCount}
          onClose={() => {
            setOpenCount(false);
            setActiveEvent(null);
            setConstraint(null);
          }}
          constraint={constraint}
          onChoose={handleCountChosen}
        />
      )}

      {activeEvent && (
        <ParticipantDetailsModal
          open={openDetails}
          onClose={() => {
            setOpenDetails(false);
            setActiveEvent(null);
            setConstraint(null);
          }}
          count={participantsCount}
          onComplete={handleParticipantsCollected}
        />
      )}

      {activeEvent && (
        <SlotPickModal
          open={openSlot}
          onClose={() => {
            setOpenSlot(false);
            setActiveEvent(null);
            setConstraint(null);
          }}
          event={activeEvent}
          participantsCount={participantsCount}
          onPick={handleSlotPicked}
          fetchSlots={(id) => ParticipantService.getEventSlots(id)}
        />
      )}

      {/* Toast Notification */}
      <AnimatePresence>
        {alert.open && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 right-6 px-5 py-3 rounded-xl shadow-xl text-white ${
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
