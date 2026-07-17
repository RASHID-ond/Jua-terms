import { supabase } from "./supabaseClient";

export interface AdminProfile {
  id: string;
  email: string;
  name: string;
  role: "Super Admin" | "Editor";
  active: boolean;
}

// Signs in with Supabase Auth. Throws with a readable message on failure.
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return data;
}

export async function signOut() {
  await supabase.auth.signOut();
}

// Returns the logged-in admin's profile (name/role/etc) from the `admins`
// table, or null if there's no active session or the user isn't an admin.
export async function getCurrentAdmin(): Promise<AdminProfile | null> {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) return null;

  const { data, error } = await supabase
    .from("admins")
    .select("id, email, name, role, active")
    .eq("id", userId)
    .eq("active", true)
    .single();

  if (error || !data) return null;
  return data as AdminProfile;
}

// Whether any admin exists yet. Used by the setup page to decide whether to
// show "create the first Super Admin" or redirect straight to login.
export async function anyAdminExists(): Promise<boolean> {
  const { count, error } = await supabase
    .from("admins")
    .select("id", { count: "exact", head: true });
  if (error) return true; // fail safe: don't show setup if we can't tell
  return (count ?? 0) > 0;
}

// One-time bootstrap: creates the very first Super Admin. Relying on the
// database policy "admins_bootstrap_or_super_insert", which only allows this
// insert while the admins table is still empty.
export async function createFirstSuperAdmin(name: string, email: string, password: string) {
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
  if (signUpError) throw new Error(signUpError.message);

  const userId = signUpData.user?.id;
  if (!userId) {
    throw new Error(
      "Account created, but no active session was returned. If email confirmation " +
      "is enabled on your Supabase project, confirm the email first, then log in " +
      "and re-run setup."
    );
  }

  const { error: insertError } = await supabase.from("admins").insert({
    id: userId,
    name,
    email,
    role: "Super Admin",
    active: true
  });
  if (insertError) throw new Error(insertError.message);
}

export async function logAudit(adminEmail: string, action: string) {
  await supabase.from("audit_logs").insert({ admin_email: adminEmail, action });
}
