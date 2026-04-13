import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type SupabaseProfileRow = {
  id: string;
  user_id: string;
  type: 'attack' | 'defense';
  data: Record<string, unknown>;
  last_modified: number;
};
