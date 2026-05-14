import { supabase } from "./supabase"
import { createClient } from "@supabase/supabase-js"

// For server-side operations that need to bypass RLS to log actions securely
export const logAuditServer = async (userId: string | null, actionType: string, resource: string, description: string) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn("Audit log skipped: Missing Supabase Service Role Key")
    return
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

  const { error } = await supabaseAdmin.from("audit_logs").insert({
    user_id: userId,
    action_type: actionType,
    resource: resource,
    description: description
  })

  if (error) {
    console.error("Failed to write audit log:", error)
  }
}

// For client-side operations (requires user to be authenticated and RLS policy to allow insert)
export const logAuditClient = async (actionType: string, resource: string, description: string) => {
  const { data: { session } } = await supabase.auth.getSession()
  
  const { error } = await supabase.from("audit_logs").insert({
    user_id: session?.user?.id || null,
    action_type: actionType,
    resource: resource,
    description: description
  })

  if (error) {
    console.error("Failed to write audit log:", error)
  }
}
