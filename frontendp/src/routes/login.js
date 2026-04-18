import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import { User, Lock, ArrowRight, ShieldCheck} from "lucide-react"; 

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { loginUser } = useAuth(); 
  const navigate = useNavigate(); 

  const handleLogin = async () => {
    await loginUser(username, password); 
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#050505] text-white overflow-hidden relative selection:bg-[#F72585]">
      
      {/* --- BACKGROUND HUD OVERLAYS --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#1a101a_0%,#050505_100%)] opacity-80" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:50px_50px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px]" />
      </div>

      <div className="relative z-10 w-full max-w-[1200px] flex flex-col md:flex-row items-center gap-8 lg:gap-16 px-6">
        
        {/* LEFT SECTION: BRANDING (Fixed Scale) */}
        <motion.div 
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 text-center md:text-left"
        >
          <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
            <div className="h-[3px] w-12 bg-[#F72585]" />
            <p className="text-xs tracking-[0.5em] text-white/60 uppercase font-black">Member Access</p>
          </div>
          
          <h1 className="text-6xl lg:text-8xl font-[1000] uppercase tracking-tighter leading-[0.9] mb-6">
            UNIFY<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F72585] via-[#9155FD] to-[#4CC9F0] italic">EVENTS</span>
          </h1>
          
          <p className="text-sm lg:text-lg text-white/40 font-bold uppercase tracking-widest max-w-md leading-snug mb-8">
            Connect with your campus community. Join the most exciting fests, technical workshops, and cultural celebrations in one place.
          </p>

          <div className="flex items-center justify-center md:justify-start gap-4 opacity-40">
             <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border border-white/20 bg-white/5 flex items-center justify-center">
                    <User size={12} />
                  </div>
                ))}
             </div>
             <span className="text-[10px] font-bold uppercase tracking-widest">Join 5000+ Students</span>
          </div>
        </motion.div>

        {/* RIGHT SECTION: AUTH INTERFACE (Controlled Width) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-[420px] bg-[#0a0a0a] border-2 border-white/10 rounded-[40px] p-8 lg:p-12 shadow-2xl relative"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
               <ShieldCheck size={24} className="text-[#00FF41]" />
               <h2 className="text-2xl font-[1000] uppercase tracking-widest text-white italic leading-none">SIGN IN</h2>
            </div>

            <div className="space-y-6">
              {/* Username Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest px-1">USERNAME</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#4CC9F0] transition-colors" size={18} />
                  <input
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-black focus:border-[#4CC9F0] outline-none transition-all"
                    placeholder="ENTER USERNAME"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)} 
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest px-1">PASSWORD</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#F72585] transition-colors" size={18} />
                  <input
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-black focus:border-[#F72585] outline-none transition-all"
                    placeholder="ENTER PASSWORD"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} 
                  />
                </div>
              </div>

              {/* Action Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogin} 
                className="w-full mt-4 py-4 rounded-2xl bg-white text-black font-[1000] uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-[#F72585] hover:text-white transition-all shadow-lg"
              >
                LOG INTO ACCOUNT <ArrowRight size={18} strokeWidth={3} />
              </motion.button>

              {/* Identity Pivot */}
              <div className="pt-8 mt-4 border-t border-white/5 text-center">
                 <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-4">Need an account?</p>
                 <button 
                  onClick={() => navigate("/register")} 
                  className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all text-[#9155FD]"
                 >
                   CREATE NEW IDENTITY
                 </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}