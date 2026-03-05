import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { stripe, requireEnv } from "@/lib/stripe";
import { z } from "zod";

const Body = z.object({
  tenantId: z.string().uuid(),
  priceKey: z.enum(["pro", "club"]),
});

export async function POST(req: Request) {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });

  const { tenantId, priceKey } = parsed.data;

  // Require membership role owner/admin to manage billing
  const { data: mem } = await supabase
    .from("tenant_members")
    .select("role")
    .eq("tenant_id", tenantId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!mem || (mem.role !== "owner" && mem.role !== "admin")) {
    return NextResponse.json({ error: "No permission" }, { status: 403 });
  }

  // Prefer price IDs from app_settings (editable in platform backend)
const supabaseAdmin = (await import("@supabase/supabase-js")).createClient(
  requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
  requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  { auth: { persistSession: false } }
);

const { data: settings } = await supabaseAdmin
  .from("app_settings")
  .select("key,value")
  .in("key", ["stripe_price_pro","stripe_price_club"]);

const map = new Map<string, any>();
(settings || []).forEach((r: any) => map.set(r.key, r.value));

const priceId =
  priceKey === "pro"
    ? (String(map.get("stripe_price_pro") || "") || requireEnv("NEXT_PUBLIC_STRIPE_PRICE_PRO"))
    : (String(map.get("stripe_price_club") || "") || requireEnv("NEXT_PUBLIC_STRIPE_PRICE_CLUB"));


  const appUrl = requireEnv("NEXT_PUBLIC_APP_URL");

  // Find or create Stripe customer
  let customerId: string | null = null;
  const { data: subRow } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("tenant_id", tenantId)
    .maybeSingle();

  customerId = subRow?.stripe_customer_id || null;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email || undefined,
      metadata: { tenant_id: tenantId, user_id: user.id },
    });
    customerId = customer.id;

    // upsert
    await supabase.from("subscriptions").upsert({
      tenant_id: tenantId,
      stripe_customer_id: customerId,
      status: "incomplete",
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/app/t/${tenantId}/billing?success=1`,
    cancel_url: `${appUrl}/app/t/${tenantId}/billing?canceled=1`,
    metadata: { tenant_id: tenantId }
  });

  return NextResponse.json({ url: session.url });
}
