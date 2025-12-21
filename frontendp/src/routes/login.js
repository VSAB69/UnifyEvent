import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import { User, Lock } from "lucide-react";
import "./authbg.css"; // same background + animations

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    await loginUser(username, password);
  };

  return (
    <div className="auth-bg-container no-scroll-bg">
      {/* 🔥 FLOATING ANIMATED BACKGROUND LAYERS */}
      <div className="animated-gradient" />
      <div className="orb orb1" />
      <div className="orb orb2" />
      <div className="orb orb3" />
      <div className="particles" />

      {/* 🔥 UNIFY EVENTS TITLE */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="unify-title"
      >
        <motion.span
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{ repeat: Infinity, duration: 7, ease: "linear" }}
          className="unify-gradient"
        >
          Unify Events
        </motion.span>
      </motion.h1>

      {/* 🔥 LOGIN CARD */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="auth-card"
      >
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-sub">Login to manage or explore events.</p>

        <div className="space-y-6">
          {/* Username */}
          <div className="input-wrap">
            <User className="input-icon" />
            <input
              className="auth-input"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="input-wrap">
            <Lock className="input-icon" />
            <input
              className="auth-input"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Login Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleLogin}
            className="auth-btn"
          >
            Login
          </motion.button>

          <p className="login-text">
            Don’t have an account?{" "}
            <span onClick={() => navigate("/register")} className="login-link">
              Sign up
            </span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
