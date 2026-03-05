import Link from "next/link";

export default function ContentAdminIndex() {
  return (
    <div className="card" style={{maxWidth: 900}}>
      <h2>首页内容管理</h2>
      <p className="small">管理：公告栏、荣誉墙、底部广告位（增删改）。</p>
      <div className="row">
        <Link className="btn" href="/app/admin/content/announcements">公告栏</Link>
        <Link className="btn secondary" href="/app/admin/content/honors">荣誉墙</Link>
        <Link className="btn secondary" href="/app/admin/content/ads">底部广告位</Link>
      </div>
      <p className="small" style={{marginTop: 10}}>
        返回：<Link className="badge" href="/app/admin">平台后台</Link>
      </p>
    </div>
  );
}
