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
import { QRCodeCanvas } from "qrcode.react"; // ✅ ADDED

export default function TicketPage() {
  const { bookedEventId } = useParams();
  const nav = useNavigate();

  const [bookedEvent, setBookedEvent] = useState(null);
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);

  const ticketRef = useRef(null);

  useEffect(() => {
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
      <div className="w-full max-w-4xl relative">

        {/* Buttons */}
        <div className="flex justify-between mb-6">
          <button
            onClick={() => nav(-1)}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <button
            onClick={downloadImage}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>

        {/* Ticket */}
        <div
          ref={ticketRef}
          className="rounded-3xl shadow-2xl overflow-hidden bg-white"
        >
          {/* Header */}
          <div className="px-8 py-6 bg-gradient-to-r from-purple-700 to-black text-white flex justify-between">
            <div className="flex items-center gap-3">
              <Ticket className="w-6 h-6" />
              <span className="text-xl font-bold">EVENT PASS</span>
            </div>
            <span className="px-4 py-1 text-sm rounded-full bg-green-500 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              CONFIRMED
            </span>
          </div>

          {/* Body */}
          <div className="p-8">
            <h2 className="text-3xl font-bold mb-6">{evName}</h2>

            {/* Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Info label="Date" value={date} icon={<Calendar />} />
              <Info label="Time" value={`${start} - ${end}`} icon={<Clock />} />
              <Info label="Venue" value={venue || "TBA"} icon={<MapPin />} />
              <Info label="Team Size" value={team} icon={<Users />} />
            </div>

            <hr className="my-6" />

            {/* Participants */}
            <h3 className="text-xl font-semibold mb-4">Participants</h3>

            {bookedEvent.participants?.map((p) => (
              <div
                key={p.id}
                className="p-4 border rounded-xl mb-3 flex justify-between items-center"
              >
                {/* LEFT */}
                <div>
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-sm text-gray-500">
                    {p.email} • {p.phone_number}
                  </div>
                </div>

                {/* RIGHT */}
                {!p.arrived && p.qr_token ? (
                  <QRCodeCanvas
                    value={JSON.stringify({
                      type: "event_checkin",
                      token: p.qr_token,
                      participant_id: p.id,
                    })}
                    size={80}
                  />
                ) : (
                  <div className="text-green-600 font-semibold">
                    Checked In
                  </div>
                )}
              </div>
            ))}

            <hr className="my-6" />

            {/* Total */}
            <div className="flex justify-between text-xl font-bold">
              <span>Total Paid</span>
              <span>₹ {total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value, icon }) {
  return (
    <div className="flex gap-2 items-center">
      {icon}
      <div>
        <div className="text-xs text-gray-500">{label}</div>
        <div className="font-semibold">{value}</div>
      </div>
    </div>
  );
}