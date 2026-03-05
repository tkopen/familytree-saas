import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = createSupabaseServer();

  const { data: announcements } = await supabase
    .from("announcements")
    .select("id,title,body,link_url,sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: honors } = await supabase
    .from("honors")
    .select("id,name,description,image_url,sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(12);

  const { data: ads } = await supabase
    .from("ads")
    .select("id,title,image_url,link_url,sort_order,position")
    .eq("is_active", true)
    .eq("position", "footer")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(4);

  return (
    <div style={{display:"grid", gap:16}}>
      <div className="card">
        <h1 style={{margin:0}}>多家族族谱 SaaS</h1>
        <p className="small" style={{marginTop: 8}}>
          支持多租户隔离、族谱树、批量导入、PDF 导出、A/B 收款（Stripe / 二维码审核）、到期提醒与自动降级。
        </p>

        <div className="row" style={{marginTop: 12}}>
          <Link className="btn" href="/login">登录 / 注册</Link>
          <Link className="btn secondary" href="/pricing">查看套餐</Link>
          <Link className="btn secondary" href="/app">进入控制台</Link>
        </div>
      </div>

      {/* 公告栏 */}
      <div className="card">
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <h2 style={{margin:0}}>公告栏</h2>
          <span className="badge">平台后台可维护</span>
        </div>
        {(announcements && announcements.length) ? (
          <ul style={{marginTop: 10}}>
            {announcements.map(a => (
              <li key={a.id} style={{marginBottom: 10}}>
                <div style={{display:"flex", gap:8, alignItems:"center"}}>
                  <strong>{a.title}</strong>
                  {a.link_url ? <a className="badge" href={a.link_url} target="_blank">查看</a> : null}
                </div>
                {a.body ? <div className="small">{a.body}</div> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="small" style={{marginTop: 10}}>暂无公告</p>
        )}
      </div>

      {/* 荣誉墙 */}
      <div className="card">
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <h2 style={{margin:0}}>荣誉墙</h2>
          <span className="badge">平台后台可维护</span>
        </div>

        {(honors && honors.length) ? (
          <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))", gap:12, marginTop: 10}}>
            {honors.map(h => (
              <div key={h.id} className="card" style={{background:"#fafafa"}}>
                {h.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt={h.name} src={h.image_url} style={{width:"100%", height:140, objectFit:"cover", borderRadius: 12, border:"1px solid #e5e7eb"}} />
                ) : null}
                <div style={{marginTop: 8}}>
                  <strong>{h.name}</strong>
                  {h.description ? <div className="small">{h.description}</div> : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="small" style={{marginTop: 10}}>暂无荣誉展示</p>
        )}
      </div>

      {/* 底部广告位预留 */}
      <div className="card">
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <h2 style={{margin:0}}>合作推广</h2>
          <span className="badge">广告位预留</span>
        </div>

        {(ads && ads.length) ? (
          <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))", gap:12, marginTop: 10}}>
            {ads.map(ad => (
              <a key={ad.id} className="card" href={ad.link_url || "#"} target={ad.link_url ? "_blank" : "_self"} style={{textDecoration:"none", color:"inherit", background:"#fafafa"}}>
                {ad.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt={ad.title || "ad"} src={ad.image_url} style={{width:"100%", height:120, objectFit:"cover", borderRadius: 12, border:"1px solid #e5e7eb"}} />
                ) : null}
                <div style={{marginTop: 8}}>
                  <strong>{ad.title || "广告位"}</strong>
                  <div className="small">点击了解 / 招商合作</div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="card" style={{marginTop: 10, borderStyle:"dashed"}}>
            <div className="small">这里预留 1-4 个底部广告位：可在平台后台增删改。</div>
          </div>
        )}
      </div>

      <div className="small" style={{textAlign:"center", opacity:0.75}}>
        © {new Date().getFullYear()} FamilyTree SaaS
      </div>
    </div>
  );
}
