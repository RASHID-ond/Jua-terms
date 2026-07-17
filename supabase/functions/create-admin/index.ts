// Supabase Edge Function: create-admin
//
// Creates a new admin account. This has to run server-side (here, on
// Supabase's own infrastructure) because creating an auth user for someone
// else requires the SERVICE_ROLE key, which must never be shipped to the
// browser. The anon key used by the rest of the app cannot do this safely.
//
// Deploy with:
//   supabase functions deploy create-admin
//
// Requires these secrets to be set (Supabase sets the first two automatically
// for every project; you don't need to add them yourself):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  // Identify the caller from their own auth token, so we can confirm they're
  // a Super Admin before letting them create anyone else's account.
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Missing Authorization header" }), { status: 401 });
  }
  const callerToken = authHeader.replace("Bearer ", "");

  const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const { data: callerData, error: callerError } = await adminClient.auth.getUser(callerToken);
  if (callerError || !callerData.user) {
    return new Response(JSON.stringify({ error: "Invalid session" }), { status: 401 });
  }

  const { data: callerAdmin, error: callerAdminError } = await adminClient
    .from("admins")
    .select("role, active")
    .eq("id", callerData.user.id)
    .single();

  if (callerAdminError || !callerAdmin || callerAdmin.role !== "Super Admin" || !callerAdmin.active) {
    return new Response(JSON.stringify({ error: "Only a Super Admin can create new admin accounts" }), {
      status: 403
    });
  }

  const { name, email, password, role } = await req.json();
  if (!name || !email || !password || !role) {
    return new Response(JSON.stringify({ error: "name, email, password, and role are required" }), {
      status: 400
    });
  }
  if (password.length < 8) {
    return new Response(JSON.stringify({ error: "Password must be at least 8 characters" }), { status: 400 });
  }
  if (role !== "Super Admin" && role !== "Editor") {
    return new Response(JSON.stringify({ error: "Role must be 'Super Admin' or 'Editor'" }), { status: 400 });
  }

  const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });
  if (createError || !newUser.user) {
    return new Response(JSON.stringify({ error: createError?.message || "Failed to create user" }), {
      status: 400
    });
  }

  const { error: insertError } = await adminClient.from("admins").insert({
    id: newUser.user.id,
    name,
    email,
    role,
    active: true
  });
  if (insertError) {
    // Roll back the auth user so we don't leave an orphaned account behind.
    await adminClient.auth.admin.deleteUser(newUser.user.id);
    return new Response(JSON.stringify({ error: insertError.message }), { status: 400 });
  }

  return new Response(JSON.stringify({ success: true, id: newUser.user.id }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
});
