import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";

export default async function PersonsPage({ params }: { params: { tenantId: string } }) {
  const supabase = createSupabaseServer();

  const { data: persons } = await supabase
    .from("persons")
    .select("id,full_name,gender,birth_date,death_date,custom_fields,created_at")
    .eq("tenant_id", params.tenantId)
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div className="card">
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <h2>人物管理</h2>
        <Link className="btn" href={`/app/t/${params.tenantId}/persons/new`}>新增人物</Link>
      </div>
      <p className="small">最多展示 200 条（可做分页/搜索）。</p>

      <table>
        <thead>
          <tr>
            <th>姓名</th>
            <th>性别</th>
            <th>生卒</th>
            <th>自定义字段</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {(persons || []).map((p) => (
            <tr key={p.id}>
              <td>{p.full_name}</td>
              <td>{p.gender}</td>
              <td>{p.birth_date || "-"} / {p.death_date || "-"}</td>
              <td className="small">{p.custom_fields ? JSON.stringify(p.custom_fields) : "-"}</td>
              <td><Link className="badge" href={`/app/t/${params.tenantId}/persons/${p.id}`}>编辑</Link></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{marginTop: 12}}>
        <Link className="badge" href={`/app/t/${params.tenantId}`}>← 返回空间</Link>
      </div>
    </div>
  );
}
