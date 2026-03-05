"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/client";

type Member = {
  user_id: string;
  role: "owner"|"admin"|"editor"|"viewer";
  created_at: string;
};

export default function MembersPage({ params }: { params: { tenantId: string } }) {
  const supabase = createSupabaseBrowser();
  const [members, setMembers] = useState<Member[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Member["role"]>("viewer");
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const { data, error } = await supabase
      .from("tenant_members")
      .select("user_id,role,created_at")
      .eq("tenant_id", params.tenantId)
      .order("created_at", { ascending: true });
    if (error) setMsg(error.message);
    else setMembers((data || []) as any);
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setMsg("提示：本骨架不做邮件邀请。你可以在此处实现：查找用户ID→插入tenant_members。");
  }

  async function changeRole(user_id: string, role: Member["role"]) {
    setMsg(null);
    const { error } = await supabase
      .from("tenant_members")
      .update({ role })
      .eq("tenant_id", params.tenantId)
      .eq("user_id", user_id);
    if (error) return setMsg(error.message);
    load();
  }

  return (
    <div className="card">
      <h2>成员与权限</h2>
      <p className="small">角色：owner/admin/editor/viewer。权限由 RLS + 应用逻辑共同控制。</p>

      <form onSubmit={invite} className="row" style={{alignItems:"end"}}>
        <label style={{flex:"1 1 260px"}}>
          <div className="small">邀请邮箱（示例）</div>
          <input className="input" value={inviteEmail} onChange={(e)=>setInviteEmail(e.target.value)} />
        </label>
        <label style={{flex:"0 0 180px"}}>
          <div className="small">角色</div>
          <select className="input" value={inviteRole} onChange={(e)=>setInviteRole(e.target.value as any)}>
            <option value="viewer">viewer</option>
            <option value="editor">editor</option>
            <option value="admin">admin</option>
          </select>
        </label>
        <button className="btn" type="submit">邀请（待实现）</button>
      </form>

      <table style={{marginTop: 12}}>
        <thead>
          <tr><th>user_id</th><th>role</th><th>操作</th></tr>
        </thead>
        <tbody>
          {members.map(m => (
            <tr key={m.user_id}>
              <td className="small">{m.user_id}</td>
              <td><span className="badge">{m.role}</span></td>
              <td>
                <select className="input" value={m.role} onChange={(e)=>changeRole(m.user_id, e.target.value as any)} style={{maxWidth: 180}}>
                  <option value="viewer">viewer</option>
                  <option value="editor">editor</option>
                  <option value="admin">admin</option>
                  <option value="owner">owner</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {msg ? <div className="small" style={{marginTop: 10}}>{msg}</div> : null}
    </div>
  );
}
