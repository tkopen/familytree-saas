import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";

export default async function ManualPaymentsAdmin() {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: isAdmin } = await supabase
    .from("platform_admins")
    .select("user_id")
    .eq("user_id", user!.id)
    .maybeSingle();

  if (!isAdmin) {
    return (
      <div className="card">
        <h2>收款审核</h2>
        <p className="small">你不是平台管理员。要开启：在 Supabase 表 platform_admins 插入你的 user_id。</p>
        <Link className="badge" href="/app/admin">← 返回平台后台</Link>
      </div>
    );
  }

  const { data: pending } = await supabase
    .from("manual_payments")
    .select("id,tenant_id,plan_requested,amount,proof_text,status,created_at,requested_by_user_id")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(200);

  return (
    <div className="card">
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <h2>收款审核（待处理）</h2>
        <Link className="badge" href="/app/admin">← 返回</Link>
      </div>

      <p className="small">通过后会：更新 tenants.plan 与 plan_expires_at（默认 +30 天）。</p>

      <table>
        <thead>
          <tr>
            <th>时间</th>
            <th>tenant</th>
            <th>用户</th>
            <th>套餐</th>
            <th>金额</th>
            <th>付款信息</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {(pending || []).map(p => (
            <tr key={p.id}>
              <td className="small">{new Date(p.created_at).toLocaleString()}</td>
              <td className="small">{p.tenant_id}</td>
              <td className="small">{p.requested_by_user_id || "-"}</td>
              <td><span className="badge">{p.plan_requested}</span></td>
              <td>{p.amount ?? "-"}</td>
              <td className="small" style={{maxWidth: 360}}>{p.proof_text || "-"}</td>
              <td>
                <form action={`/api/admin/manual-payments/approve`} method="post" style={{display:"inline"}}>
                  <input type="hidden" name="id" value={p.id} />
                  <button className="btn" type="submit">通过</button>
                </form>
                <form action={`/api/admin/manual-payments/reject`} method="post" style={{display:"inline", marginLeft: 8}}>
                  <input type="hidden" name="id" value={p.id} />
                  <button className="btn secondary" type="submit">拒绝</button>
                </form>
              </td>
            </tr>
          ))}
          {(!pending || pending.length === 0) ? (
            <tr><td colSpan={7} className="small">暂无待处理</td></tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
