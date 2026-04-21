import React, { useState } from "react";

import { setPassword } from "../api/endpoints";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";

export default function SetPassword() {
  const [password, setPasswordInput] = useState("");
  const [confirm, setConfirm] = useState("");

  // 🔥 NEW: visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { showAlert } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (password.length < 8) {
      showAlert("Error", "Password must be at least 8 characters");
      return;
    }

    if (password !== confirm) {
      showAlert("Error", "Passwords do not match");
      return;
    }

    try {
      await setPassword(password);

      showAlert("Success", "Password set successfully", "success");

      navigate("/", { replace: true });

    } catch {
      showAlert("Error", "Failed to set password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-md bg-[#0a0a0a] p-6 rounded-2xl">

        <h2 className="text-xl font-bold mb-4">Set Password</h2>

        {/* PASSWORD FIELD */}
        <div className="relative mb-3">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter password"
            className="w-full p-3 bg-white/10 rounded pr-12"
            value={password}
            onChange={(e) => setPasswordInput(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-white/60"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {/* CONFIRM FIELD */}
        <div className="relative mb-4">
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm password"
            className="w-full p-3 bg-white/10 rounded pr-12"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-white/60"
          >
            {showConfirm ? "Hide" : "Show"}
          </button>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-white text-black rounded"
        >
          Save Password
        </button>
      </div>
    </div>
  );
}