# PWA 图标生成指南

本项目需要以下 PWA 图标：

- `public/pwa-192x192.png` (192x192 像素)
- `public/pwa-512x512.png` (512x512 像素)
- `public/apple-touch-icon.png` (180x180 像素)
- `public/favicon.ico` (32x32 像素)

## 方法 1：使用在线工具生成（推荐）

1. 访问 [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator)
2. 上传 `public/icon.svg`
3. 下载生成的所有图标
4. 将对应文件放入 `public/` 目录

## 方法 2：使用 ImageMagick（命令行）

```bash
# 安装 ImageMagick
brew install imagemagick  # macOS
# sudo apt-get install imagemagick  # Ubuntu

# 进入项目目录
cd public

# 生成 PNG 图标
convert -background none icon.svg -resize 192x192 pwa-192x192.png
convert -background none icon.svg -resize 512x512 pwa-512x512.png
convert -background none icon.svg -resize 180x180 apple-touch-icon.png
convert -background none icon.svg -resize 32x32 favicon.ico
```

## 方法 3：使用 npm 包自动生成

```bash
# 安装工具
npm install -g pwa-asset-generator

# 生成所有图标
pwa-asset-generator public/icon.svg public --icon-only --background "#fafafa"
```

## 临时解决方案

如果暂时没有图标文件，可以：

1. 将 `icon.svg` 复制为占位文件（用于开发）：
   ```bash
   cd public
   cp icon.svg pwa-192x192.png
   cp icon.svg pwa-512x512.png
   cp icon.svg apple-touch-icon.png
   ```

2. 或删除 `vite.config.ts` 中的 `includeAssets` 配置（PWA 功能会部分降级）

## 注意事项

- 图标应该使用简洁的设计，在小尺寸下依然清晰
- 建议使用透明背景或纯色背景
- 确保图标符合 PWA 规范
- maskable 图标需要在中心留出安全区域（最小 80% 内容区）

