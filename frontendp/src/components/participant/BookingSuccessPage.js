import React from "react";
import { Button } from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Home as HomeIcon } from "lucide-react";

export default function BookingSuccessPage() {
  const nav = useNavigate();
  const { id } = useParams();

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-[#050505] text-white selection:bg-[#F72585]">

      {/* 🔥 BACKGROUND GLOW */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        className="absolute inset-0"
      >
        <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] bg-[#7C3AED] rounded-full blur-[200px] opacity-20" />
        <div className="absolute bottom-[-200px] right-[-200px] w-[600px] h-[600px] bg-[#F72585] rounded-full blur-[220px] opacity-20" />
      </motion.div>

      {/* 🔥 GRID OVERLAY */}
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* 🔥 MAIN CARD */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 60 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_40px_120px_rgba(0,0,0,0.8)] px-8 md:px-14 py-16 rounded-3xl md:rounded-[40px] flex flex-col items-center text-center max-w-xl w-[90%]"
      >

        {/* 🔥 ICON BURST */}
        <div className="relative mb-8">

          {/* Pulse Ring */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut", repeat: Infinity }}
            className="absolute inset-0 bg-green-500/20 rounded-full"
          />

          {/* Glow Ring */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1.6, opacity: 0.3 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 bg-green-500 blur-xl rounded-full"
          />

          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 220,
              damping: 12,
            }}
          >
            <CheckCircle2
              size={100}
              className="text-green-400 drop-shadow-[0_0_20px_rgba(34,197,94,0.7)]"
            />
          </motion.div>
        </div>

        {/* 🔥 TITLE */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="text-3xl md:text-5xl font-[1000] uppercase tracking-tighter mb-4"
        >
          Booking Confirmed
        </motion.h1>

        {/* 🔥 SUBTEXT */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-base md:text-lg text-white/60 mb-6 font-bold tracking-wide"
        >
          Your secure access key:
        </motion.p>

        {/* 🔥 BOOKING ID BADGE */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.45 }}
          className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#F72585] text-white font-black tracking-[0.3em] mb-8 shadow-[0_10px_40px_rgba(124,58,237,0.3)] text-xl md:text-2xl italic"
        >
          #{id || "SYNC_RESERVED"}
        </motion.div>

        {/* 🔥 DIVIDER */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "70%" }}
          transition={{ delay: 0.5 }}
          className="h-[2px] bg-gradient-to-r from-[#7C3AED] to-[#F72585] rounded-full mb-10 opacity-30"
        />

        {/* 🔥 BUTTON */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            onClick={() => nav("/home")}
            size="lg"
            bgGradient="linear(to-r, #7C3AED, #F72585)"
            color="white"
            px={10}
            h="60px"
            fontSize="sm"
            fontWeight="1000"
            borderRadius="18px"
            textTransform="uppercase"
            letterSpacing="0.2em"
            boxShadow="0 15px 35px rgba(124,58,237,0.4)"
            border="none"
            _hover={{
              bgGradient: "linear(to-r, #6D28D9, #DB2777)",
              transform: "translateY(-4px)",
              boxShadow: "0 20px 50px rgba(124,58,237,0.6)",
            }}
            _active={{ transform: "scale(0.95)" }}
            transition="all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
            leftIcon={<HomeIcon size={18} />}
          >
            Return to Home
          </Button>
        </motion.div>
      </motion.div>

      {/* 🔥 FLOATING PARTICLES (SMOOTH) */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          initial={{
            opacity: 0,
            y: 50,
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
          }}
          animate={{
            opacity: [0, 0.3, 0],
            y: [0, -400],
          }}
          transition={{
            duration: 4 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
          className="absolute w-1 h-1 bg-white/30 rounded-full"
        />
      ))}
    </div>
  );
}