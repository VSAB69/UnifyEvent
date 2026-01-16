import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users } from "lucide-react";

/**
 * constraint: {
 *   booking_type: 'multiple',
 *   fixed: false,
 *   lower_limit: number,
 *   upper_limit: number
 * }
 */
export default function ParticipantCountModal({
  open,
  onClose,
  constraint,
  onChoose,
}) {
  const options = useMemo(() => {
    const low = constraint?.lower_limit || 1;
    const high = constraint?.upper_limit || 1;
    const arr = [];
    for (let i = low; i <= high; i++) arr.push(i);
    return arr;
  }, [constraint]);

  const [value, setValue] = useState(options[0] || 1);

  useEffect(() => {
    if (options.length) setValue(options[0]);
  }, [options]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4"
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6"
        >
          {/* CLOSE */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>

          {/* HEADER */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Select Team Size
              </h2>
              <p className="text-xs text-gray-500">
                Choose number of participants
              </p>
            </div>
          </div>

          {/* OPTIONS */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {options.map((n) => (
              <motion.button
                key={n}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setValue(n)}
                className={`h-12 rounded-xl font-semibold text-sm transition-all
                    ${
                      value === n
                        ? "bg-purple-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
              >
                {n}
              </motion.button>
            ))}
          </div>

          {/* ACTIONS */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>

            <motion.button
              onClick={() => onChoose(value)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition shadow-md"
            >
              Continue
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
