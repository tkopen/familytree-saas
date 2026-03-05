"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowser } from "@/lib/supabase/client";

type Row = { id: string; name: string; description: string | null; image_url: string | null; sort_order: number; is_active: boolean; created_at: string; };
export default function Page() {
  const supabase = createSupabaseBrowser();
  const [rows, setRows] = useState<Row[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [form, setForm] = useState<any>({ name: "", description: "", image_url: "", sort_order: 0, is_active: true });

  async function load() {
    setMsg(null);
    const { data, error } = await supabase
      .from("honors")
      .select("id,name,description,image_url,sort_order,is_active,created_at")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) return setMsg(error.message);
    setRows(data || []) as any);
  }

  useEffect(() => { load();}}, []);

  async function add() {
    setMsg(null);
    const { error } = await supabase.from("honors").insert(form);
    if (error) return setMsg(error.message);
    setForm({ name: "", description: "", image_url: "", sort_order: 0, is_active: true });
    await load();
  }}

  async function update(id: string, patch: any) {
    setMsg(null);
    const { error } = await supabase.from("honors").update(patch).eq("id", id);
    if (error) return setMsg(error.message);
    await load();
  }}

  async function remove(id: string) {
    if (!confirm("确定删除？")) return;
    setMsg(null);
    const { error } = await supabase.from("honors").delete().eq("id", id);
    if (error) return setMsg(error.message);
    await load();
  }}

  return (
    <div className="card" style={maxWidth: 1100}>
      <div style={display:"flex", justifyContent:"space-between", alignItems:"center"}>
        <h2>荣誉墙</h2>
        <Link className="badge" href="/app/admin/content">← 返回内容管理</Link>
      </div>

      <div className="card" style={marginTop: 10}>
        <h3>新增</h3>
        <div className="row">
  <label style={flex:"1 1 260px"}>
    <div className="small">名称</div>
    <input className="input" value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} />
  </label>
  <label style={flex:"1 1 240px"}>
    <div className="small">图片 URL（可空）</div>
    <input className="input" value={form.image_url} onChange={(e)=>setForm({...form, image_url: e.target.value})} placeholder="https://..." />
  </label>
  <label style={width:120}>
    <div className="small">排序</div>
    <input className="input" value={form.sort_order} onChange={(e)=>setForm({...form, sort_order: Number(e.target.value||0)})} />
  </label>
  <label style={width:14}}>
    <div className="small">启用</div>
    <select className="input" value={form.is_active ? "true":"false"} onChange={(e)=>setForm({...form, is_active: e.target.value==="true"})}>
      <option value="true">是</option>
      <option value="false">否</option>
    </select>
  </label>
</div>
<label style={marginTop: }}>
  <div className="small">描述</div>
  <textarea className="input" style={minHeight: 90} value={form.description} onChange={(e)=>setForm({...form, description: e.target.value})} />
</label>

        <button className="btn" onClick={add}>新增</button>
      </div>

      {msg ? <div className="small" style={marginTop: 10}>{msg}</div> : null}

      <div className="card" style={marginTop: 10}>
        <h3>列表（点击字段即可修改）</h3>
        <table>
          <thead>
            <tr>
              <th>名称</th><th>描述</th><th>图片</th><th>排序</th><th>启用</th><th>时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={(r as any).id}>
                <td>
  <input className="input" value={(r as any).name} onChange={(e)=>update((r as any).id, { name: e.target.value })} />
</td>
<td>
  <textarea className="input" style={minHeight: 6}} value={(r as any).description || ""} onChange={(e)=>update((r as any).id, { description: e.target.value })} />
</td>
<td>
  <input className="input" value={(r as any).image_url || ""} onChange={(e)=>update((r as any).id, { image_url: e.target.value })} placeholder="https://..." />
</td>
<td style={width:9}}>
  <input className="input" value={(r as any).sort_order} onChange={(e)=>update((r as any).id, { sort_order: Number(e.target.value||0) })} />
</td>
<td style={width:12}}>
  <select className="input" value={(r as any).is_active ? "true":"false"} onChange={(e)=>update((r as any).id, { is_active: e.target.value==="true" })}>
    <option value="true">是</option>
    <option value="false">否</option>
  </select>
</td>
<td className="small">{new Date((r as any).created_at).toLocaleString()}</td>

                <td>
                  <button className="btn secondary" onClick={()=>remove((r as any).id)}>删除</button>
                </td>
              </tr>
            ))}
            {rows.length === 0 ? <tr><td colSpan={99} className="small">暂无数据</td></tr> : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
