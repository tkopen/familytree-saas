import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

function env(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export async function POST(req: Request) {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", env("NEXT_PUBLIC_APP_URL")));

  const { data: isAdmin } = await supabase
    .from("platform_admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!isAdmin) return NextResponse.redirect(new URL("/app/admin", env("NEXT_PUBLIC_APP_URL")));

  const form = await req.formData();
  const id = String(form.get("id") || "");
  if (!id) return NextResponse.redirect(new URL("/app/admin/manual-payments", env("NEXT_PUBLIC_APP_URL")));

  const supabaseAdmin = createClient(env("NEXT_PUBLIC_SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false }
  });

  await supabaseAdmin.from("manual_payments").update({
    status: "rejected",
    reviewed_at: new Date().toISOString(),
    reviewer_user_id: user.id
  }).eq("id", id);

  return NextResponse.redirect(new URL("/app/admin/manual-payments", env("NEXT_PUBLIC_APP_URL")));
}
