# 快速开始 | Quick Start

## 🚀 3 分钟本地运行

```bash
# 1. 进入项目目录
cd 失语症ai助手

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
```

打开浏览器访问: http://localhost:5173

## 📦 项目文件结构

```
失语症ai助手/
├── src/                      # 前端源代码
│   ├── components/           # React 组件
│   │   ├── VoiceOrb.tsx     # 语音球动画
│   │   └── PictureBoard.tsx # 图片板界面
│   ├── utils/               # 工具函数
│   │   ├── speech.ts        # 语音识别和合成
│   │   ├── llm.ts           # LLM 调用
│   │   └── fallback.ts      # 关键词匹配兜底
│   ├── App.tsx              # 主应用组件
│   ├── i18n.ts              # 多语言支持
│   └── constants.ts         # 常量配置
├── api/                     # Vercel Serverless
│   └── llm.ts               # LLM API 代理
├── netlify/functions/       # Netlify Functions
│   └── llm.ts               # LLM API 代理
├── public/                  # 静态资源
│   ├── icon.svg             # PWA 图标
│   └── manifest.webmanifest # PWA 配置
├── vite.config.ts           # Vite 配置
├── netlify.toml             # Netlify 配置
├── vercel.json              # Vercel 配置
└── package.json             # 项目依赖
```

## 🎯 核心技术要点

### 1. 点按切换录音逻辑

```typescript
// 第一次点击：开始录音
if (state === 'IDLE') {
  startListening();  // → LISTENING
}

// 第二次点击：停止并处理
else if (state === 'LISTENING') {
  stopListeningAndProcess();  // → PROCESSING
}
```

### 2. 语音球动效实现

- **大球**: 使用 CSS `transform` + `filter: blur()`
- **小球**: 8个不同颜色的小球，绝对定位
- **柔光**: `mix-blend-mode: screen` + 多层 `radial-gradient`
- **动画**: `@keyframes` 实现公转、自转、漂移

### 3. LLM 集成流程

```
用户说话 → Web Speech API 转写
         → 发送到 /api/llm
         → Serverless Function 调用 Groq/OpenAI
         → 返回结构化意图
         → 显示确认界面
```

### 4. 双语切换

- `i18n.ts` 集中管理所有文案
- `language` 状态控制 UI 语言
- TTS 和 ASR 自动切换对应语言

## 🔧 本地开发配置

### 可选：配置 LLM API（本地测试）

创建 `.env.local` 文件（不要提交到 Git）:

```bash
# Groq API（免费）
GROQ_API_KEY=your_api_key_here

# 或 OpenAI API
# OPENAI_API_KEY=your_api_key_here
```

**注意**: 
- 本地开发时，Serverless Functions 需要额外配置才能读取环境变量
- 建议直接部署到 Netlify/Vercel 测试完整功能
- 本地开发会自动使用关键词匹配兜底

### 本地测试 Netlify Functions

```bash
# 安装 Netlify CLI
npm install -g netlify-cli

# 本地运行（含 Functions）
netlify dev
```

### 本地测试 Vercel Functions

```bash
# 安装 Vercel CLI
npm install -g vercel

# 本地运行
vercel dev
```

## 📝 开发指南

### 修改欢迎语

编辑 `src/i18n.ts`:

```typescript
export const translations = {
  zh: {
    welcome: '你好，我是 [name]。',  // 修改这里
    // ...
  },
  en: {
    welcome: 'Hi there, I\'m [name].',  // 修改这里
    // ...
  }
};
```

### 添加新的常见需求

编辑 `src/constants.ts`:

```typescript
export const COMMON_NEEDS: CommonNeed[] = [
  // 添加新项
  {
    id: 'custom',
    icon: '🎵',
    label_zh: '我想听音乐',
    label_en: 'I want to listen to music',
    intent: 'listen_music'
  },
  // ...
];
```

### 自定义语音球颜色

编辑 `src/components/VoiceOrb.css`:

```css
/* LISTENING 状态颜色 */
.orb-container.listening .orb-gradient {
  background: radial-gradient(
    circle at 30% 30%,
    rgba(180, 200, 255, 1),  /* 修改颜色 */
    /* ... */
  );
}
```

## 🧪 测试清单

在部署前，确保测试以下功能：

- [ ] 页面正常加载，语音球动画流畅
- [ ] 点击"现在说话"请求麦克风权限
- [ ] 第一次点击进入 LISTENING 状态
- [ ] 第二次点击进入 PROCESSING
- [ ] 显示确认界面并播放 TTS
- [ ] 点击"不对"可进入图片板
- [ ] 图片板选择后正常确认
- [ ] 中英文切换正常
- [ ] 移动端触摸响应正常
- [ ] PWA 可添加到主屏幕

## 🚢 构建生产版本

```bash
# 构建
npm run build

# 预览构建结果
npm run preview
```

构建产物在 `dist/` 目录。

## 🐛 常见问题

### 1. 安装依赖失败

```bash
# 清除缓存
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

### 2. TypeScript 报错

```bash
# 重新构建类型
npm run build
```

### 3. 语音识别不工作（开发环境）

- 确保使用 `http://localhost`（浏览器允许）
- 或使用 `ngrok` 等工具提供 HTTPS
- 或直接部署到 Netlify/Vercel

### 4. PWA 不生效（开发环境）

- PWA 功能仅在生产构建中完全启用
- 使用 `npm run build && npm run preview` 测试

## 📚 进一步阅读

- [README.md](./README.md) - 完整项目说明
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 详细部署指南
- [USER_GUIDE.md](./USER_GUIDE.md) - 用户使用指南
- [ICON_GENERATION.md](./ICON_GENERATION.md) - 图标生成说明

## 💡 开发建议

1. **使用 Chrome DevTools**: 调试语音识别和 PWA
2. **移动端测试**: 使用真实移动设备测试
3. **渐进增强**: 确保降级方案正常工作
4. **性能优化**: 监控动画性能，必要时使用 `will-change`
5. **无障碍**: 考虑键盘导航和屏幕阅读器支持

---

**Happy Coding! 🎉**

