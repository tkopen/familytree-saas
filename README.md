# 多家族族谱 SaaS（完整版骨架）

这是一套可直接部署到 **Vercel + Supabase + Stripe** 的多租户（多家族空间）族谱 SaaS 工程骨架，包含：
- 前端（Next.js App Router）
- 数据库（Supabase Postgres：表结构 + RLS + 索引）
- 后台（家族后台 + 平台后台的基础框架）
- Stripe 订阅（Checkout + Webhook 写回订阅状态）
- 族谱树展示（React Flow：先做显示，关系编辑走表单，布局后续可增强）

> 说明：本骨架追求“能跑 + 安全隔离 + 可收费 + 可扩展”，UI 走最小可用。你后续可以在此基础上换 shadcn/ui 或自己做更漂亮的模板。

---

## 1. 本地运行

### 1) 安装依赖
```bash
npm i
```

### 2) 配置环境变量
复制 `.env.example` 为 `.env.local` 并填入：
- Supabase 项目的 URL 和 anon key
- service role key（仅用于服务端 webhook / 管理操作）
- Stripe secret key + webhook secret + price id
- NEXT_PUBLIC_APP_URL

### 3) 初始化数据库
1) 在 Supabase 控制台打开 SQL Editor  
2) 执行：`supabase/schema.sql`  
3) 执行：`supabase/seed.sql`（可选：用于插入示例套餐配置）

### 4) 运行
```bash
npm run dev
```
打开 http://localhost:3000

---

## 2. Stripe 配置（订阅）

### 1) 创建产品与价格
在 Stripe Dashboard 建两个价格（示例）：
- Pro（月付）
- Club（月付）

把 Price ID 填入：
- NEXT_PUBLIC_STRIPE_PRICE_PRO
- NEXT_PUBLIC_STRIPE_PRICE_CLUB

### 2) 本地 webhook（可选）
使用 Stripe CLI：
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```
把输出的 webhook signing secret 写入 `STRIPE_WEBHOOK_SECRET`

---

## 3. 部署到 Vercel

1) 推送到 GitHub
2) Vercel 导入项目
3) 填环境变量（与本地一致）
4) 部署

---

## 4. 目录结构

- `app/` 前端页面（App Router）
- `lib/` Supabase/Stripe/权限工具
- `supabase/schema.sql` 数据库结构 + RLS
- `supabase/seed.sql` 初始化数据（可选）
- `app/api/stripe/webhook/route.ts` Stripe webhook
- CSV 批量导入（简化版）
- PDF 导出（简化版）

---

## 5. 下一步建议（你上线赚钱最关键的 5 件事）

1) **导出 PDF**：做成付费点（Edge Function 或 Node 服务端生成）
2) **批量导入**：Excel/CSV → 预览映射 → 冲突处理（重名）
3) **分享链接**：只读 + 过期 + 可关闭
4) **操作日志 + 回滚**：audit_logs 做版本
5) **自定义字段 UI**：让每个家族自己定义“房派/字辈/排行/籍贯”等

祝你做成稳定盈利的 SaaS。


另见：DEPLOY_SERVER.md（不本地跑通直接部署）


V4：支持 A（Stripe 自动订阅）与 B（二维码人工审核）两种收款方式，并可在平台后台切换。
另见：DEPLOY_VERCEL.md


V6：首页新增 公告栏 / 荣誉墙 / 底部广告位，并在平台后台提供增删改。
