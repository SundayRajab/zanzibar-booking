"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/AuthContext";
import { 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Download, 
  Filter, 
  Plus,
  ShieldCheck,
  Zap,
  Wallet,
  AlertCircle,
  RefreshCcw,
  CheckCircle2,
  XCircle
} from "lucide-react";

type Transaction = {
  id: string;
  booking_id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  provider: string;
  provider_reference: string;
  listing_title: string;
};

export default function PaymentsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalSpent: 0, activeRefunds: 0 });

  useEffect(() => {
    fetchPayments();
  }, [user]);

  async function fetchPayments() {
    if (!user) return;
    setLoading(true);

    // 1. Fetch transactions with listing titles (via bookings)
    const { data, error } = await supabase
      .from("payment_transactions")
      .select(`
        *,
        booking:booking_id (
          listing:listing_id (title)
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      const txns = data.map(t => ({
        ...t,
        listing_title: (t.booking as any)?.listing?.title || 'Unknown Booking'
      }));
      setTransactions(txns);

      // Calc stats
      const total = txns.filter(t => t.status === 'success').reduce((sum, t) => sum + Number(t.amount), 0);
      setStats({ totalSpent: total, activeRefunds: 0 });
    }
    
    // 2. Fetch refunds for stats
    const { count: refundCount } = await supabase
      .from("refunds")
      .select("*", { count: 'exact', head: true })
      .eq("user_id", user.id)
      .eq("status", "pending");
    
    if (refundCount !== null) {
      setStats(prev => ({ ...prev, activeRefunds: refundCount }));
    }

    setLoading(false);
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'failed': return <XCircle className="w-4 h-4 text-rose-600" />;
      case 'pending': return <RefreshCcw className="w-4 h-4 text-amber-600 animate-spin" />;
      default: return <AlertCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Wallet / Spent */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-8">
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                  <Wallet className="w-6 h-6" />
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Account Overview</div>
              </div>
              <p className="text-sm font-medium text-slate-400 mb-1">Total Lifetime Spent</p>
              <h2 className="text-4xl font-black mb-6">${stats.totalSpent.toLocaleString()}</h2>
            </div>
            <div className="flex gap-2 text-xs font-bold text-slate-400">
               <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Secure Payments</span>
            </div>
          </div>
        </div>

        {/* Active Refunds */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
           <div className="space-y-4">
              <h3 className="text-xl font-black">Active Refunds</h3>
              <p className="text-slate-500 text-sm">You have {stats.activeRefunds} pending refund requests.</p>
           </div>
           <div className="mt-6">
              <div className="text-4xl font-black text-amber-500">{stats.activeRefunds}</div>
              <Link href="/dashboard/bookings" className="text-xs font-bold text-blue-600 hover:underline mt-2 inline-block">Track Refunds</Link>
           </div>
        </div>

        {/* Security / Info */}
        <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white flex flex-col justify-between">
           <ShieldCheck className="w-10 h-10 mb-4 opacity-50" />
           <p className="text-sm font-bold leading-relaxed">
             All transactions are processed through encrypted channels. We support Selcom, DPO, and Flutterwave for maximum reliability.
           </p>
           <button className="mt-4 text-xs font-black uppercase tracking-widest bg-white/20 hover:bg-white/30 py-2 rounded-lg transition-colors">Security Policy</button>
        </div>
      </div>

      {/* Transactions Table */}
      <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-black tracking-tight">Transaction History</h3>
            <p className="text-slate-500 text-sm">Real-time payment history for all your Zanzibar bookings</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm font-bold hover:bg-slate-100 transition-colors">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/20 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <th className="px-8 py-5">Transaction ID</th>
                <th className="px-8 py-5">Property / Tour</th>
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5">Amount</th>
                <th className="px-8 py-5">Provider</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i}><td colSpan={7} className="px-8 py-6 h-20 animate-pulse bg-slate-50/30"></td></tr>
                ))
              ) : transactions.length > 0 ? (
                transactions.map((txn) => (
                  <tr key={txn.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl bg-slate-50 dark:bg-slate-800`}>
                          {getStatusIcon(txn.status)}
                        </div>
                        <div>
                          <p className="text-sm font-black uppercase">{txn.id.slice(0, 10)}</p>
                          <p className="text-[10px] text-slate-400 font-medium">Ref: {txn.provider_reference || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{txn.listing_title}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-medium text-slate-500">{new Date(txn.created_at).toLocaleDateString()}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-lg font-black text-slate-900 dark:text-white">${txn.amount}</p>
                    </td>
                    <td className="px-8 py-6">
                       <span className="text-[10px] font-black uppercase text-slate-400">{txn.provider}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        txn.status === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                        txn.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        'bg-rose-50 text-rose-700 border-rose-100'
                      }`}>
                        {txn.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                        onClick={() => alert("Downloading receipt...")}
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CreditCard className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="font-bold text-slate-400">No payment transactions found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
