import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: tenants } = await supabase
    .from("tenants")
    .select("id,name,plan,status,created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="row">
      <div className="card" style={{flex:"1 1 520px"}}>
        <h2>你的家族空间</h2>
        <p className="small">一个家族一个空间，数据隔离。你可以创建多个空间（按套餐限制）。</p>

        <div style={{display:"flex", gap:10, margin: "10px 0"}}>
          <Link className="btn" href="/app/tenants/new">创建家族空间</Link>
        </div>

        <table>
          <thead>
            <tr>
              <th>名称</th>
              <th>套餐</th>
              <th>状态</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(tenants || []).map((t) => (
              <tr key={t.id}>
                <td>{t.name}</td>
                <td><span className="badge">{t.plan}</span></td>
                <td>{t.status}</td>
                <td><Link className="badge" href={`/app/t/${t.id}`}>进入</Link></td>
              </tr>
            ))}
            {(!tenants || tenants.length === 0) ? (
              <tr><td colSpan={4} className="small">还没有家族空间，先创建一个。</td></tr>
            ) : null}
          </tbody>
        </table>

        <p className="small" style={{marginTop: 10}}>
          登录用户：{user?.email}
        </p>
      </div>

      <div className="card" style={{flex:"1 1 320px"}}>
        <h3>快速入口</h3>
        <ul>
          <li><Link href="/app/tenants">管理家族空间</Link></li>
          <li><Link href="/app/admin">平台后台（仅 owner 可用）</Link></li>
        </ul>
      </div>
    </div>
  );
}
