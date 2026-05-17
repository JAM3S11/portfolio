import { supabase } from './chat-service';
import { getAdminSettings } from './chat-service';

// Sign in with anonymous auth + password validation
export async function signInAdmin(
  password: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    const defaultPassword =
      import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
    if (password === defaultPassword) {
      return { success: true };
    }
    return { success: false, error: 'Incorrect password' };
  }

  try {
    // Try anonymous auth — non-fatal; app-level password is the real gate.
    const { error: signInError } =
      await supabase.auth.signInAnonymously();
    if (signInError) {
      console.warn('Anonymous auth unavailable (enable in Supabase dashboard for delete to work):', signInError.message);
    }

    // Validate password against admin_settings table
    const settings = await getAdminSettings();
    const validPassword =
      settings?.admin_password ||
      import.meta.env.VITE_ADMIN_PASSWORD ||
      'admin123';

    if (password === validPassword) {
      return { success: true };
    }

    // Wrong password — sign out the anonymous session if it was created
    if (!signInError) {
      await supabase.auth.signOut();
    }
    return { success: false, error: 'Incorrect password' };
  } catch (err) {
    console.error('Admin login error:', err);
    return { success: false, error: 'Login failed' };
  }
}

// Sign out admin
export async function signOut(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}

// Check if there's an active session
export async function getSession(): Promise<boolean> {
  if (!supabase) return false;
  const { data } = await supabase.auth.getSession();
  return !!data.session;
}

// Listen for auth state changes
export function onAuthChange(
  callback: (event: 'SIGNED_IN' | 'SIGNED_OUT') => void
) {
  if (!supabase) return () => {};

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_IN') callback('SIGNED_IN');
    if (event === 'SIGNED_OUT') callback('SIGNED_OUT');
  });

  return () => subscription?.unsubscribe();
}
