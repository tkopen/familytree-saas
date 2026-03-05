# Vercel 直接上线（无需本地跑通）- V4（A/B 双收款方式可切换）

## 1) Supabase 建库
在 Supabase SQL Editor 依次执行：
1. `supabase/schema.sql`
2. `supabase/seed.sql`（插入默认平台设置）

## 2) 上传到 GitHub
把项目上传到 GitHub 仓库（保持 package.json 在根目录）

## 3) Vercel 导入部署
Vercel 导入仓库，并在 Environment Variables 填：

### 必填
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_APP_URL（你的 Vercel 域名，例如 https://xxx.vercel.app）

### Stripe（如果你要用 A 模式）
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- （可选兜底）NEXT_PUBLIC_STRIPE_PRICE_PRO / NEXT_PUBLIC_STRIPE_PRICE_CLUB  
  > 更推荐在“平台后台 → 平台设置”里填 Stripe Price ID

部署即可。

## 4) 开启平台后台（管理/切换收款方式）
登录后在 Supabase 表 `platform_admins` 插入你的 user_id：
```sql
insert into public.platform_admins(user_id) values ('你的用户uuid');
```

然后进入：控制台顶部「平台后台」→「平台设置」
- 选择 payment_mode：stripe 或 manual_qr
- 配置二维码图片 URL / Stripe Price ID / 金额显示

## 5) Stripe Webhook（仅 A 模式需要）
Stripe Dashboard → Webhooks
- URL：`https://你的域名/api/stripe/webhook`
- events：checkout.session.completed, customer.subscription.updated, customer.subscription.deleted 等


## 6) 自动降级与到期提醒（可选）
- 已内置 vercel.json cron：每天执行提醒与降级
- 可在 Vercel 环境变量加 CRON_SECRET（增强安全）
- 详情见：CRON.md


## 7) 首页内容（公告/荣誉/广告位）
- Supabase 执行 schema.sql 后会创建 announcements/honors/ads 表
- 平台后台 → 首页内容：可增删改
