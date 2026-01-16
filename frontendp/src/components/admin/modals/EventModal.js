import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Image as ImageIcon, IndianRupee } from "lucide-react";
import EventService from "../EventService";

export default function EventModal({
  open,
  onClose,
  refreshEvents,
  editEventData,
}) {
  const [categories, setCategories] = useState([]);
  const [parentEvents, setParentEvents] = useState([]);

  const [form, setForm] = useState({
    parent_committee: "",
    name: "",
    parent_event: "",
    category: "",
    price: "0",
    exclusivity: false,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Fetch data
  useEffect(() => {
    if (!open) return;
    EventService.getCategories().then((r) => setCategories(r.data || []));
    EventService.getParentEvents().then((r) => setParentEvents(r.data || []));
  }, [open]);

  // Fill edit data
  useEffect(() => {
    if (!open) return;

    if (editEventData) {
      setForm({
        parent_committee: editEventData.parent_committee || "",
        name: editEventData.name || "",
        parent_event: editEventData.parent_event || "",
        category: editEventData.category || "",
        price: editEventData.price ?? "0",
        exclusivity: editEventData.exclusivity || false,
      });
      if (editEventData.image_key) {
        // call secure endpoint to get signed URL
        EventService.getSecureImage(editEventData.image_key)
          .then((res) => setImagePreview(res.data.url))
          .catch(() => setImagePreview(null));
      } else {
        setImagePreview(null);
      }

      setImageFile(null);
    } else {
      setForm({
        parent_committee: "",
        name: "",
        parent_event: "",
        category: "",
        price: "0",
        exclusivity: false,
      });
      setImagePreview(null);
      setImageFile(null);
    }
  }, [editEventData, open]);

  if (!open) return null;

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (imageFile) fd.append("image", imageFile);

    if (editEventData) {
      await EventService.updateEvent(editEventData.id, fd);
    } else {
      await EventService.createEvent(fd);
    }

    refreshEvents();
    onClose();
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
          className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl p-8"
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
            <p className="text-xs font-semibold tracking-widest uppercase text-purple-600">
              Admin
            </p>
            <h2 className="text-2xl font-bold text-gray-900">
              {editEventData ? "Edit Event" : "Create Event"}
            </h2>
          </div>

          {/* MAIN GRID */}
          <div className="grid grid-cols-3 gap-6">
            {/* LEFT — FORM */}
            <div className="col-span-2 grid grid-cols-2 gap-4">
              <Field
                label="Parent Committee"
                value={form.parent_committee}
                onChange={(v) => setForm({ ...form, parent_committee: v })}
              />
              <Field
                label="Event Name"
                value={form.name}
                onChange={(v) => setForm({ ...form, name: v })}
              />

              <Select
                label="Parent Event"
                value={form.parent_event}
                onChange={(v) => setForm({ ...form, parent_event: v })}
                options={parentEvents}
              />

              <Select
                label="Category"
                value={form.category}
                onChange={(v) => setForm({ ...form, category: v })}
                options={categories}
              />

              <div className="col-span-2 flex items-center gap-6 mt-2">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700">
                    Price
                  </label>
                  <div className="mt-1 flex gap-2 rounded-xl border px-3 py-2">
                    <IndianRupee className="w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) =>
                        setForm({ ...form, price: e.target.value })
                      }
                      className="w-full outline-none text-sm"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-3 mt-6">
                  <input
                    type="checkbox"
                    checked={form.exclusivity}
                    onChange={(e) =>
                      setForm({ ...form, exclusivity: e.target.checked })
                    }
                    className="w-5 h-5"
                  />
                  <span className="text-sm font-medium text-gray-800">
                    Exclusive Event
                  </span>
                </label>
              </div>
            </div>

            {/* RIGHT — IMAGE */}
            <div className="col-span-1">
              <p className="text-sm font-semibold text-gray-800 mb-2">
                Event Image
              </p>

              <label className="flex items-center justify-center gap-2 h-40 rounded-2xl border-2 border-dashed cursor-pointer hover:bg-gray-50 transition">
                <ImageIcon className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium">Upload Image</span>
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageChange}
                />
              </label>

              {imagePreview && (
                <div className="mt-4 rounded-xl overflow-hidden border">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-40 object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>

            <motion.button
              onClick={handleSubmit}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition shadow-md"
            >
              {editEventData ? "Save Changes" : "Create Event"}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ---------- HELPERS ---------- */

function Field({ label, value, onChange }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none"
      />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border px-3 py-2 text-sm bg-white"
      >
        <option value="">None</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
    </div>
  );
}
