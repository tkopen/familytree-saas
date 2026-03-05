import Link from "next/link";
import { ReactNode } from "react";
import { createSupabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div>
      <div className="nav">
        <div style={{display:"flex", gap:12, alignItems:"center"}}>
          <Link href="/app"><strong>控制台</strong></Link>
          <Link className="badge" href="/app/tenants">家族空间</Link>
          <Link className="badge" href="/app/admin">平台后台</Link>
        </div>
        <div style={{display:"flex", gap:10, alignItems:"center"}}>
          <span className="small">{user.email}</span>
          <form action="/auth/signout" method="post">
            <button className="btn secondary" type="submit">退出</button>
          </form>
        </div>
      </div>
      {children}
    </div>
  );
}
