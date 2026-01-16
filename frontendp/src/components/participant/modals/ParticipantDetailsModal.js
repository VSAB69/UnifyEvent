import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Mail, Phone } from "lucide-react";

export default function ParticipantDetailsModal({
  open,
  onClose,
  count,
  onComplete,
}) {
  const [index, setIndex] = useState(0);
  const [list, setList] = useState([]);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone_number: "",
  });

  useEffect(() => {
    if (open) {
      setIndex(0);
      setList(
        Array.from({ length: count }, () => ({
          name: "",
          email: "",
          phone_number: "",
        }))
      );
      setForm({ name: "", email: "", phone_number: "" });
      setError("");
    }
  }, [open, count]);

  if (!open) return null;

  const saveCurrent = () => {
    const updated = [...list];
    updated[index] = { ...form };
    setList(updated);
  };

  const handleNext = () => {
    if (!form.name.trim()) {
      setError("Full name is required");
      return;
    }

    setError("");
    saveCurrent();

    if (index === count - 1) {
      onComplete(list.map((p, i) => (i === index ? form : p)));
    } else {
      const nextIdx = index + 1;
      setIndex(nextIdx);
      setForm(list[nextIdx] || { name: "", email: "", phone_number: "" });
    }
  };

  const handlePrev = () => {
    if (index === 0) return;
    saveCurrent();
    const prevIdx = index - 1;
    setIndex(prevIdx);
    setForm(list[prevIdx] || { name: "", email: "", phone_number: "" });
  };

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
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8"
        >
          {/* CLOSE */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          {/* HEADER */}
          <div className="mb-6">
            <p className="text-xs font-semibold tracking-widest uppercase text-purple-600 mb-1">
              Participant {index + 1} of {count}
            </p>
            <h2 className="text-2xl font-bold text-gray-900">
              Participant Details
            </h2>
          </div>

          {/* FORM */}
          <div className="space-y-4">
            {/* NAME */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <div className="mt-1 flex items-center gap-2 rounded-xl border px-3 py-2 focus-within:ring-2 ring-purple-500">
                <User className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter full name"
                  className="w-full outline-none text-sm"
                />
              </div>
              {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
            </div>

            {/* EMAIL */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Email (optional)
              </label>
              <div className="mt-1 flex items-center gap-2 rounded-xl border px-3 py-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Email address"
                  className="w-full outline-none text-sm"
                />
              </div>
            </div>

            {/* PHONE */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Phone (optional)
              </label>
              <div className="mt-1 flex items-center gap-2 rounded-xl border px-3 py-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={form.phone_number}
                  onChange={(e) =>
                    setForm({ ...form, phone_number: e.target.value })
                  }
                  placeholder="Phone number"
                  className="w-full outline-none text-sm"
                />
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Details will be submitted after all participants are completed.
            </p>
          </div>

          {/* ACTIONS */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={handlePrev}
              disabled={index === 0}
              className={`flex-1 py-2.5 rounded-xl border font-medium transition ${
                index === 0
                  ? "border-gray-200 text-gray-400 cursor-not-allowed"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Back
            </button>

            <motion.button
              onClick={handleNext}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition shadow-md"
            >
              {index === count - 1 ? "Finish" : "Next"}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
