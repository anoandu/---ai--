# 部署指南

## 🚀 快速部署

### 选项 1: 部署到 Netlify（推荐）

#### 第一步：准备项目

1. 将项目推送到 GitHub/GitLab/Bitbucket

#### 第二步：部署到 Netlify

1. 访问 [Netlify](https://app.netlify.com)
2. 点击 "Add new site" → "Import an existing project"
3. 选择你的 Git 仓库
4. 配置构建设置：
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`
5. 点击 "Deploy site"

#### 第三步：配置 API Key（可选，推荐）

1. 在 Netlify 控制台，进入 "Site settings" → "Environment variables"
2. 添加以下变量：
   ```
   Key: GROQ_API_KEY
   Value: 你的 Groq API Key
   ```
3. 点击 "Save"
4. 重新部署站点（Deploys → Trigger deploy）

#### 获取免费 Groq API Key

1. 访问 [Groq Console](https://console.groq.com)
2. 注册账号（完全免费，无需信用卡）
3. 创建新的 API Key
4. 复制 API Key 并粘贴到 Netlify 环境变量

### 选项 2: 部署到 Vercel

#### 第一步：部署

1. 访问 [Vercel](https://vercel.com)
2. 点击 "Add New..." → "Project"
3. 导入你的 Git 仓库
4. Vercel 会自动检测 Vite 项目，使用默认配置即可
5. 点击 "Deploy"

#### 第二步：配置环境变量

1. 在项目设置中，进入 "Settings" → "Environment Variables"
2. 添加：
   ```
   Name: GROQ_API_KEY
   Value: 你的 Groq API Key
   ```
3. 选择所有环境（Production, Preview, Development）
4. 点击 "Save"
5. 重新部署

### 选项 3: 使用 Netlify CLI（本地部署）

```bash
# 安装 Netlify CLI
npm install -g netlify-cli

# 登录
netlify login

# 初始化项目
netlify init

# 部署
netlify deploy --prod
```

### 选项 4: 使用 Vercel CLI

```bash
# 安装 Vercel CLI
npm install -g vercel

# 部署
vercel

# 生产部署
vercel --prod
```

## 🔧 环境变量说明

### GROQ_API_KEY（推荐）

- **必需**: 否（可选）
- **说明**: Groq LLM API 密钥，用于智能语义理解
- **获取**: [Groq Console](https://console.groq.com)
- **费用**: 完全免费
- **优势**: 更准确的意图识别，支持模糊表达

### OPENAI_API_KEY（备选）

- **必需**: 否（可选）
- **说明**: OpenAI API 密钥
- **获取**: [OpenAI Platform](https://platform.openai.com)
- **费用**: 按使用付费
- **注意**: 如果同时配置了 `GROQ_API_KEY`，会优先使用 Groq

### 无 API Key 模式

如果不配置任何 API Key，应用会自动降级到：
- ✅ 本地关键词匹配
- ✅ 图片板快速选择
- ❌ 无法处理复杂/模糊表达

## 📱 自定义域名

### Netlify

1. "Domain settings" → "Add custom domain"
2. 按提示配置 DNS
3. 启用 HTTPS（自动）

### Vercel

1. "Settings" → "Domains"
2. 添加域名
3. 配置 DNS（自动提供 HTTPS）

## 🔒 HTTPS 说明

- Netlify 和 Vercel 都自动提供免费 HTTPS
- Web Speech API **必须**在 HTTPS 或 localhost 环境下工作
- 部署后应用会自动使用 HTTPS

## 🧪 测试部署

部署完成后，访问你的站点 URL，应该看到：

1. ✅ 欢迎界面正常显示
2. ✅ 语音球动画流畅
3. ✅ 可以切换中英文
4. ✅ 点击"现在说话"请求麦克风权限
5. ✅ 可以添加到主屏幕（PWA）

## 🐛 常见问题

### 1. 麦克风无法使用

**原因**: 浏览器要求 HTTPS 或 localhost

**解决**: 
- 确保使用 HTTPS 访问
- 或使用提供的 `.netlify.app` / `.vercel.app` 域名

### 2. LLM 不工作

**检查**:
- 环境变量是否正确配置
- API Key 是否有效
- 查看浏览器控制台错误

**降级方案**: 应用会自动降级到本地关键词匹配

### 3. 语音识别不准确

**原因**: 
- Web Speech API 依赖浏览器实现
- 网络环境影响

**解决**:
- 使用 Chrome/Edge 浏览器（最佳支持）
- 确保网络连接稳定
- 配置 LLM API 提升理解准确度

### 4. PWA 无法添加到主屏幕

**检查**:
- 必须使用 HTTPS
- manifest.webmanifest 加载正常
- Service Worker 注册成功
- 访问站点 2 次以上（浏览器要求）

## 📊 监控和日志

### Netlify

- Functions → 查看 Serverless 函数日志
- Analytics → 查看访问统计

### Vercel

- Functions → 查看函数调用情况
- Analytics → 查看性能数据

## 🔄 更新应用

### 通过 Git 自动部署

1. 修改代码并推送到仓库
2. Netlify/Vercel 自动检测并重新部署
3. 通常 1-3 分钟完成

### 手动重新部署

**Netlify**: Deploys → Trigger deploy → Deploy site

**Vercel**: Deployments → ... → Redeploy

## 💡 优化建议

1. **启用 LLM**: 配置 Groq API Key 获得最佳体验
2. **自定义域名**: 更专业的访问体验
3. **监控使用**: 定期检查 API 调用量
4. **图标优化**: 按 `ICON_GENERATION.md` 生成高质量图标
5. **离线优化**: PWA 默认已缓存核心资源

## 🌍 分享给用户

部署成功后，你可以：

1. 📱 分享链接给失语症患者和照护者
2. 🏠 引导用户"添加到主屏幕"（像原生应用）
3. 📖 分享使用说明（见 README.md）
4. 💬 收集反馈持续优化

---

**祝部署顺利！如有问题，欢迎提交 Issue。**

