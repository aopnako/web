# Afternoon Tea Personal Website

一个带有插画风和互动效果的个人网站，包含以下页面：

- `index.html`：下午茶风格首页（茶壶/茶杯插图 + 艺术字 `order` 按钮）
- `menu.html`：餐厅菜单式选择页（悬停显示描述）
- `calendar.html`：月份环 + 月历互动页（每日可添加图片和视频链接）
- `gallery.html`：照片长廊页（支持上传图片、添加视频链接）

## 本地运行

直接打开 `index.html` 即可，或使用简单静态服务：

```bash
python3 -m http.server 8080
```

访问：`http://localhost:8080`

## 部署到 GitHub Pages

1. 把项目推送到你的 GitHub 仓库（例如 `username/afternoon-tea-site`）。
2. 在仓库页面进入 **Settings → Pages**。
3. 在 **Build and deployment** 里选择：
   - Source: `Deploy from a branch`
   - Branch: `main`（或你的默认分支）
   - Folder: `/ (root)`
4. 保存后等待部署完成，GitHub 会给出站点地址。

## 交互数据说明

- 日历每日内容、长廊内容通过浏览器 `localStorage` 保存。
- 换浏览器或清除缓存后，这些本地数据会丢失。
