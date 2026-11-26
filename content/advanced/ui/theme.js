// 正文：Markdown 与内嵌 HTML 混写，由 md.js 解析；改完直接刷新 reader.html。
window.__WIKI_PAGES = window.__WIKI_PAGES || {};
window.__WIKI_PAGES["mod-ui-theme"] = [
"@subtitle: 旧的即时模式 UI 主题层已经从引擎和构建依赖中移除。当前主路线是游戏内 RmlUI，后续主题能力应通过 RML/RCSS 资源实现。",
"",
"    <h2>当前状态</h2>",
"    <p><code>UiTheme</code> 仍保留一个轻量 API，用于避免旧配置和菜单状态在编译期断裂；它只扫描和记录主题文件，不再把任何样式应用到运行时渲染层。</p>",
"",
"    <h2>后续重写项</h2>",
"    <ul>",
"      <li>把全局 UI 颜色、间距、字号等样式迁移到 <code>CoreMod/assets/ui/rml/*.rcss</code>。</li>",
"      <li>为 RmlUI 文档设计可热重载的主题资源入口。</li>",
"      <li>清理旧主题配置文件或迁移为 RCSS 变量。</li>",
"    </ul>"
];
