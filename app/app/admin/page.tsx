import { createSupabaseServer } from "@/lib/supabase/server";
import Link from "next/link";

export default async function PlatformAdmin() {
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
        <h2>平台后台</h2>
        <p className="small">你不是平台管理员。要开启：在 Supabase 表 platform_admins 插入你的 user_id。</p>
        <Link className="badge" href="/app">← 返回控制台</Link>
      </div>
    );
  }

  const { data: tenants } = await supabase
    .from("tenants")
    .select("id,name,plan,status,created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  const { data: subs } = await supabase
    .from("subscriptions")
    .select("tenant_id,status,current_period_end,updated_at")
    .order("updated_at", { ascending: false })
    .limit(100);

  return (
    <div className="row">
      <div className="card" style={{flex:"1 1 520px"}}>
        <h2>租户（最近 100）</h2>
        <p className="small"><a className="badge" href="/app/admin/settings">平台设置</a> <a className="badge" href="/app/admin/manual-payments">收款审核</a> <a className="badge" href="/app/admin/content">首页内容</a></p>
        <table>
          <thead><tr><th>名称</th><th>plan</th><th>status</th><th></th></tr></thead>
          <tbody>
            {(tenants || []).map(t => (
              <tr key={t.id}>
                <td>{t.name}</td>
                <td><span className="badge">{t.plan}</span></td>
                <td>{t.status}</td>
                <td><Link className="badge" href={`/app/t/${t.id}`}>打开</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{flex:"1 1 420px"}}>
        <h2>订阅（最近 100）</h2>
        <table>
          <thead><tr><th>tenant</th><th>status</th><th>period_end</th></tr></thead>
          <tbody>
            {(subs || []).map(s => (
              <tr key={s.tenant_id + String(s.updated_at)}>
                <td className="small">{s.tenant_id}</td>
                <td><span className="badge">{s.status}</span></td>
                <td className="small">{s.current_period_end ? new Date(s.current_period_end).toISOString() : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
