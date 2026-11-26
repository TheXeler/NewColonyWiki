// 正文：Markdown 与内嵌 HTML 混写，由 md.js 解析；改完直接刷新 reader.html。
window.__WIKI_PAGES = window.__WIKI_PAGES || {};
window.__WIKI_PAGES["mod-console-reference"] = [
"@subtitle: 按当前引擎命令注册表整理的表：命令、用法、默认权限、执行侧与说明。用搜索框过滤命令名、用法、权限或关键词。背景与工作流见 控制台命令。",
"@datasource: appendix/data/console-commands-data.js",
"@datatable: __CONSOLE_COMMANDS_DATA",
"",
"    <div class=\"callout warn\">",
"      命令分客户端与服务端两侧。<code>help</code>、相机、视图、选择、本地化、RML 重载、GPU 调试和连接管理命令由请求客户端执行；其余命令（包括只读查询）都会发送到服务端执行。没有可用服务端会话时世界命令明确失败，不会回退到客户端执行。",
"    </div>",
"",
"    <div class=\"callout info\">",
"      权限列是引擎注册表里的默认要求。没有显式权限条目的命令回退到 <code>developer</code>，所以标为 <code>developer（默认）</code> 的命令在普通模式服务端需要 <code>config/console_permissions.json</code> 显式放宽后才能执行；<code>--DEBUG</code> 启动的服务端本机与远程玩家默认都是 <code>developer</code>。别名先展开，再按目标命令检查权限。",
"    </div>",
"",
"",
"",
"",
"    <h2>说明</h2>",
"    <ul>",
"      <li>本页只列出当前引擎实际注册的命令，与游戏内 <code>help</code> 的输出一致。<code>help</code> 是列出全部命令的唯一入口，分页大小上限 100。</li>",
"      <li>权限表中的 <code>spawn</code>、<code>combat_test_arena</code> 保留有条目，但当前引擎没有注册对应命令，执行会返回 <code>Unknown console command</code>。</li>",
"      <li><code>=&lt;lua code&gt;</code> 是前缀简写，先展开成 <code>lua &lt;code&gt;</code> 再检查权限与执行侧，所以它不会绕过 <code>lua</code> 的 developer 要求。</li>",
"      <li><code>luafile</code> / <code>luacfile</code> 只能执行已安装 MOD 的 <code>scripts</code> 目录下的 <code>.lua</code> 文件：绝对路径、盘符与 NTFS 流冒号、纯点号段（<code>.</code> / <code>..</code> / <code>...</code>），以及解析后落在该目录之外的符号链接都会被拒绝。</li>",
"      <li><code>luac</code> / <code>luacfile</code> 在请求客户端的 Lua VM 执行，不经过服务端；还没有创建世界时会报告客户端 Lua 运行时不可用。</li>",
"      <li><code>doctor_*</code>、<code>diff_*snapshot*</code>、<code>*doctor_archives*</code> 主要给引擎维护者使用，普通 MOD 作者不需要关心。</li>",
"    </ul>"
];


