"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  MapPin, 
  Calendar, 
  CreditCard, 
  ShieldCheck, 
  Home, 
  ChevronLeft,
  QrCode,
  Download,
  PlaneLanding,
  Star
} from "lucide-react";
import Link from "next/link";

type TrackingStage = {
  id?: string;
  stage: string;
  label: string;
  description: string;
  icon: any;
  status: 'completed' | 'current' | 'pending';
  completed_at?: string;
};

const STAGE_CONFIG: Record<string, { label: string, description: string, icon: any }> = {
  'confirmed': { 
    label: 'Booking Confirmed', 
    description: 'Your request has been received and confirmed by our system.', 
    icon: CheckCircle2 
  },
  'payment_verified': { 
    label: 'Payment Verified', 
    description: 'Your payment was successfully processed and verified.', 
    icon: CreditCard 
  },
  'host_approved': { 
    label: 'Host Approved', 
    description: 'The property host has reviewed and approved your stay.', 
    icon: ShieldCheck 
  },
  'ready': { 
    label: 'Ready for Check-in', 
    description: 'Everything is prepared for your arrival in Zanzibar.', 
    icon: Home 
  },
  'completed': { 
    label: 'Trip Completed', 
    description: 'Thank you for choosing Oceanora for your journey.', 
    icon: Star 
  }
};

function TrackingContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("id");
  const [booking, setBooking] = useState<any>(null);
  const [tracking, setTracking] = useState<TrackingStage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrackingData() {
      if (!bookingId) return;
      
      // 1. Fetch booking
      const { data: bData, error: bError } = await supabase
        .from("bookings")
        .select(`*, listing:listing_id (*)`)
        .eq("id", bookingId)
        .single();

      if (bData) {
        setBooking(bData);
        
        // 2. Fetch tracking stages
        const { data: tData, error: tError } = await supabase
          .from("booking_tracking")
          .select("*")
          .eq("booking_id", bookingId)
          .order("updated_at", { ascending: true });

        // Map database stages or use defaults if none exist
        const stages: TrackingStage[] = Object.keys(STAGE_CONFIG).map((stageKey) => {
          const dbStage = tData?.find(s => s.stage === stageKey);
          return {
            stage: stageKey,
            ...STAGE_CONFIG[stageKey],
            status: dbStage ? (dbStage.status as any) : 'pending',
            completed_at: dbStage?.completed_at
          };
        });
        
        setTracking(stages);
      }
      setLoading(false);
    }
    fetchTrackingData();
  }, [bookingId]);

  if (!bookingId) {
    return (
      <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800">
        <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-6" />
        <h2 className="text-2xl font-black mb-4">No Booking Selected</h2>
        <p className="text-slate-500 mb-8">Select a booking from your list to track its real-time progress.</p>
        <Link href="/dashboard/bookings" className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-600/20">Go to My Bookings</Link>
      </div>
    );
  }

  if (loading) return <div className="animate-pulse space-y-8">
    <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-[3rem]"></div>
    <div className="h-96 bg-slate-100 dark:bg-slate-800 rounded-[3rem]"></div>
  </div>;

  if (!booking) return <div className="text-center py-20">Booking not found</div>;

  return (
    <div className="space-y-10 pb-20">
      {/* Back & Title */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/bookings" className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-50 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-black tracking-tight">Booking Tracker</h1>
          <p className="text-slate-500 text-sm">ID: {booking.id}</p>
        </div>
      </div>

      {/* Hero Tracking Card */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 sm:p-12 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest">
                <Clock className="w-3 h-3" /> 
                {new Date(booking.start_date) > new Date() 
                  ? `${Math.ceil((new Date(booking.start_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} Days Until Check-in`
                  : 'Trip in Progress'}
              </div>
              <h2 className="text-4xl font-black">{booking.listing.title}</h2>
              <div className="flex flex-wrap gap-6 text-blue-50 opacity-90">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> {booking.listing.location}
                </div>
                <div className="flex items-center gap-2 text-sm font-bold">
                  <Calendar className="w-4 h-4" /> 
                  {new Date(booking.start_date).toLocaleDateString()} — {new Date(booking.end_date).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-3xl shadow-2xl flex-shrink-0">
              <QrCode className="w-24 h-24 text-slate-900" />
              <p className="text-[10px] font-black text-slate-400 text-center mt-2 tracking-widest uppercase">Verify Booking</p>
            </div>
          </div>
        </div>

        {/* Progress Timeline */}
        <div className="p-8 sm:p-12">
          <div className="relative">
            {/* Connector Line */}
            <div className="absolute left-6 top-0 bottom-0 w-1 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
            
            <div className="space-y-12">
              {tracking.map((stage, idx) => (
                <div key={idx} className="relative flex gap-8 group">
                  {/* Status Indicator */}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center z-10 shadow-lg transition-all duration-500 ${
                    stage.status === 'completed' 
                      ? 'bg-blue-600 text-white' 
                      : stage.status === 'current'
                      ? 'bg-amber-500 text-white animate-pulse ring-8 ring-amber-500/10'
                      : 'bg-white dark:bg-slate-800 text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}>
                    <stage.icon className="w-6 h-6" />
                  </div>

                  <div className="flex-1 pt-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                      <h3 className={`text-xl font-black ${stage.status === 'pending' ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                        {stage.label}
                      </h3>
                      {stage.completed_at && (
                        <span className="text-xs font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-lg">
                          {new Date(stage.completed_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className={`text-sm leading-relaxed ${stage.status === 'pending' ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                      {stage.description}
                    </p>
                    
                    {stage.status === 'current' && stage.stage === 'payment_verified' && booking.payment_status !== 'paid' && (
                      <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-800/50">
                        <p className="text-xs font-bold text-amber-700 dark:text-amber-500">Action Required: Complete remaining payment to finalize your booking.</p>
                        <button className="mt-2 text-xs font-black text-blue-600 hover:underline">Pay ${booking.total_price} Now</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-4 justify-between items-center">
          <div className="text-sm font-medium text-slate-500">
            Check-in time: <span className="font-bold text-slate-900 dark:text-white">2:00 PM</span>
          </div>
          <div className="flex gap-3">
             <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all">
               <Download className="w-4 h-4" /> Get Receipt
             </button>
             <Link href={`/dashboard/messages?booking_id=${booking.id}`} className="px-6 py-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl font-bold text-sm hover:scale-105 transition-all">
               Message Host
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="animate-pulse h-96 bg-slate-100 rounded-[3rem]"></div>}>
      <TrackingContent />
    </Suspense>
  );
}
