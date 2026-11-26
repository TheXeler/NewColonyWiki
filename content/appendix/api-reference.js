// 正文：Markdown 与内嵌 HTML 混写，由 md.js 解析；改完直接刷新 reader.html。
window.__WIKI_PAGES = window.__WIKI_PAGES || {};
window.__WIKI_PAGES["mod-lua-api-reference"] = [
"@subtitle: 按当前引擎绑定整理的函数表。用搜索框过滤模块、函数名、参数或说明。事件订阅与事件列表已拆到 Lua 事件 速查。",
"@datasource: appendix/data/lua-api-data.js",
"@datatable: __LUA_API_DATA|api,params,returns,note|API,参数,返回,备注|api",
"",
"    <div class=\"callout warn\">",
"      <code>math.random</code> 在脚本环境中会报错。需要确定性随机时，请使用 <code>engine.random</code>。<br>脚本沙箱不暴露 <code>os</code>、<code>io</code>、<code>debug</code>、<code>dofile</code>、<code>loadfile</code>、<code>load</code> 或 <code>loadstring</code>；加载同 MOD 的 Lua 模块请使用 <code>require</code>。",
"    </div>",
"",
"    <div class=\"callout info\">",
"      当前公共 API 版本是 <code>0.1</code>。版本入口 <code>engine.api_version</code> 和 <code>engine.version.api</code> 是 <code>stable</code>。备注里的 <code>[experimental]</code> 表示低级或开发向能力，常见于 ECS 直接组件写入、世界修改、网络命令、编辑器和文件内容加载入口。",
"    </div>",
"",
"    <div class=\"search-box\">",
"      <input data-api-search type=\"search\" placeholder=\"搜索 API，例如 focus、inventory、spawn、terrain、locale\">",
"    </div>",
"",
"    <div data-lua-api-container>",
"      <p><em>正在加载 API 列表…</em></p>",
"    </div>",
"",
"    <p data-api-empty hidden>没有匹配的 API。换一个关键词试试。</p>"
];

