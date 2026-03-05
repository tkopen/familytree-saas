import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServer } from "@/lib/supabase/server";
import { PDFDocument, StandardFonts } from "pdf-lib";

const Query = z.object({ tenantId: z.string().uuid() });

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsedQ = Query.safeParse(Object.fromEntries(url.searchParams.entries()));
  if (!parsedQ.success) return NextResponse.json({ error: "Bad tenantId" }, { status: 400 });
  const tenantId = parsedQ.data.tenantId;

  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // permission: any member can export (你可按套餐/次数限制)
  const { data: mem } = await supabase
    .from("tenant_members")
    .select("role")
    .eq("tenant_id", tenantId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!mem) return NextResponse.json({ error: "No permission" }, { status: 403 });

  const { data: tenant } = await supabase
    .from("tenants")
    .select("name,plan")
    .eq("id", tenantId)
    .single();

  const { data: persons } = await supabase
    .from("persons")
    .select("full_name,gender,birth_date,death_date,custom_fields")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: true })
    .limit(5000);

  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontSize = 12;

  let page = doc.addPage([595.28, 841.89]); // A4
  let y = 800;

  const title = `${tenant?.name ?? "家族"} 族谱导出（${tenant?.plan ?? "free"}）`;
  page.drawText(title, { x: 50, y, size: 16, font });
  y -= 24;

  const subtitle = `导出时间：${new Date().toISOString()}`;
  page.drawText(subtitle, { x: 50, y, size: 10, font });
  y -= 20;

  page.drawText("人物列表：", { x: 50, y, size: 12, font });
  y -= 18;

  for (const p of (persons || [])) {
    const line = `${p.full_name} | ${p.gender} | ${p.birth_date ?? "-"} ~ ${p.death_date ?? "-"} | ${p.custom_fields ? JSON.stringify(p.custom_fields) : ""}`;
    if (y < 60) {
      page = doc.addPage([595.28, 841.89]);
      y = 800;
    }
    page.drawText(line.slice(0, 120), { x: 50, y, size: fontSize, font });
    y -= 16;
  }

  const bytes = await doc.save();
  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "content-type": "application/pdf",
      "content-disposition": "attachment; filename*=UTF-8''%E6%97%8F%E8%B0%B1%E5%AF%BC%E5%87%BA.pdf"
    }
  });
}
