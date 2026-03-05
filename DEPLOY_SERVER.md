# 不用本地跑通：直接上传服务器部署（两种路线）

你说的“不要先本地跑通、想直接上传服务器”通常有两条最稳的路：

---

## 路线 A：直接上 Vercel（最省事，推荐）
**特点：**不用服务器运维，自动 HTTPS、自动构建；你只要准备好 Supabase + Stripe 环境变量。

### 步骤
1. 解压项目，把代码上传到 GitHub（手机也可以用 GitHub App / 网页上传）
2. Vercel 导入 GitHub 项目
3. Vercel → Settings → Environment Variables：填 `.env.example` 里的变量
4. Deploy

### Stripe Webhook
Stripe Dashboard → Webhooks
- URL：`https://你的域名/api/stripe/webhook`
- 事件：checkout.session.completed, customer.subscription.updated, customer.subscription.deleted 等

> 注意：Vercel 上不需要你“本地跑通”，它会自动 npm install / next build。

---

## 路线 B：上传到你自己的 VPS/服务器（能控但要运维）
**适用：**你买了服务器（例如阿里云/腾讯云/海外 VPS），想直接部署到服务器。

### 服务器建议
- 2 vCPU / 4GB RAM 起步（早期足够）
- 系统：Ubuntu 22.04/24.04
- 域名 + 反向代理（Nginx）+ HTTPS（Let's Encrypt）

### 1) 安装基础环境
```bash
sudo apt update -y
sudo apt install -y git nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm i -g pm2
```

### 2) 上传项目（任选一种）
- 方式 1：Git 拉代码（推荐）
```bash
git clone <你的仓库地址> familytree-saas
cd familytree-saas
```

- 方式 2：直接上传 zip
把 zip 上传到服务器后：
```bash
unzip familytree-saas-v2.zip -d familytree-saas
cd familytree-saas
```

### 3) 配置环境变量（服务器上创建 .env.local）
```bash
cp .env.example .env.local
nano .env.local
```

### 4) 构建与启动
```bash
npm i
npm run build
pm2 start "npm run start" --name familytree-saas
pm2 save
pm2 startup
```

### 5) Nginx 反向代理
创建配置：
```bash
sudo nano /etc/nginx/sites-available/familytree-saas
```

填入（把域名换成你的）：
```nginx
server {
  server_name yourdomain.com;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

启用并重载：
```bash
sudo ln -s /etc/nginx/sites-available/familytree-saas /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6) HTTPS（Let's Encrypt）
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## 你问“能不能帮我上传服务器？”
我在这里没法替你直接登录你的服务器执行上传操作（也无法拿到你的服务器权限）。
但你按上面的路线 A 或 B 做，就能做到**不需要本地跑通**也能上线。

如果你想“最省心”，就走 **路线 A：Vercel**。
