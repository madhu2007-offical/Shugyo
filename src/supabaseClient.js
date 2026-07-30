import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase environment variables are missing! Please check your .env.local file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Utility function to log activity and record streaks.
 * It inserts a row in the public.streaks table for the current date.
 * Since the table has a unique constraint on (user_id, activity_date),
 * it will gracefully ignore duplicate insertions (upsert with no-op)
 * or we can safely handle it via a simple select or single insert.
 */
export async function logActivity(userId) {
  if (!userId) return;

  const today = new Date().toISOString().split('T')[0];

  try {
    const { error } = await supabase
      .from('streaks')
      .upsert({ user_id: userId, activity_date: today }, { onConflict: 'user_id,activity_date' });

    if (error) {
      // If code is 23505 (unique_violation) it's already logged today, which is fine
      if (error.code !== '23505') {
        console.error('Error logging activity to streaks:', error);
      }
    }
  } catch (err) {
    console.error('Failed to log activity streak:', err);
  }
}
