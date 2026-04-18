import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, BadgeCheck, Save, Zap, Terminal, Activity, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/useAuth";

export default function ProfilePage() {
  const { user } = useAuth();

  // Editable fields
  const [username, setUsername] = useState(user?.username || "OPERATOR");
  const [email, setEmail] = useState(user?.email || "NOT_SET");
  const [role] = useState(user?.role || "PARTICIPANT");
  const [saving, setSaving] = useState(false);

  const initials = username ? username.charAt(0).toUpperCase() : "U";

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: Connect to backend update endpoint
      // await ParticipantService.updateProfile({ username, email });

      setTimeout(() => {
        setSaving(false);
      }, 800);
    } catch {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white py-16 px-4 selection:bg-[#F72585]">
      {/* --- BACKGROUND TERMINAL OVERLAYS --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#1a101a_0%,#050505_100%)] opacity-70" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* HEADER */}
        <motion.header 
          initial={{ opacity: 0, x: -30 }} 
          animate={{ opacity: 1, x: 0 }} 
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="h-[3px] w-12 bg-[#F72585]" />
            <p className="text-[11px] tracking-[0.7em] text-white/50 uppercase font-black">Identity_Registry_v2.0</p>
          </div>
          <h1 className="text-5xl md:text-7xl font-[1000] uppercase tracking-tighter leading-none">
            User <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F72585] via-[#9155FD] to-[#4CC9F0] italic">Profile</span>
          </h1>
        </motion.header>

        {/* PROFILE CARD */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0a0a0a] border-2 border-white/10 rounded-[45px] p-10 md:p-14 shadow-2xl relative overflow-hidden group hover:border-[#F72585]/30 transition-all"
        >
          {/* Background Decor */}
          <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none group-hover:opacity-[0.07] transition-opacity">
            <User size={280} />
          </div>

          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-12 relative">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="w-32 h-32 rounded-[35px] bg-gradient-to-br from-[#F72585] to-[#9155FD] flex items-center justify-center text-white text-5xl font-[1000] shadow-[0_0_40px_rgba(247,37,133,0.3)] relative z-10"
            >
              {initials}
            </motion.div>
            <div className="mt-4 flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/10">
               <ShieldCheck size={14} className="text-[#00FF41]" />
               <span className="text-[10px] font-black uppercase tracking-widest text-[#00FF41]">Authenticated_User</span>
            </div>
          </div>

          {/* FIELDS GRID */}
          <div className="space-y-8 relative z-10">
            {/* Username Input */}
            <div className="space-y-3">
              <label className="text-[11px] font-black text-white/40 uppercase tracking-[0.4em] flex items-center gap-3 px-1">
                <User className="w-4 h-4 text-[#4CC9F0] stroke-[3px]" />
                Registry_Handle
              </label>
              <input
                type="text"
                className="w-full bg-white/[0.04] border-2 border-white/5 rounded-2xl px-6 py-4 text-sm font-black focus:border-[#4CC9F0] outline-none transition-all placeholder:text-white/10"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ENTER_HANDLE..."
              />
            </div>

            {/* Email Input */}
            <div className="space-y-3">
              <label className="text-[11px] font-black text-white/40 uppercase tracking-[0.4em] flex items-center gap-3 px-1">
                <Mail className="w-4 h-4 text-[#9155FD] stroke-[3px]" />
                Communication_Channel
              </label>
              <input
                type="email"
                className="w-full bg-white/[0.04] border-2 border-white/5 rounded-2xl px-6 py-4 text-sm font-black focus:border-[#9155FD] outline-none transition-all placeholder:text-white/10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ENTER_CORE_EMAIL..."
              />
            </div>

            {/* Role Component | Read-Only */}
            <div className="space-y-3">
              <label className="text-[11px] font-black text-white/40 uppercase tracking-[0.4em] flex items-center gap-3 px-1">
                <BadgeCheck className="w-4 h-4 text-[#F72585] stroke-[3px]" />
                Privilege_Tier
              </label>
              <div className="px-6 py-4 rounded-2xl bg-white/5 border-2 border-dashed border-white/10 text-[#F72585] font-[1000] tracking-[0.3em] flex items-center justify-between">
                {role.toUpperCase()}
                <Zap size={16} className="animate-pulse" />
              </div>
            </div>
          </div>

          {/* SAVE ACTION */}
          <div className="mt-14 flex flex-col items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              disabled={saving}
              className="w-full max-w-md py-5 rounded-[25px] bg-white text-black font-[1000] uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-4 hover:bg-[#F72585] hover:text-white transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[#F72585]/40 disabled:opacity-20"
            >
              {saving ? (
                <>
                  <Activity className="animate-spin" size={20} />
                  SYNCING_REGISTRY...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 stroke-[3px]" />
                  Update_Identity
                </>
              )}
            </motion.button>
            <p className="mt-6 text-[9px] font-bold text-white/20 uppercase tracking-[0.5em]">Synchronized across all cluster nodes</p>
          </div>
        </motion.div>

        {/* STATUS FOOTER */}
        <div className="mt-12 flex justify-center gap-6 opacity-30">
           <div className="flex items-center gap-2">
             <Terminal size={12} />
             <span className="text-[8px] font-black uppercase tracking-widest">Protocol_Secure</span>
           </div>
           <div className="flex items-center gap-2">
             <Activity size={12} />
             <span className="text-[8px] font-black uppercase tracking-widest">Uptime_Optimal</span>
           </div>
        </div>
      </div>
    </div>
  );
}