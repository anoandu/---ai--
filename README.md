# 失语症沟通助手 | Aphasia Assistant

一个基于 React + Vite 的纯前端 PWA 应用，为失语症患者提供语音沟通辅助。

## ✨ 核心功能

- 🎙️ **点按录音**：点击一次开始录音，再次点击停止（无需长按）
- 🧠 **智能理解**：集成 LLM 进行语义理解和句子修正
- 🌐 **双语支持**：中英文界面切换
- 🗣️ **语音播报**：自动 TTS 播报结果
- 🖼️ **图片板**：提供常见需求的快速选择
- 📱 **PWA 支持**：可添加到主屏幕，离线使用
- 🎨 **温柔动效**：精心设计的语音球动画

## 🚀 快速开始

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

### ⚠️ 重要提示

1. **麦克风权限**: 首次使用时，浏览器会请求**仅麦克风权限**（不会请求摄像头）
2. **使用 HTTPS**: 语音功能需要 HTTPS 或 localhost
3. **推荐浏览器**: Chrome/Edge 对语音识别支持最好
4. **故障排除**: 如遇问题，请查看 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

### 部署到 Netlify

1. Fork 或下载本项目
2. 在 [Netlify](https://app.netlify.com) 中导入项目
3. 构建设置：
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. 在 **Environment Variables** 中添加：
   ```
   GROQ_API_KEY=your_groq_api_key
   ```
5. 点击 **Deploy**

#### 获取免费 Groq API Key

1. 访问 [Groq Console](https://console.groq.com)
2. 注册账号（完全免费）
3. 创建 API Key
4. 复制到 Netlify 环境变量

### 部署到 Vercel

1. Fork 或下载本项目
2. 在 [Vercel](https://vercel.com) 中导入项目
3. 在 **Environment Variables** 中添加：
   ```
   GROQ_API_KEY=your_groq_api_key
   ```
4. 点击 **Deploy**

## 📋 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite 5
- **PWA**: vite-plugin-pwa
- **语音识别**: Web Speech API (SpeechRecognition)
- **语音合成**: Web Speech API (speechSynthesis)
- **LLM**: Groq API (免费 Llama 3.1) 或 OpenAI API
- **部署**: Netlify / Vercel Serverless Functions

## 🎯 使用流程

1. **点击"现在说话"** → 进入录音状态
2. **说出需求** → 语音球显示动画反馈
3. **再次点击** → 停止录音，开始处理
4. **LLM 理解** → 转换为清晰完整的句子
5. **确认** → "是的"播报输出，"不对"选择图片板
6. **输出** → TTS 播报，展示给照护者

## 🔧 配置说明

### LLM 服务（可选）

本应用支持两种模式：

#### 1. 在线模式（推荐）

配置 `GROQ_API_KEY` 环境变量，使用免费的 Groq LLM 服务：
- 更准确的语义理解
- 支持多语言和模糊表达
- 完全免费使用

#### 2. 离线模式

如果未配置 API Key，应用会自动降级到本地关键词匹配：
- 不需要网络连接
- 基于预设关键词识别
- 准确度较低但可用

### 浏览器兼容性

- ✅ Chrome/Edge (推荐)
- ✅ Safari (iOS/macOS)
- ⚠️ Firefox (部分功能)
- ❌ 不支持 Web Speech API 的浏览器会自动降级到文本输入

## 🎨 界面状态

### 语音球动效

- **IDLE**: 轻微呼吸，紫粉渐变
- **LISTENING**: 放大旋转，蓝紫色，小球公转
- **PROCESSING**: 缩小减速，粉橙色，小球漂移
- **CONFIRM/OUTPUT**: 轻微闪烁

### 状态机

```
IDLE → LISTENING → PROCESSING → CONFIRM → OUTPUT
                                    ↓
                               DISAMBIGUATE
                                    ↓
                                 CONFIRM
```

## 📱 PWA 功能

- 添加到主屏幕
- 离线缓存
- 全屏模式
- 适配 iPhone 刘海屏

## 🌍 常见需求图片板

- 💧 我想喝水
- 🍽️ 我想吃东西
- 🚽 我要上厕所
- 😣 我感到疼痛
- 🥶 我觉得冷
- 🥵 我觉得热
- 😴 我想休息
- 🚶 我想出门
- 🏠 我想回家
- 💊 我要吃药
- 🆘 我需要帮助
- 📺 我想看电视

## 🔐 隐私和安全

- ✅ 纯前端应用，无后端数据库
- ✅ 不保存任何用户数据
- ✅ API Key 安全存储在 Serverless Function
- ✅ 麦克风权限仅在用户点击时请求

## 📄 开源协议

MIT License

## 🙏 致谢

本项目旨在帮助失语症患者和照护者更好地沟通，欢迎提出建议和贡献代码。

## 🐛 问题反馈

如遇到问题，请在 GitHub Issues 中反馈。

---

**注意**: 本应用仅为辅助沟通工具，不能替代专业医疗诊断和治疗。

