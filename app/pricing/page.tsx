import Link from "next/link";

export default function PricingPage() {
  return (
    <div>
      <div className="nav">
        <Link href="/">← 返回</Link>
        <strong>套餐</strong>
        <span />
      </div>

      <div className="row">
        <div className="card" style={{flex:"1 1 300px"}}>
          <h3>免费版</h3>
          <p className="small">适合试用</p>
          <ul>
            <li>1 个家族空间</li>
            <li>≤ 200 人</li>
            <li>导出带水印</li>
          </ul>
        </div>

        <div className="card" style={{flex:"1 1 300px"}}>
          <h3>专业版</h3>
          <p className="small">适合大多数家族</p>
          <ul>
            <li>≤ 2000 人</li>
            <li>无水印导出</li>
            <li>批量导入</li>
            <li>权限管理</li>
          </ul>
        </div>

        <div className="card" style={{flex:"1 1 300px"}}>
          <h3>家族会馆版</h3>
          <p className="small">适合宗亲会/超大族谱</p>
          <ul>
            <li>≤ 1 万人</li>
            <li>多人协作</li>
            <li>版本回滚</li>
            <li>专属域名（可选）</li>
          </ul>
        </div>
      </div>

      <p className="small" style={{marginTop: 14}}>
        订阅入口在“控制台 → 账单”。支持 Stripe 自动订阅或二维码人工审核（平台后台可切换）。
      </p>
    </div>
  );
}
