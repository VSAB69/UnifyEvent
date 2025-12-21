import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function ParticipantEventCard({ event, onAddToCart }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative w-full bg-gradient-to-br from-pink-100 via-purple-100 to-white border border-purple-200 
                 rounded-2xl shadow-lg p-5 overflow-hidden group hover:shadow-2xl hover:border-pink-300 transition-all duration-300"
    >
      {/* Glow Background */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-pink-300 blur-3xl opacity-40"></div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-300 blur-3xl opacity-40"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold text-purple-800 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-pink-500" />
          {event.name}
        </h2>
        <span
          className={`px-3 py-1 text-xs font-semibold rounded-full ${
            event.exclusivity
              ? "bg-gradient-to-r from-pink-400 to-purple-400 text-white"
              : "bg-purple-100 text-purple-700"
          }`}
        >
          {event.exclusivity ? "Exclusive" : "Open"}
        </span>
      </div>

      {/* Details */}
      <div className="relative z-10 space-y-1 text-sm text-gray-700">
        <p>
          <span className="font-medium text-purple-700">Committee:</span>{" "}
          {event.parent_committee || "N/A"}
        </p>
        <p>
          <span className="font-medium text-purple-700">Price:</span> ₹
          {event.price}
        </p>
      </div>

      {/* CTA */}
      <div className="relative z-10 mt-4">
        <button
          onClick={onAddToCart}
          className="w-full bg-gradient-to-r from-pink-400 via-purple-400 to-pink-500 text-white py-2 rounded-xl
                     font-semibold shadow-md hover:shadow-lg hover:from-pink-500 hover:to-purple-500 transition-all duration-300"
        >
          Add to Cart
        </button>
      </div>

      {/* Bottom Accent Line */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-pink-300 to-purple-400 opacity-70"></div>
    </motion.div>
  );
}
