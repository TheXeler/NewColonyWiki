// 正文：Markdown 与内嵌 HTML 混写，由 md.js 解析；改完直接刷新 reader.html。
window.__WIKI_PAGES = window.__WIKI_PAGES || {};
window.__WIKI_PAGES["project-completion"] = [
"@subtitle: 各系统文档的入口。本页只负责指路，不判定可用性——能不能依赖请查能力状态。",
"",
"    <h2>系统说明</h2>",
"    <table>",
"      <thead><tr><th scope=\"col\">系统</th><th scope=\"col\">该页覆盖什么</th></tr></thead>",
"      <tbody>",
"        <tr><td><a href=\"#/core/engine/save-system\">存档</a></td><td>存档槽、读档要求、自动保存，以及 MOD 持久状态如何随存档走。</td></tr>",
"        <tr><td><a href=\"#/core/engine/combat\">战斗</a></td><td>战斗相关的数据结构、命令入口与外部接口。</td></tr>",
"        <tr><td><a href=\"#/core/mod/city\">城邦模拟</a></td><td>NPC 城邦的经营流程、实体与抽象两种模拟模式。</td></tr>",
"        <tr><td><a href=\"#/advanced/systems/diplomacy\">外交</a></td><td>谈判、战争与条约状态，以及 Lua 可注册的提议和查询指标。</td></tr>",
"        <tr><td><a href=\"#/advanced/network/sync\">网络同步</a></td><td>Client／Server 分工、逻辑消息通道与共享状态。</td></tr>",
"        <tr><td><a href=\"#/advanced/lua/script-runtime\">Lua 脚本运行时</a></td><td>模块注册、执行端、受管状态与生命周期约定。</td></tr>",
"        <tr><td><a href=\"#/advanced/ui/rmlui\">游戏界面</a></td><td>RmlUI 文档、数据模型、命令、输入与面板生命周期。</td></tr>",
"        <tr><td><a href=\"#/core/engine/resource-io\">资源路径</a></td><td>MOD 资源与配置使用的 UTF-8 路径、Windows 原生路径和排查入口。</td></tr>",
"      </tbody>",
"    </table>",
"",
"    <h2>MOD 开发</h2>",
"    <ul>",
"      <li><a href=\"#/overview/status\">能力状态</a>：逐项判断哪些能力可以稳定依赖。</li>",
"      <li><a href=\"#/basics/data\">数据文件注册表</a>与<a href=\"#/advanced/lua/coderegistry\">代码注册表</a>：内容和行为的登记方式。</li>",
"      <li><a href=\"#/appendix/api-reference\">Lua API 速查</a>与<a href=\"#/advanced/dev/troubleshooting\">常见问题</a>：查调用签名、排查问题。</li>",
"    </ul>"
];
