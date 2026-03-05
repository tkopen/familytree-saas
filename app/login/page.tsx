"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const supabase = createSupabaseBrowser();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/app");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return setMsg(error.message);
    setMsg("注册成功（若开启邮箱验证，请到邮箱确认）");
  }

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return setMsg(error.message);
    router.replace("/app");
  }

  return (
    <div className="card" style={{maxWidth: 520, margin: "40px auto"}}>
      <h2>登录 / 注册</h2>
      <form style={{display:"grid", gap:10}}>
        <label>
          <div className="small">邮箱</div>
          <input className="input" value={email} onChange={(e)=>setEmail(e.target.value)} />
        </label>
        <label>
          <div className="small">密码</div>
          <input className="input" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        </label>

        <div style={{display:"flex", gap:10}}>
          <button className="btn" onClick={signIn}>登录</button>
          <button className="btn secondary" onClick={signUp}>注册</button>
        </div>

        {msg ? <div className="small">{msg}</div> : null}
      </form>
    </div>
  );
}
