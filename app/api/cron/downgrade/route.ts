import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function env(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export async function GET(req: Request) {
  // Simple protection: require a secret header if provided
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const got = (req.headers.get("x-cron-secret") || "").trim();
    if (got !== secret) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseAdmin = createClient(env("NEXT_PUBLIC_SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false }
  });

  const { data: setting } = await supabaseAdmin
    .from("app_settings")
    .select("value")
    .eq("key", "auto_downgrade_enabled")
    .maybeSingle();

  const enabled = (setting?.value ?? true) === true;
  if (!enabled) return NextResponse.json({ ok: true, skipped: true });

  const nowIso = new Date().toISOString();

  // find expired paid tenants
  const { data: expired, error } = await supabaseAdmin
    .from("tenants")
    .select("id,plan,plan_expires_at")
    .neq("plan", "free")
    .not("plan_expires_at", "is", null)
    .lte("plan_expires_at", nowIso)
    .limit(2000);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let updated = 0;
  for (const t of (expired || [])) {
    const { error: uErr } = await supabaseAdmin
      .from("tenants")
      .update({ plan: "free" })
      .eq("id", t.id);
    if (!uErr) updated++;
  }

  return NextResponse.json({ ok: true, updated });
}
