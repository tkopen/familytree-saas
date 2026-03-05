import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";

export default async function TenantsPage() {
  const supabase = createSupabaseServer();
  const { data: tenants } = await supabase
    .from("tenants")
    .select("id,name,plan,status,created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="card">
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <h2>家族空间</h2>
        <Link className="btn" href="/app/tenants/new">创建</Link>
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
        </tbody>
      </table>
    </div>
  );
}
