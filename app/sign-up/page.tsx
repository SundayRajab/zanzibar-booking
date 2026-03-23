"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../lib/supabase";

export default function SignUp() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccess(true);
      // Optional: Wait and push to dashboard
      setTimeout(() => router.push("/dashboard"), 2000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-zinc-50 dark:bg-[#0a0a0a]">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900/80 p-8 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 backdrop-blur-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 mb-2">
            Join Oceanora
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            Create an account to book your luxury getaway.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 mb-6 text-sm text-red-700 bg-red-100 rounded-xl dark:bg-red-900/30 dark:text-red-400">
            {errorMsg}
          </div>
        )}

        {success ? (
          <div className="p-6 text-center text-green-700 bg-green-50 rounded-xl dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800/50">
            <h3 className="font-bold text-lg mb-2">Registration Successful!</h3>
            <p className="text-sm">You are now logged in. Connecting you to your dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSignUp} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Full Name</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white" placeholder="John Doe" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white" placeholder="john@example.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white" placeholder="••••••••" required />
            </div>

            <button type="submit" disabled={loading} className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-cyan-500/25 transition-all active:scale-95 flex justify-center items-center">
              {loading ? "Creating Account..." : "Create Account"}
            </button>
            <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-4">
              Already have an account? <Link href="/sign-in" className="text-blue-600 dark:text-cyan-400 font-semibold hover:underline">Sign In</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
