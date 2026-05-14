"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/app/lib/supabase"

export default function AdminPaymentsPage() {
  const [activeProvider, setActiveProvider] = useState("flutterwave")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Example Logs
  const mockLogs = [
    { id: 1, date: new Date().toISOString(), provider: "flutterwave", amount: 250, status: "Success", ref: "FLW-123456" },
    { id: 2, date: new Date(Date.now() - 86400000).toISOString(), provider: "dpo", amount: 120, status: "Failed", ref: "DPO-99887" },
    { id: 3, date: new Date(Date.now() - 172800000).toISOString(), provider: "flutterwave", amount: 500, status: "Success", ref: "FLW-223344" }
  ]

  useEffect(() => {
    fetchActiveProvider()
  }, [])

  const fetchActiveProvider = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'active_payment_provider')
      .single()

    if (!error && data) {
      setActiveProvider(data.value)
    }
    setLoading(false)
  }

  const handleProviderChange = async (provider: string) => {
    setSaving(true)
    setActiveProvider(provider)
    
    // Check if key exists
    const { data } = await supabase.from('system_settings').select('key').eq('key', 'active_payment_provider').single()
    
    if (data) {
      await supabase.from('system_settings').update({ value: provider, updated_at: new Date().toISOString() }).eq('key', 'active_payment_provider')
    } else {
      await supabase.from('system_settings').insert({ key: 'active_payment_provider', value: provider, description: 'Currently active payment provider' })
    }
    
    setSaving(false)
    alert(`Active payment provider switched to ${provider.toUpperCase()}`)
  }

  if (loading) return <div className="p-8 text-center">Loading settings...</div>

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-black text-black dark:text-white tracking-tight">Payment Providers</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage gateways and view transaction logs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Providers */}
        {[
          { id: 'flutterwave', name: 'Flutterwave', desc: 'Standard African payment gateway.', color: 'border-orange-500' },
          { id: 'dpo', name: 'DPO Group', desc: 'Direct Pay Online for global reach.', color: 'border-blue-500' },
          { id: 'selcom', name: 'Selcom', desc: 'Local Tanzanian mobile money.', color: 'border-green-500' }
        ].map(provider => (
          <div 
            key={provider.id}
            onClick={() => handleProviderChange(provider.id)}
            className={`cursor-pointer rounded-2xl p-6 border-2 transition-all ${
              activeProvider === provider.id 
                ? `bg-zinc-50 dark:bg-zinc-800 ${provider.color} shadow-md` 
                : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-black dark:text-white">{provider.name}</h3>
              {activeProvider === provider.id && (
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              )}
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">{provider.desc}</p>
            <button 
              className={`w-full py-2 rounded-xl text-sm font-bold transition-colors ${
                activeProvider === provider.id 
                  ? 'bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-white' 
                  : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {saving && activeProvider === provider.id ? 'Saving...' : activeProvider === provider.id ? 'Active Provider' : 'Switch to ' + provider.name}
            </button>
          </div>
        ))}
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden mt-8">
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800">
          <h3 className="text-lg font-bold text-black dark:text-white">Recent Transactions (Mock)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
                <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Date</th>
                <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Provider</th>
                <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Ref</th>
                <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Amount</th>
                <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {mockLogs.map(log => (
                <tr key={log.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50">
                  <td className="p-4 text-sm text-zinc-600 dark:text-zinc-300">{new Date(log.date).toLocaleString()}</td>
                  <td className="p-4 text-sm font-semibold capitalize text-black dark:text-white">{log.provider}</td>
                  <td className="p-4 text-sm text-zinc-500 dark:text-zinc-400 font-mono">{log.ref}</td>
                  <td className="p-4 text-sm font-bold text-black dark:text-white">${log.amount}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg uppercase tracking-wider ${log.status === 'Success' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'}`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
