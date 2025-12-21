import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Download,
  Calendar,
  Clock,
  MapPin,
  Users,
  Ticket,
  CheckCircle,
} from "lucide-react";
import html2canvas from "html2canvas";
import { useNavigate, useParams } from "react-router-dom";
import ParticipantService from "./ParticipantService";

export default function TicketPage() {
  const { bookedEventId } = useParams();
  const nav = useNavigate();

  const [bookedEvent, setBookedEvent] = useState(null);
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);

  const ticketRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const beRes = await ParticipantService.getBookedEvent(bookedEventId);
      const be = beRes.data;
      setBookedEvent(be);

      if (be?.event) {
        const detRes = await ParticipantService.getEventDetailsByEvent(
          be.event
        );
        const details = detRes.data?.[0] || null;
        setVenue(details?.venue || null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [bookedEventId]);

  const downloadImage = async () => {
    if (!ticketRef.current) return;

    const canvas = await html2canvas(ticketRef.current, {
      scale: 3,
      backgroundColor: "#ffffff",
    });

    const dataURL = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = `ticket_${bookedEventId}.png`;
    link.click();
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-lg text-gray-700">
        Loading your ticket…
      </div>
    );
  }

  if (!bookedEvent) {
    return (
      <div className="p-6">
        <div className="text-gray-800 text-lg font-semibold">
          Ticket not found.
        </div>
        <button
          onClick={() => nav(-1)}
          className="mt-4 px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>
    );
  }

  const evName = bookedEvent.event_name;
  const date = bookedEvent.slot_info?.date;
  const start = bookedEvent.slot_info?.start_time;

  const end = bookedEvent.slot_info?.end_time;
  const team = bookedEvent.participants_count;
  const total = Number(bookedEvent.line_total || 0).toFixed(2);

  return (
    <div className="flex justify-center px-4 py-10 relative overflow-hidden">
      {/* ⭐ LEFT BACKGROUND PATTERN - no files needed */}
      <div className="absolute left-0 top-0 h-full w-1/4 opacity-30 pointer-events-none">
        <div className="w-full h-full bg-[radial-gradient(circle_at_20%_40%,#c084fc33,transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.07)_10%,transparent_10%),linear-gradient(225deg,rgba(255,255,255,0.07)_10%,transparent_10%)] bg-[size:40px_40px] opacity-20" />
      </div>

      {/* ⭐ RIGHT BACKGROUND PATTERN */}
      <div className="absolute right-0 top-0 h-full w-1/4 opacity-30 pointer-events-none">
        <div className="w-full h-full bg-[radial-gradient(circle_at_80%_60%,#f9a8d433,transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.06)_5%,transparent_5%),linear-gradient(135deg,rgba(255,255,255,0.06)_5%,transparent_5%)] bg-[size:45px_45px] opacity-25" />
      </div>

      <div className="w-full max-w-4xl relative">
        {/* Floating UI (unchanged) */}
        <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: 6 + (i % 5) * 4,
                height: 6 + (i % 5) * 4,
                background:
                  i % 2 ? "rgba(147,51,234,0.25)" : "rgba(236,72,153,0.25)",
                filter: "blur(4px)",
                left: `${(i * 17) % 100}%`,
                top: `${(i * 43) % 100}%`,
              }}
              animate={{
                y: ["0%", "20%", "0%"],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 4 + (i % 5),
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Top Buttons */}
        <div className="flex justify-between mb-6">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => nav(-1)}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 flex items-center gap-2 shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
            onClick={downloadImage}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:opacity-90 flex items-center gap-2 shadow-lg"
          >
            <Download className="w-4 h-4" />
            Download
          </motion.button>
        </div>

        {/* Ticket */}
        <motion.div
          ref={ticketRef}
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          whileHover={{
            rotateX: 3,
            rotateY: -3,
            transition: { duration: 0.3 },
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="rounded-3xl shadow-2xl overflow-hidden relative"
          style={{
            background:
              "linear-gradient(135deg, #ffffff 0%, #faf7ff 40%, #f4ecff 100%)",
          }}
        >
          {/* ✨ Foil Border + Shine unchanged */}
          <div className="absolute inset-0 rounded-3xl pointer-events-none border-[4px] border-transparent animate-foil" />
          <div className="absolute inset-0 opacity-0 hover:opacity-50 transition duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shine pointer-events-none" />

          {/* HEADER */}
          <div className="px-8 py-6 bg-gradient-to-r from-purple-700 via-purple-900 to-black text-white relative overflow-hidden">
            <motion.div
              animate={{ opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top,white,transparent)] opacity-20"
            />

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <Ticket className="w-6 h-6" />
                <span className="text-xl font-bold tracking-wide">
                  EVENT PASS
                </span>
              </div>

              <motion.span
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="px-4 py-1 text-sm rounded-full bg-green-500 font-semibold flex items-center gap-1 shadow-inner"
              >
                <CheckCircle className="w-4 h-4" />
                CONFIRMED
              </motion.span>
            </div>
          </div>

          {/* BODY */}
          <div className="p-8">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-6 leading-tight">
              {evName}
            </h2>

            {/* EVENT DETAILS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <AnimatedInfoRow
                icon={<Calendar className="w-6 h-6" />}
                label="Date"
                value={date}
              />
              <AnimatedInfoRow
                icon={<Clock className="w-6 h-6" />}
                label="Time"
                value={`${start} — ${end}`}
              />
              <AnimatedInfoRow
                icon={<MapPin className="w-6 h-6" />}
                label="Venue"
                value={venue || "Not specified"}
              />
              <AnimatedInfoRow
                icon={<Users className="w-6 h-6" />}
                label="Team Size"
                value={team}
              />
            </div>

            <div className="my-8 border-t border-gray-300" />

            {/* PARTICIPANTS */}
            <h3 className="text-xl font-semibold mb-4">Participants</h3>

            {bookedEvent.participants?.length ? (
              <div className="space-y-3">
                {bookedEvent.participants.map((p, idx) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition"
                  >
                    <div className="font-semibold text-gray-900">{p.name}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {p.email || "No email"} • {p.phone_number || "No phone"}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500">No participants found.</div>
            )}

            <div className="my-8 border-t border-gray-300" />

            {/* TOTAL + NEW GREEN STAMP */}
            <div className="flex justify-between items-center text-xl font-bold relative">
              <span className="text-gray-600">Total Paid</span>
              <span className="text-gray-900">₹ {total}</span>

              {/* ⭐ VISIBLE PREMIUM GREEN STAMP (LEFT SIDE, ABOVE PRICE) */}
              <motion.div
                initial={{ scale: 0.8, rotate: -10, opacity: 0 }}
                animate={{ scale: 1, rotate: -12, opacity: 0.45 }}
                transition={{ duration: 0.8 }}
                className="absolute right-10 -top-20 px-6 py-3 border-[3px] border-green-600 
               text-green-700 font-extrabold text-lg rounded-xl 
               stampGreen leading-tight text-center tracking-wider"
              >
                CONFIRMED <br />
                {date} <br />
                {start}
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* ALL CSS ANIMATIONS */}
        <style>{`
          @keyframes foilMove {
            0% { border-color: rgba(168, 85, 247, 0.4); }
            50% { border-color: rgba(236, 72, 153, 0.7); }
            100% { border-color: rgba(168, 85, 247, 0.4); }
          }
          .animate-foil {
            animation: foilMove 4s ease-in-out infinite;
          }

          @keyframes shineSlide {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .animate-shine {
            animation: shineSlide 2.5s linear infinite;
          }

          /* Embossed stamp */
          .stampGreen {
            background: rgba(34,197,94,0.12);
            text-shadow: 0 2px 3px rgba(0,0,0,0.25);
            box-shadow: inset 0 0 10px rgba(34,197,94,0.25);
          }
        `}</style>
      </div>
    </div>
  );
}

/* InfoRow Component */
function AnimatedInfoRow({ icon, label, value }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, boxShadow: "0 10px 25px rgba(0,0,0,0.08)" }}
      className="flex items-start gap-4 p-4 rounded-xl bg-white shadow-md border border-gray-200 transition"
    >
      <div className="text-purple-700">{icon}</div>
      <div>
        <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
          {label}
        </div>
        <div className="text-lg font-semibold text-gray-900">{value}</div>
      </div>
    </motion.div>
  );
}
