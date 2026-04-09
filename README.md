# Afternoon Tea Personal Website

一个英式下午茶古早儿童插画风、带互动效果的个人网站，包含以下页面：

- `index.html`：全屏 GIF 背景首页（仅保留艺术字 `order` 按钮）
- `menu.html`：餐厅菜单式选择页（悬停显示描述）
- `calendar.html`：弧形月份切换 + 月历互动页（每日可上传图片并保存视频链接）
- `gallery.html`：茶壶时期长廊（时期可增删改，时期内图片可增删改）

## 本地运行

直接打开 `index.html` 即可，或使用静态服务：

```bash
python3 -m http.server 8080
```

访问：`http://localhost:8080`

## 首页 GIF 替换

在 `styles.css` 的 `.gif-home` 中，替换 `--home-gif` 的 URL 即可使用你的 GIF：

```css
.gif-home {
  --home-gif: url("你的gif链接");
}
```

## 部署到 GitHub Pages

1. 把项目推送到你的 GitHub 仓库。
2. 进入 **Settings → Pages**。
3. 选择 `Deploy from a branch`，分支选择 `main`，目录选择 `/ (root)`。
4. 保存后等待部署完成。

## 交互数据说明

- 日历与长廊数据使用浏览器 `localStorage` 保存。
- 清除缓存或更换浏览器后，本地数据会丢失。
