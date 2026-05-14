"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/app/lib/supabase"

type Profile = {
  id: string
  email: string
  full_name: string
  role: string
  status?: string
  created_at: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [session, setSession] = useState<any>(null)

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [role, setRole] = useState("user")

  useEffect(() => {
    fetchUsers()
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
    
    if (error) {
      console.error("Error fetching users", error)
    } else {
      setUsers(data || [])
    }
    setLoading(false)
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) return alert("Not authenticated")

    setActionLoading(true)
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: "create",
          email,
          password,
          fullName,
          role
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create user")
      
      alert("User created successfully!")
      setIsModalOpen(false)
      setEmail("")
      setPassword("")
      setFullName("")
      setRole("user")
      fetchUsers()
    } catch (err: any) {
      alert(err.message)
    }
    setActionLoading(false)
  }

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to completely delete this user? This cannot be undone.")) return
    if (!session) return alert("Not authenticated")

    setActionLoading(true)
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ action: "delete", userId: id })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to delete user")
      
      fetchUsers()
    } catch (err: any) {
      alert(err.message)
    }
    setActionLoading(false)
  }

  const handleUpdateRole = async (id: string, newRole: string) => {
    if (!session) return alert("Not authenticated")
    setActionLoading(true)
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ action: "update", userId: id, role: newRole })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to update role")
      
      fetchUsers()
    } catch (err: any) {
      alert(err.message)
    }
    setActionLoading(false)
  }

  const handleUpdateStatus = async (id: string, newStatus: string, currentRole: string) => {
    if (!session) return alert("Not authenticated")
    setActionLoading(true)
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ action: "update", userId: id, role: currentRole, status: newStatus })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to update status")
      
      fetchUsers()
    } catch (err: any) {
      // If column doesn't exist, it will throw.
      alert(err.message || "Status column might be missing in database schema.")
    }
    setActionLoading(false)
  }

  if (loading) {
    return <div className="animate-pulse bg-zinc-200 dark:bg-zinc-800 h-64 rounded-2xl w-full"></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-black dark:text-white tracking-tight">User Management</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage all platform users, roles, and access.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl shadow-md hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          + Add New User
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
                <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">User</th>
                <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Role</th>
                <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Joined</th>
                <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/50 dark:to-cyan-900/50 flex items-center justify-center text-blue-700 dark:text-cyan-400 font-bold uppercase shrink-0">
                        {user.full_name?.charAt(0) || user.email?.charAt(0) || "?"}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-black dark:text-white">{user.full_name || "Unknown"}</div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <select 
                      value={user.role} 
                      onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                      disabled={actionLoading}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg border appearance-none cursor-pointer outline-none transition-colors
                        ${user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800/50' : 
                          user.role === 'provider' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50' : 
                          'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
                        }`}
                    >
                      <option value="user">User</option>
                      <option value="provider">Staff (Provider)</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <select 
                      value={user.status || 'active'} 
                      onChange={(e) => handleUpdateStatus(user.id, e.target.value, user.role)}
                      disabled={actionLoading}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg border appearance-none cursor-pointer outline-none transition-colors
                        ${(!user.status || user.status === 'active') ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50' : 
                          'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50'
                        }`}
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </td>
                  <td className="p-4 text-sm text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={actionLoading}
                      className="text-xs font-bold text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-500">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl relative overflow-hidden">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold text-black dark:text-white mb-6">Create User</h2>
            
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Full Name</label>
                <input required type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white transition-all"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Email</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white transition-all"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Password</label>
                <input required type="password" minLength={6} value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white transition-all"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Role</label>
                <select value={role} onChange={e => setRole(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white transition-all appearance-none">
                  <option value="user">User</option>
                  <option value="provider">Staff (Provider)</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button disabled={actionLoading} type="submit" className="w-full mt-2 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl shadow-md hover:opacity-90 transition-opacity disabled:opacity-50">
                {actionLoading ? "Creating..." : "Create Account"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
