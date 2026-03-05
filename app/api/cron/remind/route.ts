import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function env(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const got = (req.headers.get("x-cron-secret") || "").trim();
    if (got !== secret) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseAdmin = createClient(env("NEXT_PUBLIC_SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false }
  });

  const { data: settings } = await supabaseAdmin
    .from("app_settings")
    .select("key,value")
    .in("key", ["remind_enabled","remind_before_days"]);

  const map = new Map<string, any>();
  (settings || []).forEach((r: any) => map.set(r.key, r.value));

  const enabled = (map.get("remind_enabled") ?? true) === true;
  if (!enabled) return NextResponse.json({ ok: true, skipped: true });

  const beforeDays = Number(map.get("remind_before_days") ?? 7);
  const now = new Date();
  const to = new Date(now.getTime() + beforeDays * 24 * 60 * 60 * 1000);

  const { data: expiring, error } = await supabaseAdmin
    .from("tenants")
    .select("id,name,plan,plan_expires_at")
    .neq("plan", "free")
    .not("plan_expires_at", "is", null)
    .gte("plan_expires_at", now.toISOString())
    .lte("plan_expires_at", to.toISOString())
    .limit(2000);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // De-dup: one reminder per tenant per day (simple check by title + created_at >= today)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

  let inserted = 0;
  for (const t of (expiring || [])) {
    const title = "套餐即将到期提醒";
    // check existing
    const { data: exist } = await supabaseAdmin
      .from("notifications")
      .select("id")
      .eq("tenant_id", t.id)
      .eq("title", title)
      .gte("created_at", today)
      .limit(1);

    if (exist && exist.length) continue;

    const body = `当前套餐：${t.plan}；到期时间：${t.plan_expires_at}`;
    const { error: iErr } = await supabaseAdmin.from("notifications").insert({
      tenant_id: t.id,
      level: "warning",
      title,
      body
    });
    if (!iErr) inserted++;
  }

  return NextResponse.json({ ok: true, inserted });
}
