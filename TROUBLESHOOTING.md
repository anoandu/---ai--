# 故障排除指南 | Troubleshooting Guide

## 🎤 语音识别问题

### 问题 1: 无法识别语音 / 接收不到声音

**可能原因：**

1. **麦克风权限未授予**
   - 浏览器会弹出权限请求，必须点击"允许"
   - 检查浏览器地址栏是否有麦克风图标被禁用

2. **浏览器不支持**
   - Chrome/Edge (推荐) ✅
   - Safari (iOS/macOS) ✅
   - Firefox ⚠️ 支持有限

3. **必须使用 HTTPS**
   - 本地开发：使用 `http://localhost` (允许)
   - 线上部署：必须 `https://` (Netlify/Vercel 自动提供)

**解决方案：**

#### 方案 1: 检查麦克风权限

**Chrome/Edge:**
1. 点击地址栏左侧的锁图标
2. 查看"麦克风"权限
3. 确保设置为"允许"
4. 刷新页面

**Safari (Mac):**
1. Safari → 设置 → 网站 → 麦克风
2. 找到你的网站
3. 设置为"允许"

**Safari (iOS):**
1. 设置 → Safari → 麦克风
2. 设置为"询问"或"允许"

#### 方案 2: 使用 Chrome 浏览器

Chrome 对 Web Speech API 支持最好，建议优先使用。

#### 方案 3: 检查麦克风是否工作

1. 打开浏览器控制台（F12）
2. 查看是否有错误信息
3. 说话时应该看到日志：
   ```
   Speech recognition started
   Speech recognition result: ...
   Final transcript: 你说的话
   ```

#### 方案 4: 测试麦克风

访问 https://www.google.com/search，尝试使用语音搜索，确认麦克风工作正常。

#### 方案 5: 使用文本输入（降级方案）

如果麦克风实在无法使用，应用会自动显示文本输入框：
1. 点击"现在说话"
2. 在文本框中输入你想说的话
3. 点击"发送"

### 问题 2: 不应该请求摄像头权限

**修复说明：**

已修复！应用现在**只请求麦克风权限**，不会请求摄像头。

确认代码：
```javascript
// 只请求音频，明确禁用视频
navigator.mediaDevices.getUserMedia({ 
  audio: true,  // ✅ 只要麦克风
  video: false  // ❌ 不要摄像头
})
```

如果仍然弹出摄像头请求，可能是：
1. 浏览器缓存问题 → 清除缓存并刷新
2. 其他网站的权限 → 检查是否是正确的网站

### 问题 3: 识别结果不准确

**解决方案：**

1. **配置 LLM API**（强烈推荐）
   - 获取免费 Groq API Key: https://console.groq.com
   - 在 Netlify/Vercel 环境变量中设置 `GROQ_API_KEY`
   - LLM 会修正和理解模糊的语音输入

2. **说话清晰**
   - 语速适中
   - 发音清晰
   - 一次说一个需求

3. **环境安静**
   - 减少背景噪音
   - 靠近麦克风说话

4. **使用图片板**
   - 常见需求直接点击图片
   - 更快更准确

---

## 🎨 界面布局问题

### 问题: 希望调整布局

**当前布局（已修复）：**

```
┌─────────────────────┐
│   EN/中文  (右上角)  │
│                     │
│     🌈 语音球        │  ← 在上方
│    (动画效果)        │
│                     │
│   欢迎文字/输出      │  ← 在中间
│                     │
│  [现在说话] 按钮     │  ← 在底部
└─────────────────────┘
```

**自定义调整：**

编辑 `src/App.css`:

```css
/* 调整语音球和文字间距 */
.main-content {
  gap: 50px;  /* 增大或减小这个值 */
}

/* 调整语音球大小 */
.orb-main {
  width: 240px;   /* 默认值 */
  height: 240px;  /* 默认值 */
}
```

---

## 📱 PWA 安装问题

### 问题: 无法添加到主屏幕

**检查清单：**

1. ✅ 使用 HTTPS（或 localhost）
2. ✅ 访问网站至少 2 次
3. ✅ manifest.webmanifest 加载成功
4. ✅ Service Worker 注册成功

**手动检查：**

打开浏览器开发者工具 → Application → Manifest

---

## 🔧 开发问题

### 问题: npm install 失败

```bash
# 清除缓存
rm -rf node_modules package-lock.json

# 使用国内镜像（可选）
npm config set registry https://registry.npmmirror.com

# 重新安装
npm install
```

### 问题: 构建失败

```bash
# 检查 TypeScript 错误
npm run build

# 查看详细错误
npm run build -- --debug
```

### 问题: 开发服务器无法启动

```bash
# 检查端口是否被占用
lsof -i :5173

# 使用其他端口
npm run dev -- --port 3000
```

---

## 🌐 部署问题

### 问题: Netlify 部署失败

**检查：**
1. Build command: `npm run build`
2. Publish directory: `dist`
3. Node version: 18+ (在 `netlify.toml` 中设置)

**查看日志：**
Deploys → 失败的部署 → Deploy log

### 问题: Vercel 部署失败

**检查：**
1. Framework Preset: Vite
2. Build Command: `npm run build`
3. Output Directory: `dist`

**查看日志：**
Deployments → 失败的部署 → Build Logs

### 问题: Serverless Functions 不工作

**检查环境变量：**

Netlify:
- Site settings → Environment variables
- 确保 `GROQ_API_KEY` 已设置
- 重新部署

Vercel:
- Settings → Environment Variables
- 确保 `GROQ_API_KEY` 已设置
- Redeploy

**测试 Function：**

访问：`https://your-site.netlify.app/.netlify/functions/llm`
应该返回 405 Method Not Allowed (正常，因为需要 POST)

---

## 📞 获取帮助

如果以上方法都无法解决问题：

1. **查看浏览器控制台** (F12)
   - 记录所有错误信息
   - 截图

2. **检查网络请求** (F12 → Network)
   - 查看失败的请求
   - 检查状态码

3. **提交 Issue**
   - GitHub Issues
   - 附上错误截图和日志

4. **常见错误代码**

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| `not-allowed` | 麦克风权限被拒绝 | 重新授予权限 |
| `network` | 网络问题 | 检查网络连接 |
| `no-speech` | 没有检测到语音 | 检查麦克风，说话清晰 |
| `aborted` | 识别被中断 | 重新开始 |

---

## ✅ 快速自检

运行这个检查清单：

- [ ] 使用 Chrome/Safari 浏览器
- [ ] 使用 HTTPS 或 localhost
- [ ] 麦克风权限已允许
- [ ] 浏览器控制台无错误
- [ ] 说话时能看到控制台日志
- [ ] 网络连接正常
- [ ] 已配置 API Key（可选）

如果都打勾还是不行，请提交详细的错误报告！

---

**最后更新：2025-01-22**

