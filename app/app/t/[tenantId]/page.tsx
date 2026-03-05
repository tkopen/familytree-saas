import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";

export default async function TenantHome({ params }: { params: { tenantId: string } }) {
  const supabase = createSupabaseServer();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id,name,plan,status,created_at")
    .eq("id", params.tenantId)
    .single();

  const { data: notes } = await supabase
    .from("notifications")
    .select("id,level,title,body,created_at,is_read")
    .eq("tenant_id", params.tenantId)
    .eq("is_read", false)
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: me } = await supabase
    .from("tenant_members")
    .select("role")
    .eq("tenant_id", params.tenantId)
    .limit(1)
    .single();

  return (
    <div className="row">
      <div className="card" style={{flex:"1 1 520px"}}>
        <h2>{tenant?.name || "家族空间"}</h2>
        <p className="small">
          套餐：<span className="badge">{tenant?.plan}</span> 状态：{tenant?.status} 你的角色：<span className="badge">{me?.role}</span>
        </p>

        <div className="row">
          <Link className="btn" href={`/app/t/${params.tenantId}/tree`}>族谱树</Link>
          <Link className="btn secondary" href={`/app/t/${params.tenantId}/persons`}>人物管理</Link>
          <Link className="btn secondary" href={`/app/t/${params.tenantId}/members`}>成员权限</Link>
          <Link className="btn secondary" href={`/app/t/${params.tenantId}/import`}>批量导入</Link>
          <Link className="btn secondary" href={`/app/t/${params.tenantId}/export`}>导出</Link>
          <Link className="btn secondary" href={`/app/t/${params.tenantId}/billing`}>账单订阅</Link>
        </div>
      </div>

<div className="card" style={{flex:"1 1 520px"}}>
  <h3>通知（未读）</h3>
  {(notes && notes.length) ? (
    <ul>
      {notes.map(n => (
        <li key={n.id}>
          <span className="badge">{n.level}</span> {n.title}
          <div className="small">{n.body}</div>
        </li>
      ))}
    </ul>
  ) : (
    <p className="small">暂无未读通知</p>
  )}
</div>


      <div className="card" style={{flex:"1 1 320px"}}>
        <h3>提示</h3>
        <ul>
          <li>关系：亲生/过继/入赘 都用 relationships 表表达</li>
          <li>自定义字段：persons.custom_fields(JSONB)</li>
          <li>导入导出中心：下一步加任务队列更稳</li>
        </ul>
      </div>
    </div>
  );
}
