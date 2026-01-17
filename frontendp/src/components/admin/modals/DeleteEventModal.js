import { motion, AnimatePresence } from "framer-motion";
import { Trash2, X } from "lucide-react";

export default function DeleteEventModal({ open, onClose, onConfirm, event }) {
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
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6"
        >
          {/* CLOSE */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          {/* CONTENT */}
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-red-100 text-red-600 mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-semibold text-gray-900">
              Delete Event
            </h3>

            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete
              <span className="font-semibold"> “{event?.name}”</span>? This
              action cannot be undone.
            </p>
          </div>

          {/* ACTIONS */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>

            <motion.button
              onClick={onConfirm}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition shadow-md"
            >
              Delete
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
