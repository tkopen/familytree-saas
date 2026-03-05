"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";

export default function NewPerson({ params }: { params: { tenantId: string } }) {
  const supabase = createSupabaseBrowser();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState<"male"|"female"|"unknown">("unknown");
  const [birth, setBirth] = useState("");
  const [death, setDeath] = useState("");
  const [customJson, setCustomJson] = useState("{\n  \"字辈\": \"\",\n  \"房派\": \"\"\n}");
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    let custom_fields: any = null;
    try { custom_fields = customJson.trim() ? JSON.parse(customJson) : null; } 
    catch { return setMsg("自定义字段 JSON 格式错误"); }

    const { error } = await supabase.from("persons").insert({
      tenant_id: params.tenantId,
      full_name: fullName,
      gender,
      birth_date: birth || null,
      death_date: death || null,
      custom_fields
    });

    if (error) return setMsg(error.message);
    router.replace(`/app/t/${params.tenantId}/persons`);
  }

  return (
    <div className="card" style={{maxWidth: 720}}>
      <h2>新增人物</h2>
      <form onSubmit={submit} style={{display:"grid", gap:10}}>
        <label>
          <div className="small">姓名</div>
          <input className="input" value={fullName} onChange={(e)=>setFullName(e.target.value)} />
        </label>

        <label>
          <div className="small">性别</div>
          <select className="input" value={gender} onChange={(e)=>setGender(e.target.value as any)}>
            <option value="unknown">未知</option>
            <option value="male">男</option>
            <option value="female">女</option>
          </select>
        </label>

        <div className="row">
          <label style={{flex:"1 1 220px"}}>
            <div className="small">出生日期（可空）</div>
            <input className="input" value={birth} onChange={(e)=>setBirth(e.target.value)} placeholder="YYYY-MM-DD" />
          </label>
          <label style={{flex:"1 1 220px"}}>
            <div className="small">去世日期（可空）</div>
            <input className="input" value={death} onChange={(e)=>setDeath(e.target.value)} placeholder="YYYY-MM-DD" />
          </label>
        </div>

        <label>
          <div className="small">自定义字段（JSON）</div>
          <textarea className="input" style={{minHeight: 140}} value={customJson} onChange={(e)=>setCustomJson(e.target.value)} />
        </label>

        <button className="btn" type="submit">保存</button>
        {msg ? <div className="small">{msg}</div> : null}
      </form>
    </div>
  );
}
