// 正文：Markdown 与内嵌 HTML 混写，由 md.js 解析；改完直接刷新 reader.html。
window.__WIKI_PAGES = window.__WIKI_PAGES || {};
window.__WIKI_PAGES["engine-combat"] = [
"@subtitle: 战斗由服务器处理。业务规则使用 CoreMod 的 Lua 脚本，原生接口提供接触查询、冷却、移动和伤害提交。",
"",
"    <h2>征召与小队</h2>",
"    <p>征召、集结和进入战斗是不同状态。已征召的居民通过 <code>Battle</code> 任务执行移动、攻击或防守命令。旗帜集结可生成队长所属的兵模，编队位置根据当前编队及存活成员计算。</p>",
"    <p>集结后，小队血池优先承受伤害。兵模的存活数量随血池减少，血池耗尽后队长的生命值才承受后续伤害。队长生命值归零后进入居民的倒地和死亡处理。</p>",
"",
"    <h2>攻击与命中</h2>",
"    <ul>",
"      <li>近战使用实体接触、敌对关系、攻击资格和冷却判断能否出手。Lua 读取统一属性接口的 <code>battler.*</code> 有效值，并处理命中、穿透和伤害。原生提交重新检查目标资格和实际小队状态。</li>",
"      <li>冲锋由 CoreMod Lua 更新，使用追击状态、移动段与接触来处理冲锋及击飞。</li>",
"      <li>弹体处理按发射时的武器 ID 查找 Lua 策略。策略给出半径、遮挡标签和命中回调。CoreMod 的弹体武器策略表为空。</li>",
"    </ul>",
"",
"    <h2>相关扩展</h2>",
"    <ul>",
"      <li><a href=\"#/basics/registry/raid\">袭击注册</a>说明如何定义来袭者组合、投送及结束条件。</li>",
"      <li><a href=\"#/core/mod/spell\">法术系统</a>说明符文、法杖方案、精力及施放接口。</li>",
"      <li><a href=\"#/basics/registry/entity\">实体注册</a>说明如何声明战斗能力和属性；<a href=\"#/appendix/api-reference\">Lua API 速查</a>提供可用战斗接口的索引。</li>",
"    </ul>"
];
