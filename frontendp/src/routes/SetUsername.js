import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { setUsername } from "../api/endpoints";
import { User} from "lucide-react";

export default function SetUsername() {
  const [username, setUsernameInput] = useState("");
  const [loading, setLoading] = useState(false);

  const { showAlert } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!username || username.length < 3) {
      showAlert("Invalid Username", "Minimum 3 characters required");
      return;
    }

    try {
      setLoading(true);

      await setUsername(username);

      showAlert("Success", "Username set successfully", "success");

      navigate("/", { replace: true });

    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        "Username unavailable";

      showAlert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] px-4 text-white">

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl"
      >

        <h2 className="text-2xl font-bold mb-2 text-center">
          Choose Username
        </h2>

        <p className="text-xs text-white/40 text-center mb-6">
          This will be your identity on the platform
        </p>

        {/* INPUT */}
        <div className="relative mb-6">
          <User
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
          />
          <input
            value={username}
            onChange={(e) => setUsernameInput(e.target.value)}
            placeholder="Enter username"
            className="w-full pl-10 pr-3 py-3 rounded-xl bg-white/5 border border-white/10 text-sm outline-none focus:border-[#9155FD]"
          />
        </div>

        {/* BUTTON */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-[#F72585] hover:text-white transition"
        >
          {loading ? "Saving..." : "Continue"}
        </motion.button>

      </motion.div>
    </div>
  );
}