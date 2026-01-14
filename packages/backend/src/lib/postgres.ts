import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create Supabase client with service role key (bypasses RLS)
const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// Export the admin client for use in other modules
export { supabaseAdmin };

// Helper function to upsert TP member using service role (bypasses RLS)
export async function upsertTPMemberDirect(
  tpUserId: number,
  name: string | null,
  tpMembershipNumber: string | null
) {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not configured');
  }

  // Try using the upsert_tp_member RPC function first
  let { data, error } = await supabaseAdmin
    .rpc('upsert_tp_member', {
      p_tp_user_id: tpUserId,
      p_name: name,
      p_tp_membership_number: tpMembershipNumber
    })
    .single();

  // If RPC not in cache or has errors, try direct table access (service role bypasses RLS)
  if (error && (error.code === 'PGRST202' || error.code === 'PGRST205' || error.code === '42702')) {
    const result = await supabaseAdmin
      .from('tp_members')
      .upsert({
        tp_user_id: tpUserId,
        name: name,
        tp_membership_number: tpMembershipNumber
      })
      .select()
      .single();

    data = result.data;
    error = result.error;
  }

  if (error) throw error;
  return data;
}
 
 
 
 
