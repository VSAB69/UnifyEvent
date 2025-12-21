import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, BadgeCheck, Save } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import ParticipantService from "../participant/ParticipantService"; // optional if you want updates

export default function ProfilePage() {
  const { user } = useAuth();

  // Editable fields (if you want only display, remove setters)
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [role] = useState(user?.role || "");
  const [saving, setSaving] = useState(false);

  const initials = username ? username.charAt(0).toUpperCase() : "U";

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: Connect to backend update endpoint
      // await ParticipantService.updateProfile({ username, email });

      setTimeout(() => {
        setSaving(false);
      }, 600);
    } catch {
      setSaving(false);
    }
  };

  return (
    <div className="relative min-h-screen px-6 py-10">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-200 animate-gradient-xy"></div>

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* HEADER */}
        <motion.h1
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-extrabold text-gray-900 mb-8"
        >
          Profile
        </motion.h1>

        {/* CARD */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow-xl rounded-2xl p-8 border border-purple-100"
        >
          {/* Avatar */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
              {initials}
            </div>
          </div>

          {/* FIELDS */}
          <div className="space-y-6">
            {/* Username */}
            <div>
              <label className="text-sm font-medium text-gray-600 flex items-center gap-2 mb-1">
                <User className="w-4 h-4 text-purple-600" />
                Username
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-400 outline-none transition"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-600 flex items-center gap-2 mb-1">
                <Mail className="w-4 h-4 text-purple-600" />
                Email
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-400 outline-none transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Role | Non-editable */}
            <div>
              <label className="text-sm font-medium text-gray-600 flex items-center gap-2 mb-1">
                <BadgeCheck className="w-4 h-4 text-purple-600" />
                Role
              </label>
              <div className="px-4 py-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 font-medium">
                {role.toUpperCase()}
              </div>
            </div>
          </div>

          {/* SAVE BUTTON */}
          <div className="mt-8 flex justify-center">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition disabled:opacity-60"
            >
              <Save className="w-5 h-5" />
              {saving ? "Saving..." : "Save Changes"}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
