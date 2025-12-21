import React from "react";
import { Box, Button } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

export default function BookingSuccessPage() {
  const nav = useNavigate();
  const { id } = useParams();

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 pb-20 pt-28">
      {/* BACKGROUND ANIMATIONS */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.35, scale: 1 }}
        transition={{ duration: 2 }}
        className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-purple-300 rounded-full blur-[160px]"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.3, scale: 1 }}
        transition={{ duration: 2.2 }}
        className="absolute -bottom-40 -right-40 w-[550px] h-[550px] bg-pink-300 rounded-full blur-[190px]"
      />

      {/* FLOATING PARTICLES */}
      {[...Array(18)].map((_, i) => (
        <motion.div
          key={i}
          initial={{
            opacity: Math.random() * 0.3 + 0.1,
            x: Math.random() * window.innerWidth - 200,
            y: Math.random() * window.innerHeight - 200,
            scale: Math.random() * 0.6 + 0.4,
          }}
          animate={{
            y: ["0%", "-8%", "0%"],
            opacity: [0.15, 0.35, 0.15],
          }}
          transition={{
            duration: 10 + Math.random() * 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute w-2 h-2 bg-purple-300 rounded-full blur-[1px]"
        />
      ))}

      {/* MAIN CARD */}
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative bg-white/70 backdrop-blur-xl border border-white/50 shadow-2xl p-12 rounded-3xl w-[90%] max-w-xl flex flex-col items-center"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            duration: 0.6,
            type: "spring",
            stiffness: 200,
            damping: 12,
          }}
          className="mb-4"
        >
          <CheckCircleRoundedIcon
            sx={{ fontSize: 100 }}
            className="text-green-500 drop-shadow-xl"
          />
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-4xl font-extrabold text-gray-800 mb-3"
        >
          Booking Confirmed!
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.3 }}
          className="text-lg text-gray-600 mb-6"
        >
          Your Booking ID:{" "}
          <span className="font-semibold text-purple-700">{id}</span>
        </motion.p>

        {/* Dividing Line */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "80%" }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="h-[2px] bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mb-8"
        />

        {/* CTA Button */}
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          <Button
            variant="contained"
            onClick={() => nav("/home")}
            sx={{
              background: "linear-gradient(90deg, #a855f7 0%, #ec4899 100%)",
              boxShadow: "0 10px 25px rgba(168,85,247,0.35)",
              paddingX: 4,
              paddingY: 1.4,
              fontSize: "1.1rem",
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 600,
              ":hover": {
                background: "linear-gradient(90deg, #9333ea 0%, #db2777 100%)",
                boxShadow: "0 10px 28px rgba(168,85,247,0.55)",
              },
            }}
          >
            Return Home
          </Button>
        </motion.div>
      </motion.div>

      {/* CONFETTI ANIMATION (subtle) */}
      {[...Array(14)].map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: Math.random() * window.innerWidth - 200,
            y: -50,
            rotate: Math.random() * 360,
          }}
          animate={{
            y: window.innerHeight + 100,
            rotate: Math.random() * 720,
          }}
          transition={{
            duration: 4 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeOut",
          }}
          className={`absolute w-3 h-3 rounded ${
            i % 2 === 0 ? "bg-purple-400" : "bg-pink-400"
          }`}
        />
      ))}
    </div>
  );
}
