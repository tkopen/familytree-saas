"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";

type Person = {
  id: string;
  tenant_id: string;
  full_name: string;
  gender: "male"|"female"|"unknown";
  birth_date: string | null;
  death_date: string | null;
  custom_fields: any | null;
};

export default function EditPerson({ params }: { params: { tenantId: string; personId: string } }) {
  const supabase = createSupabaseBrowser();
  const router = useRouter();

  const [person, setPerson] = useState<Person | null>(null);
  const [customJson, setCustomJson] = useState("{}");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("persons")
      .select("*")
      .eq("id", params.personId)
      .eq("tenant_id", params.tenantId)
      .single()
      .then(({ data, error }) => {
        if (error) setMsg(error.message);
        else {
          setPerson(data as any);
          setCustomJson(JSON.stringify((data as any).custom_fields ?? {}, null, 2));
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!person) return;

    let custom_fields: any = null;
    try { custom_fields = customJson.trim() ? JSON.parse(customJson) : null; } 
    catch { return setMsg("自定义字段 JSON 格式错误"); }

    const { error } = await supabase.from("persons")
      .update({
        full_name: person.full_name,
        gender: person.gender,
        birth_date: person.birth_date || null,
        death_date: person.death_date || null,
        custom_fields
      })
      .eq("id", params.personId)
      .eq("tenant_id", params.tenantId);

    if (error) return setMsg(error.message);
    router.refresh();
    setMsg("已保存");
  }

  async function remove() {
    if (!confirm("确定删除该人物？（会影响相关关系）")) return;
    const { error } = await supabase.from("persons")
      .delete()
      .eq("id", params.personId)
      .eq("tenant_id", params.tenantId);
    if (error) return setMsg(error.message);
    router.replace(`/app/t/${params.tenantId}/persons`);
  }

  if (!person) return <div className="card">加载中… {msg ? <div className="small">{msg}</div> : null}</div>;

  return (
    <div className="card" style={{maxWidth: 760}}>
      <h2>编辑人物</h2>
      <form onSubmit={save} style={{display:"grid", gap:10}}>
        <label>
          <div className="small">姓名</div>
          <input className="input" value={person.full_name} onChange={(e)=>setPerson({...person, full_name: e.target.value})} />
        </label>

        <label>
          <div className="small">性别</div>
          <select className="input" value={person.gender} onChange={(e)=>setPerson({...person, gender: e.target.value as any})}>
            <option value="unknown">未知</option>
            <option value="male">男</option>
            <option value="female">女</option>
          </select>
        </label>

        <div className="row">
          <label style={{flex:"1 1 220px"}}>
            <div className="small">出生日期</div>
            <input className="input" value={person.birth_date ?? ""} onChange={(e)=>setPerson({...person, birth_date: e.target.value || null})} placeholder="YYYY-MM-DD" />
          </label>
          <label style={{flex:"1 1 220px"}}>
            <div className="small">去世日期</div>
            <input className="input" value={person.death_date ?? ""} onChange={(e)=>setPerson({...person, death_date: e.target.value || null})} placeholder="YYYY-MM-DD" />
          </label>
        </div>

        <label>
          <div className="small">自定义字段（JSON）</div>
          <textarea className="input" style={{minHeight: 160}} value={customJson} onChange={(e)=>setCustomJson(e.target.value)} />
        </label>

        <div style={{display:"flex", gap:10}}>
          <button className="btn" type="submit">保存</button>
          <button className="btn secondary" type="button" onClick={remove}>删除</button>
          <button className="btn secondary" type="button" onClick={()=>router.back()}>返回</button>
        </div>
        {msg ? <div className="small">{msg}</div> : null}
      </form>
    </div>
  );
}
