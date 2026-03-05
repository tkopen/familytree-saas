"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/client";

type ManualPayment = {
  id: string;
  tenant_id: string;
  plan_requested: "pro" | "club";
  amount: number | null;
  status: "pending" | "approved" | "rejected";
  proof_text: string | null;
  created_at: string;
};

type SettingRow = { key: string; value: any };

export default function BillingPage({ params }: { params: { tenantId: string } }) {
  const supabase = createSupabaseBrowser();

  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [mode, setMode] = useState<"manual_qr"|"stripe">("manual_qr");
  const [qrWechat, setQrWechat] = useState("");
  const [qrAlipay, setQrAlipay] = useState("");
  const [pricePro, setPricePro] = useState(99);
  const [priceClub, setPriceClub] = useState(199);

  const [plan, setPlan] = useState<"pro"|"club">("pro");
  const amount = useMemo(() => plan === "pro" ? pricePro : priceClub, [plan, pricePro, priceClub]);

  const [proofText, setProofText] = useState("");
  const [payments, setPayments] = useState<ManualPayment[]>([]);

  async function loadSettings() {
    const { data, error } = await supabase.from("app_settings").select("key,value").in("key", [
      "payment_mode","qr_wechat_url","qr_alipay_url","price_pro_display","price_club_display"
    ]);
    if (error) return setMsg(error.message);

    const map = new Map<string, any>();
    (data as SettingRow[]).forEach(r => map.set(r.key, r.value));

    setMode((map.get("payment_mode") ?? "manual_qr") as any);
    setQrWechat(String(map.get("qr_wechat_url") ?? ""));
    setQrAlipay(String(map.get("qr_alipay_url") ?? ""));
    setPricePro(Number(map.get("price_pro_display") ?? 99));
    setPriceClub(Number(map.get("price_club_display") ?? 199));
  }

  async function loadManualPayments() {
    const { data, error } = await supabase
      .from("manual_payments")
      .select("id,tenant_id,plan_requested,amount,status,proof_text,created_at")
      .eq("tenant_id", params.tenantId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) setMsg(error.message);
    else setPayments((data || []) as any);
  }

  useEffect(() => {
    loadSettings();
    loadManualPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submitManual() {
    setMsg(null);
    setBusy(true);
    try {
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) return setMsg("未登录");

      const { error } = await supabase.from("manual_payments").insert({
        tenant_id: params.tenantId,
        plan_requested: plan,
        amount,
        proof_text: proofText || null,
        status: "pending"
      });
      if (error) return setMsg(error.message);
      setProofText("");
      setMsg("已提交付款申请：等待管理员审核通过后开通/续费。");
      await loadManualPayments();
    } finally {
      setBusy(false);
    }
  }

  async function stripeSubscribe(priceKey: "pro" | "club") {
    setMsg(null);
    setBusy(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tenantId: params.tenantId, priceKey })
      });
      const data = await res.json();
      if (!res.ok) return setMsg(data.error || "创建失败");
      window.location.href = data.url;
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card" style={{maxWidth: 980}}>
      <h2>账单与订阅</h2>
      <p className="small">
        平台当前收款模式：<span className="badge">{mode}</span>（平台后台可切换 A/B）
      </p>

      {mode === "stripe" ? (
        <div className="card">
          <h3>A：Stripe 订阅（自动开通）</h3>
          <p className="small">支付成功后会自动更新 tenants.plan（通过 Stripe webhook 写回）。</p>
          <div className="row">
            <button className="btn" onClick={()=>stripeSubscribe("pro")} disabled={busy}>订阅：专业版</button>
            <button className="btn secondary" onClick={()=>stripeSubscribe("club")} disabled={busy}>订阅：家族会馆版</button>
          </div>
          {msg ? <div className="small" style={{marginTop: 10}}>{msg}</div> : null}
        </div>
      ) : (
        <div className="row" style={{alignItems:"flex-start"}}>
          <div className="card" style={{flex:"1 1 420px"}}>
            <h3>B：二维码图片收款（人工审核）</h3>

            <div className="row">
              <label style={{flex:"1 1 220px"}}>
                <div className="small">套餐</div>
                <select className="input" value={plan} onChange={(e)=>setPlan(e.target.value as any)}>
                  <option value="pro">专业版（Pro）</option>
                  <option value="club">家族会馆版（Club）</option>
                </select>
              </label>
              <label style={{flex:"1 1 160px"}}>
                <div className="small">金额（展示）</div>
                <input className="input" value={amount} readOnly />
              </label>
            </div>

            <div className="row" style={{marginTop: 10}}>
              <div className="card" style={{flex:"1 1 240px", textAlign:"center"}}>
                <div className="small">微信收款码</div>
                {qrWechat ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt="WeChat QR" src={qrWechat} style={{maxWidth: "100%", marginTop: 8, borderRadius: 12, border:"1px solid #e5e7eb"}} />
                ) : (
                  <div className="small" style={{marginTop: 8}}>未配置微信二维码（平台后台→平台设置）</div>
                )}
              </div>
              <div className="card" style={{flex:"1 1 240px", textAlign:"center"}}>
                <div className="small">支付宝收款码</div>
                {qrAlipay ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt="Alipay QR" src={qrAlipay} style={{maxWidth: "100%", marginTop: 8, borderRadius: 12, border:"1px solid #e5e7eb"}} />
                ) : (
                  <div className="small" style={{marginTop: 8}}>未配置支付宝二维码（平台后台→平台设置）</div>
                )}
              </div>
            </div>

            <label style={{marginTop: 10}}>
              <div className="small">付款备注/时间/金额/单号（建议写“家族名+手机号后4位+日期”便于核对）</div>
              <textarea className="input" style={{minHeight: 110}} value={proofText} onChange={(e)=>setProofText(e.target.value)} />
            </label>

            <button className="btn" onClick={submitManual} disabled={busy} style={{marginTop: 10}}>
              {busy ? "提交中…" : "我已付款，提交审核"}
            </button>

            {msg ? <div className="small" style={{marginTop: 10}}>{msg}</div> : null}
          </div>

          <div className="card" style={{flex:"1 1 420px"}}>
            <h3>你的付款申请（最近 20 条）</h3>
            <table>
              <thead>
                <tr><th>时间</th><th>套餐</th><th>金额</th><th>状态</th></tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id}>
                    <td className="small">{new Date(p.created_at).toLocaleString()}</td>
                    <td><span className="badge">{p.plan_requested}</span></td>
                    <td>{p.amount ?? "-"}</td>
                    <td><span className="badge">{p.status}</span></td>
                  </tr>
                ))}
                {payments.length === 0 ? <tr><td colSpan={4} className="small">暂无记录</td></tr> : null}
              </tbody>
            </table>
            <p className="small" style={{marginTop: 10}}>审核入口：平台后台 → 收款审核。</p>
          </div>
        </div>
      )}
    </div>
  );
}
