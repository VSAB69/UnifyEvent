import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User } from "lucide-react";
import "./authbg.css";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");

  const { registerUser } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async () => {
    setError("");

    if (password !== passwordConfirm) {
      setError("Passwords do not match");
      return;
    }

    await registerUser(username, email, password, passwordConfirm);
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

      {/* 🔥 FORM CARD */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="auth-card"
      >
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-sub">Register to start exploring events.</p>

        <div className="space-y-6">
          <div className="input-wrap">
            <User className="input-icon" />
            <input
              className="auth-input"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="input-wrap">
            <Mail className="input-icon" />
            <input
              className="auth-input"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

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

          <div className="input-wrap">
            <Lock className="input-icon" />
            <input
              className="auth-input"
              placeholder="Confirm Password"
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleRegister}
            className="auth-btn"
          >
            Register
          </motion.button>

          <p className="login-text">
            Already have an account?{" "}
            <span onClick={() => navigate("/login")} className="login-link">
              Sign in
            </span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
