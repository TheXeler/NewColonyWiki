// 正文：Markdown 与内嵌 HTML 混写，由 md.js 解析；改完直接刷新 reader.html。
window.__WIKI_PAGES = window.__WIKI_PAGES || {};
window.__WIKI_PAGES["mod-lua-events-reference"] = [
"@subtitle: 从 Lua API 速查 中拆出的全部事件：事件订阅接口与引擎/CoreMod/UI 事件。用搜索框过滤事件名、字段或说明。",
"@datasource: appendix/data/lua-events-data.js",
"@datatable: __LUA_EVENTS_DATA",
"",
"    <p>2026-10-13 新增 <code>core:city_resident_added</code>：原生抽象城邦新增提交成功后延迟派发，非可取消、非auto_sync。字段为uuid／city_uuid／tick／key／reason／x／y／z／in_fluid／requires_support；表示居民已加入该城邦，不替代玩家recruitment_registered的candidate_uuid／town_hall_uuid语义。纯准备或提交拒绝不派发，清除意图后的重复Runtime提交不重发。系统仍关闭，场景未执行。</p>",
"    <div class=\"callout warn\">",
"      <code>engine.events</code> 只有 <code>subscribe</code>、<code>unsubscribe</code> 和 <code>emit</code>，没有按来源或前缀批量清理的入口；事件 ID 必须在 <code>data/events</code> 中声明，回调字段在 <code>current</code> 里。事件的背景说明见 <a href=\"#/advanced/lua/events\">Lua 事件系统</a>。",
"    </div>",
"",
"",
""
];


