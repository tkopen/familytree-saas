"use client";

import { useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function NewTenantPage() {
  const supabase = createSupabaseBrowser();
  const router = useRouter();
  const [name, setName] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function createTenant(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes.user;
    if (!user) return setMsg("未登录");

    const { data, error } = await supabase
      .from("tenants")
      .insert({ name, owner_user_id: user.id, plan: "free", status: "active" })
      .select("id")
      .single();

    if (error) return setMsg(error.message);

    // insert membership
    const { error: memErr } = await supabase
      .from("tenant_members")
      .insert({ tenant_id: data.id, user_id: user.id, role: "owner" });

    if (memErr) return setMsg(memErr.message);

    router.replace(`/app/t/${data.id}`);
  }

  return (
    <div className="card" style={{maxWidth: 560}}>
      <h2>创建家族空间</h2>
      <form onSubmit={createTenant} style={{display:"grid", gap:10}}>
        <label>
          <div className="small">家族名称</div>
          <input className="input" value={name} onChange={(e)=>setName(e.target.value)} placeholder="例如：泉州陈氏宗族" />
        </label>
        <button className="btn" type="submit">创建</button>
        {msg ? <div className="small">{msg}</div> : null}
      </form>
    </div>
  );
}
