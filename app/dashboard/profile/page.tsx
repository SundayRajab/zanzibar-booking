"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/AuthContext";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Camera, 
  ShieldCheck, 
  Bell, 
  Lock, 
  FileText,
  Save,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  LogOut
} from "lucide-react";

export default function ProfilePage() {
  const { user, refreshUser, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ bookings: 0, favorites: 0, reviews: 0 });
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
    country: "",
    address: "",
    avatar_url: "",
  });

  useEffect(() => {
    if (user) {
      setProfile({
        full_name: user.user_metadata?.full_name || "",
        email: user.email || "",
        phone: user.user_metadata?.phone || "",
        country: user.user_metadata?.country || "Tanzania",
        address: user.user_metadata?.address || "",
        avatar_url: user.user_metadata?.avatar_url || "",
      });
      fetchStats();
    }
  }, [user]);

  async function fetchStats() {
    if (!user) return;
    const [b, f, r] = await Promise.all([
      supabase.from("bookings").select("*", { count: 'exact', head: true }).eq("user_id", user.id),
      supabase.from("favorites").select("*", { count: 'exact', head: true }).eq("user_id", user.id),
      supabase.from("reviews").select("*", { count: 'exact', head: true }).eq("user_id", user.id),
    ]);
    setStats({
      bookings: b.count || 0,
      favorites: f.count || 0,
      reviews: r.count || 0
    });
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Update Auth User Metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { 
          full_name: profile.full_name,
          phone: profile.phone,
          country: profile.country,
          address: profile.address,
          avatar_url: profile.avatar_url
        }
      });

      if (authError) throw authError;

      // 2. Update public.profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          country: profile.country,
          address: profile.address,
          avatar_url: profile.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (profileError) throw profileError;

      alert("Profile updated successfully!");
      refreshUser();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage (assuming 'avatars' bucket exists)
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      // Automatically update profile after upload
      await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
      
      alert("Avatar updated!");
      refreshUser();
    } catch (error: any) {
      alert("Note: Storage bucket 'avatars' might not be configured yet. " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      {/* Profile Header */}
      <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-8">
          <div className="relative group">
            <div className="w-40 h-40 rounded-[2rem] bg-slate-100 dark:bg-slate-800 overflow-hidden border-4 border-white dark:border-slate-700 shadow-xl group-hover:shadow-2xl transition-all">
              <img 
                src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name)}&background=random&size=200`} 
                alt="Avatar" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <label className="absolute -bottom-2 -right-2 p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-600/30 hover:scale-110 transition-transform cursor-pointer">
              <Camera className="w-5 h-5" />
              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={loading} />
            </label>
          </div>
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <h1 className="text-3xl font-black tracking-tight">{profile.full_name || "New Traveler"}</h1>
              <span className="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-wider rounded-full border border-blue-100 dark:border-blue-800/50 w-fit mx-auto sm:mx-0">
                Verified Member
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">{user?.email}</p>
            
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center sm:text-left">
                <div className="text-xl font-black text-slate-900 dark:text-white">{stats.bookings}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trips</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-xl font-black text-slate-900 dark:text-white">{stats.favorites}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Saved</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-xl font-black text-slate-900 dark:text-white">{stats.reviews}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reviews</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
             <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Loyalty Points</div>
             <div className="text-4xl font-black text-blue-600">{user?.user_metadata?.loyalty_points || 50}</div>
          </div>
        </div>
      </section>

      {/* Main Content Sections */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-3">
          {[
            { id: 'personal', label: 'Personal Information', icon: User },
            { id: 'security', label: 'Login & Security', icon: ShieldCheck },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'preferences', label: 'Booking Preferences', icon: Globe },
          ].map((item) => (
            <button 
              key={item.id}
              className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl font-bold text-sm transition-all ${
                item.id === 'personal' 
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 translate-x-2' 
                  : 'text-slate-500 hover:bg-white dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5" />
                {item.label}
              </div>
              {item.id === 'personal' && <CheckCircle2 className="w-4 h-4" />}
            </button>
          ))}
          <button 
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>

        {/* Form Content */}
        <div className="lg:col-span-2">
          <form onSubmit={handleUpdateProfile} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 sm:p-10 shadow-sm space-y-8">
            <div className="space-y-6">
              <h3 className="text-xl font-black tracking-tight flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <User className="w-5 h-5 text-blue-600" /> Personal Information
              </h3>
              
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input 
                      type="text" 
                      value={profile.full_name}
                      onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                      className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all font-medium" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input 
                      type="tel" 
                      value={profile.phone}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all font-medium" 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                <div className="relative group opacity-60">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="email" 
                    value={profile.email}
                    disabled
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none cursor-not-allowed font-medium" 
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Country</label>
                  <div className="relative group">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input 
                      type="text" 
                      value={profile.country}
                      onChange={(e) => setProfile({...profile, country: e.target.value})}
                      className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all font-medium" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Full Address</label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input 
                      type="text" 
                      value={profile.address}
                      onChange={(e) => setProfile({...profile, address: e.target.value})}
                      className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all font-medium" 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full sm:w-auto px-10 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <Save className="w-5 h-5" /> Save Changes
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Security Alert */}
          <div className="mt-8 p-6 bg-amber-50 dark:bg-amber-900/10 rounded-[2rem] border border-amber-200 dark:border-amber-800/50 flex gap-4">
             <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
             <div>
               <h4 className="font-bold text-amber-800 dark:text-amber-400 text-sm mb-1">Security Recommendation</h4>
               <p className="text-xs text-amber-700 dark:text-amber-500 leading-relaxed">
                 Protect your Zanzibar bookings by enabling two-factor authentication. We'll send a code to your phone for each login attempt.
               </p>
               <button className="mt-3 text-xs font-black text-amber-800 dark:text-amber-400 hover:underline">Setup 2FA</button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
