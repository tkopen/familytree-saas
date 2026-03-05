"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/client";

type SettingRow = { key: string; value: any };

async function upsert(supabase: any, key: string, value: any) {
  return supabase.from("app_settings").upsert({ key, value, updated_at: new Date().toISOString() });
}

export default function AdminSettings() {
  const supabase = createSupabaseBrowser();
  const [msg, setMsg] = useState<string | null>(null);
  const [mode, setMode] = useState<"manual_qr"|"stripe">("manual_qr");
  const [wechat, setWechat] = useState("");
  const [alipay, setAlipay] = useState("");
  const [pricePro, setPricePro] = useState("99");
  const [priceClub, setPriceClub] = useState("199");
  const [stripePro, setStripePro] = useState("");
  const [stripeClub, setStripeClub] = useState("");
  const [manualDurationPro, setManualDurationPro] = useState("30");
  const [manualDurationClub, setManualDurationClub] = useState("30");
  const [autoDowngrade, setAutoDowngrade] = useState(true);
  const [remindEnabled, setRemindEnabled] = useState(true);
  const [remindBeforeDays, setRemindBeforeDays] = useState("7");

  async function load() {
    setMsg(null);
    const { data, error } = await supabase.from("app_settings").select("key,value").in("key", [
      "payment_mode","qr_wechat_url","qr_alipay_url","price_pro_display","price_club_display","stripe_price_pro","stripe_price_club","manual_duration_pro_days","manual_duration_club_days","auto_downgrade_enabled","remind_enabled","remind_before_days"
    ]);
    if (error) return setMsg(error.message);

    const map = new Map<string, any>();
    (data as SettingRow[]).forEach(r => map.set(r.key, r.value));

    setMode((map.get("payment_mode") ?? "manual_qr") as any);
    setWechat(String(map.get("qr_wechat_url") ?? ""));
    setAlipay(String(map.get("qr_alipay_url") ?? ""));
    setPricePro(String(map.get("price_pro_display") ?? "99"));
    setPriceClub(String(map.get("price_club_display") ?? "199"));
    setStripePro(String(map.get("stripe_price_pro") ?? ""));
    setStripeClub(String(map.get("stripe_price_club") ?? ""));
    setManualDurationPro(String(map.get("manual_duration_pro_days") ?? "30"));
    setManualDurationClub(String(map.get("manual_duration_club_days") ?? "30"));
    setAutoDowngrade(Boolean(map.get("auto_downgrade_enabled") ?? true));
    setRemindEnabled(Boolean(map.get("remind_enabled") ?? true));
    setRemindBeforeDays(String(map.get("remind_before_days") ?? "7"));
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  async function save() {
    setMsg(null);
    const ops = [
      upsert(supabase, "payment_mode", mode),
      upsert(supabase, "qr_wechat_url", wechat),
      upsert(supabase, "qr_alipay_url", alipay),
      upsert(supabase, "price_pro_display", Number(pricePro || "0")),
      upsert(supabase, "price_club_display", Number(priceClub || "0")),
      upsert(supabase, "stripe_price_pro", stripePro),
      upsert(supabase, "stripe_price_club", stripeClub),
      upsert(supabase, "manual_duration_pro_days", Number(manualDurationPro || "30")),
      upsert(supabase, "manual_duration_club_days", Number(manualDurationClub || "30")),
      upsert(supabase, "auto_downgrade_enabled", autoDowngrade),
      upsert(supabase, "remind_enabled", remindEnabled),
      upsert(supabase, "remind_before_days", Number(remindBeforeDays || "7")),
    ];
    const results = await Promise.all(ops);
    const err = results.find(r => r.error)?.error;
    if (err) return setMsg(err.message);
    setMsg("已保存");
  }

  return (
    <div className="card" style={{maxWidth: 900}}>
      <h2>平台设置</h2>
      <p className="small">在这里选择收款方式（A/B）并配置二维码/Stripe Price ID。Stripe 的 Secret Key/Webhook Secret 仍然放在 Vercel 环境变量。</p>

      <div className="row">
        <label style={{flex:"1 1 260px"}}>
          <div className="small">收款方式</div>
          <select className="input" value={mode} onChange={(e)=>setMode(e.target.value as any)}>
            <option value="manual_qr">B：静态二维码图片收款（人工审核）</option>
            <option value="stripe">A：Stripe 订阅（自动开通）</option>
          </select>
        </label>
      </div>

      <div className="row">
        <div className="card" style={{flex:"1 1 420px"}}>
          <h3>二维码收款（B）配置</h3>
          <label>
            <div className="small">微信收款码图片 URL</div>
            <input className="input" value={wechat} onChange={(e)=>setWechat(e.target.value)} placeholder="https://..." />
          </label>
          <label style={{marginTop: 8}}>
            <div className="small">支付宝收款码图片 URL</div>
            <input className="input" value={alipay} onChange={(e)=>setAlipay(e.target.value)} placeholder="https://..." />
          </label>
        </div>

        <div className="card" style={{flex:"1 1 420px"}}>
          <h3>Stripe（A）配置</h3>
          <label>
            <div className="small">Pro Price ID</div>
            <input className="input" value={stripePro} onChange={(e)=>setStripePro(e.target.value)} placeholder="price_..." />
          </label>
          <label style={{marginTop: 8}}>
            <div className="small">Club Price ID</div>
            <input className="input" value={stripeClub} onChange={(e)=>setStripeClub(e.target.value)} placeholder="price_..." />
          </label>
          <p className="small" style={{marginTop: 8}}>注意：还需要在 Vercel 环境变量配置 STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET。</p>
        </div>
      </div>

      <div className="row">
        <label style={{flex:"1 1 200px"}}>
          <div className="small">Pro 金额显示</div>
          <input className="input" value={pricePro} onChange={(e)=>setPricePro(e.target.value)} />
        </label>
        <label style={{flex:"1 1 200px"}}>
          <div className="small">Club 金额显示</div>
          <input className="input" value={priceClub} onChange={(e)=>setPriceClub(e.target.value)} />
        </label>
      </div>

      
<div className="row">
  <div className="card" style={{flex:"1 1 420px"}}>
    <h3>B 模式审核通过后的时长（天）</h3>
    <div className="row">
      <label style={{flex:"1 1 180px"}}>
        <div className="small">Pro 天数</div>
        <input className="input" value={manualDurationPro} onChange={(e)=>setManualDurationPro(e.target.value)} />
      </label>
      <label style={{flex:"1 1 180px"}}>
        <div className="small">Club 天数</div>
        <input className="input" value={manualDurationClub} onChange={(e)=>setManualDurationClub(e.target.value)} />
      </label>
    </div>
    <p className="small">审核“通过”时，会在当前到期时间基础上延长（若已过期则从现在起算）。</p>
  </div>

  <div className="card" style={{flex:"1 1 420px"}}>
    <h3>到期自动降级与提醒</h3>
    <label>
      <div className="small">自动降级（到期后降为 free）</div>
      <select className="input" value={autoDowngrade ? "true" : "false"} onChange={(e)=>setAutoDowngrade(e.target.value === "true")}>
        <option value="true">开启</option>
        <option value="false">关闭</option>
      </select>
    </label>

    <label style={{marginTop: 8}}>
      <div className="small">到期提醒</div>
      <select className="input" value={remindEnabled ? "true" : "false"} onChange={(e)=>setRemindEnabled(e.target.value === "true")}>
        <option value="true">开启</option>
        <option value="false">关闭</option>
      </select>
    </label>

    <label style={{marginTop: 8}}>
      <div className="small">提前多少天提醒</div>
      <input className="input" value={remindBeforeDays} onChange={(e)=>setRemindBeforeDays(e.target.value)} />
    </label>

    <p className="small" style={{marginTop: 8}}>提醒会写入站内通知（notifications 表）。如需邮件/短信，可后续接第三方。</p>
  </div>
</div>

      <div style={{display:"flex", gap:10, marginTop: 12}}>
        <button className="btn" onClick={save}>保存</button>
        <button className="btn secondary" onClick={load}>刷新</button>
      </div>

      {msg ? <div className="small" style={{marginTop: 10}}>{msg}</div> : null}
    </div>
  );
}
