"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "../lib/supabase"

export default function SignIn() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg("")

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setErrorMsg(error.message)
      setLoading(false)
    } else {
      router.push("/dashboard")
      // Do not set loading to false here, keeps the button spinning until page navigates
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-zinc-50 dark:bg-[#0a0a0a]">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900/80 p-8 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 backdrop-blur-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 mb-2">
            Welcome Back
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            Sign in to manage your bookings.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 mb-6 text-sm text-red-700 bg-red-100 rounded-xl dark:bg-red-900/30 dark:text-red-400">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
              placeholder="user@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-cyan-500/25 transition-all active:scale-95 flex justify-center items-center"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              "Sign In securely"
            )}
          </button>
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-4">
            New to Oceanora? <Link href="/sign-up" className="text-blue-600 dark:text-cyan-400 font-semibold hover:underline">Create Account</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
