import { NextResponse } from "next/server";
import Papa from "papaparse";
import { z } from "zod";
import { createSupabaseServer } from "@/lib/supabase/server";

const Query = z.object({ tenantId: z.string().uuid() });

export async function POST(req: Request) {
  const url = new URL(req.url);
  const parsedQ = Query.safeParse(Object.fromEntries(url.searchParams.entries()));
  if (!parsedQ.success) return NextResponse.json({ error: "Bad tenantId" }, { status: 400 });
  const tenantId = parsedQ.data.tenantId;

  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // permission: owner/admin/editor
  const { data: mem } = await supabase
    .from("tenant_members")
    .select("role")
    .eq("tenant_id", tenantId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!mem || !["owner","admin","editor"].includes(mem.role)) {
    return NextResponse.json({ error: "No permission" }, { status: 403 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const text = await file.text();
  const result = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: true });

  if (result.errors?.length) {
    return NextResponse.json({ error: `CSV 解析失败：${result.errors[0].message}` }, { status: 400 });
  }

  let inserted = 0;
  let skipped = 0;

  for (const row of (result.data || [])) {
    const full_name = (row.full_name || "").trim();
    if (!full_name) { skipped++; continue; }

    const genderRaw = (row.gender || "unknown").trim();
    const gender = (["male","female","unknown"].includes(genderRaw) ? genderRaw : "unknown") as any;

    let custom_fields: any = null;
    const customStr = (row.custom_fields_json || "").trim();
    if (customStr) {
      try { custom_fields = JSON.parse(customStr); } catch { /* ignore */ }
    }

    const payload: any = {
      tenant_id: tenantId,
      full_name,
      gender,
      birth_date: row.birth_date?.trim() || null,
      death_date: row.death_date?.trim() || null,
      notes: row.notes?.trim() || null,
      custom_fields
    };

    const { error } = await supabase.from("persons").insert(payload);
    if (error) {
      // 简化策略：失败就跳过（你可改成记录到 imports 报告表）
      skipped++;
      continue;
    }
    inserted++;
  }

  return NextResponse.json({ inserted, skipped });
}
