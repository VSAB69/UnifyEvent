import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, ShieldCheck } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { loginUser, googleLoginUser, showAlert } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert("Error", "Email and password are required");
      return;
    }

    try {
      setLoading(true);
      await loginUser(email, password);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (res) => {
    const id_token = res.credential;
    if (!id_token) {
      showAlert("Error", "Google login failed");
      return;
    }

    try {
      setLoading(true);
      await googleLoginUser(id_token);
    } catch {
      showAlert("Error", "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#050505] text-white relative px-4 py-8">

      {/* BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#1a101a_0%,#050505_100%)] opacity-80" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      <div className="relative z-10 w-full max-w-[1100px] flex flex-col lg:flex-row items-center gap-8">

        {/* MOBILE LOGO */}
        <div className="lg:hidden text-center mb-4">
          <h1 className="text-3xl font-[1000] uppercase tracking-tight">
            UNIFY
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F72585] via-[#9155FD] to-[#4CC9F0] italic">
              EVENTS
            </span>
          </h1>
        </div>

        {/* DESKTOP LEFT */}
        <motion.div 
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:block flex-1"
        >
          <h1 className="text-7xl font-[1000] uppercase leading-[0.9] mb-6">
            UNIFY
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F72585] via-[#9155FD] to-[#4CC9F0] italic">
              EVENTS
            </span>
          </h1>

          <p className="text-white/40 uppercase tracking-widest text-sm max-w-md">
            Join events. Connect people. Build experiences.
          </p>
        </motion.div>

        {/* FORM */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-[420px] bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck size={22} className="text-[#00FF41]" />
            <h2 className="text-xl sm:text-2xl font-[1000] uppercase italic">
              SIGN IN
            </h2>
          </div>

          <div className="space-y-5">

            {/* EMAIL */}
            <div>
              <label className="text-[10px] text-white/40 uppercase">
                EMAIL
              </label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                <input
                  type="email"
                  className="w-full pl-10 pr-3 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:border-[#4CC9F0] outline-none"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyPress}
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="text-[10px] text-white/40 uppercase">
                PASSWORD
              </label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                <input
                  type="password"
                  className="w-full pl-10 pr-3 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:border-[#F72585] outline-none"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyPress}
                />
              </div>
            </div>

            {/* LOGIN */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleLogin}
              disabled={loading}
              className={`w-full py-3 rounded-xl font-bold text-sm transition ${
                loading
                  ? "bg-white/20 text-white cursor-not-allowed"
                  : "bg-white text-black hover:bg-[#F72585] hover:text-white"
              }`}
            >
              {loading ? "Signing in..." : "LOGIN"}
            </motion.button>

            {/* DIVIDER */}
            <div className="flex items-center gap-3 text-white/30 text-xs">
              <div className="flex-1 h-[1px] bg-white/10" />
              OR
              <div className="flex-1 h-[1px] bg-white/10" />
            </div>

            {/* GOOGLE */}
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => showAlert("Error", "Google login failed")}
              />
            </div>

            {/* REGISTER */}
            <button
              onClick={() => navigate("/register")}
              className="w-full text-xs text-[#9155FD] mt-4"
            >
              Create new account
            </button>

          </div>
        </motion.div>
      </div>
    </div>
  );
}