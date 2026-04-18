import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import { User, Mail, ArrowRight, ShieldCheck, Activity } from "lucide-react"; 

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");

  const { registerUser } = useAuth(); //
  const navigate = useNavigate(); //

  const handleRegister = async () => {
    setError("");
    if (password !== passwordConfirm) {
      setError("PASSWORDS_DO_NOT_MATCH"); //
      return;
    }
    await registerUser(username, email, password, passwordConfirm); //
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#050505] text-white overflow-hidden relative selection:bg-[#F72585]">
      
      {/* --- BACKGROUND HUD OVERLAYS --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#1a101a_0%,#050505_100%)] opacity-80" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:50px_50px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px]" />
      </div>

      {/* SYSTEM STATUS INDICATORS */}
      <div className="absolute top-8 left-8 hidden md:block opacity-20">
        <div className="flex items-center gap-3">
          <Activity size={14} className="text-[#00FF41]" />
          <span className="text-[10px] font-black tracking-[0.5em] uppercase">Registry_Live</span>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-[1200px] flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-20 px-8">
        
        {/* RIGHT SECTION: BRANDING & UNIQUE SIGNUP SUBTEXT */}
        <motion.div 
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 text-center md:text-left"
        >
          <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
            <div className="h-[3px] w-12 bg-[#F72585]" />
            <p className="text-xs tracking-[0.5em] text-white/60 uppercase font-black">New Identity</p>
          </div>
          
          <h1 className="text-5xl lg:text-8xl font-[1000] uppercase tracking-tighter leading-[0.9] mb-8">
            JOIN<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F72585] via-[#9155FD] to-[#4CC9F0] italic">UNIFY</span>
          </h1>
          
          <p className="text-sm lg:text-lg text-white/40 font-bold uppercase tracking-widest max-w-md leading-relaxed mb-8">
            Your journey begins here. Unlock access to exclusive campus sectors, coordinate with elite student teams, and secure your place in the next major event.
          </p>

          <div className="flex items-center justify-center md:justify-start gap-4 opacity-40">
             <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border border-white/20 bg-white/5 flex items-center justify-center">
                    <User size={12} />
                  </div>
                ))}
             </div>
             <span className="text-[10px] font-bold uppercase tracking-widest">5000+ Profiles Synced</span>
          </div>
        </motion.div>

        {/* LEFT SECTION: REGISTER INTERFACE (FORM TO THE LEFT) */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-[440px] bg-[#0a0a0a] border-2 border-white/10 rounded-[40px] p-8 lg:p-12 shadow-2xl relative"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
               <ShieldCheck size={24} className="text-[#00FF41]" />
               <h2 className="text-2xl font-[1000] uppercase tracking-widest text-white italic leading-none">SIGN UP</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-white/30 uppercase tracking-widest px-1">USERNAME</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#4CC9F0] transition-colors" size={16} />
                  <input
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-black focus:border-[#4CC9F0] outline-none transition-all"
                    placeholder="CHOOSE_HANDLE"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)} //
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-white/30 uppercase tracking-widest px-1">CAMPUS_EMAIL</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#9155FD] transition-colors" size={16} />
                  <input
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-black focus:border-[#9155FD] outline-none transition-all"
                    placeholder="NAME@BMSCE.AC.IN"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)} //
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-white/30 uppercase tracking-widest px-1">KEY</label>
                  <input
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3.5 text-sm font-black focus:border-[#F72585] outline-none transition-all"
                    placeholder="••••••"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} //
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-white/30 uppercase tracking-widest px-1">RE_KEY</label>
                  <input
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3.5 text-sm font-black focus:border-white outline-none transition-all"
                    placeholder="••••••"
                    type="password"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)} //
                  />
                </div>
              </div>

              {error && (
                <p className="text-[9px] font-black text-red-500 uppercase tracking-widest text-center mt-2">{error}</p>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRegister} //
                className="w-full mt-6 py-4 rounded-2xl bg-white text-black font-[1000] uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-[#F72585] hover:text-white transition-all shadow-lg"
              >
                INITIALIZE IDENTITY <ArrowRight size={18} strokeWidth={3} />
              </motion.button>

              <div className="pt-6 mt-2 border-t border-white/5 text-center">
                 <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-3">Identity already exists?</p>
                 <button 
                  onClick={() => navigate("/login")} //
                  className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all text-[#4CC9F0]"
                 >
                   BACK TO LOGIN
                 </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}