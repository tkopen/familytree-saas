# 自动降级 & 到期提醒（Vercel Cron）

本项目使用 Vercel Cron 调用：
- `/api/cron/remind`：每天生成“即将到期提醒”（写入 notifications 表）
- `/api/cron/downgrade`：每天执行到期自动降级（plan -> free）

## 1) 开启方式
项目根目录已包含 `vercel.json`：
- remind：每天 09:00
- downgrade：每天 09:10

部署到 Vercel 后会自动生效（需要你的 Vercel 账户支持 Cron）。

## 2) 安全（可选）
你可以在 Vercel 环境变量加：
- `CRON_SECRET=一个随机字符串`

然后再在 Vercel Cron 里配置请求头（如果你的计划支持自定义 header）。
若不支持 header，本项目也能直接跑，但接口会公开，建议至少加上 Secret 或改成仅 Vercel 内部触发。

## 3) 配置开关
平台后台 → 平台设置：
- 自动降级：auto_downgrade_enabled
- 到期提醒：remind_enabled / remind_before_days

提醒会写入站内通知（notifications）。如需邮件/短信，可后续接第三方（Resend/SendGrid/阿里云短信等）。
