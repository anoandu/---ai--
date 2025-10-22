# 更新日志 | Changelog

## [1.0.1] - 2025-01-22

### 修复 | Fixed

1. **界面布局调整**
   - ✅ 语音球现在显示在上方
   - ✅ 文字内容显示在中间
   - ✅ 按钮保持在底部
   - 更符合图片参考的设计布局

2. **麦克风权限优化**
   - ✅ **仅请求麦克风权限**（明确禁用摄像头）
   - ✅ 修复代码：`{ audio: true, video: false }`
   - ✅ 更清晰的权限请求提示
   - ✅ 权限被拒绝时显示友好提示

3. **语音识别增强**
   - ✅ 添加详细的控制台日志（调试用）
   - ✅ 改进错误处理和提示
   - ✅ 更好的降级方案（文本输入）
   - ✅ 添加语音识别事件监听（onstart, onend）

### 新增 | Added

4. **故障排除文档**
   - ✅ 创建 `TROUBLESHOOTING.md`
   - ✅ 详细的问题解决方案
   - ✅ 麦克风权限设置指南
   - ✅ 浏览器兼容性说明
   - ✅ 常见错误代码对照表

### 技术细节 | Technical Details

**修改文件：**
- `src/App.tsx` - 调整组件渲染顺序，优化权限请求
- `src/App.css` - 调整布局间距和顺序
- `src/utils/speech.ts` - 添加日志，优化权限处理
- `README.md` - 添加重要提示
- `TROUBLESHOOTING.md` - 新建故障排除指南

**代码变更：**

```typescript
// 之前：可能导致请求摄像头
getUserMedia({ audio: true })

// 现在：明确只要麦克风
getUserMedia({ audio: true, video: false })
```

```jsx
// 之前：文字在上，球在下
<div className="main-content">
  {renderMainText()}
  <VoiceOrb state={state} />
</div>

// 现在：球在上，文字在中
<div className="main-content">
  <VoiceOrb state={state} />
  {renderMainText()}
</div>
```

---

## [1.0.0] - 2025-01-22

### 初始发布 | Initial Release

- ✅ 完整的 PWA 应用
- ✅ 语音识别和合成
- ✅ LLM 语义理解
- ✅ 双语支持
- ✅ 图片板功能
- ✅ 精美语音球动画
- ✅ Netlify/Vercel 部署支持

---

## 版本说明 | Version Notes

**版本格式**: [主版本.次版本.修订号]
- **主版本**: 重大架构变更
- **次版本**: 新功能添加
- **修订号**: Bug 修复和小改进

**当前版本**: 1.0.1 (稳定版)

