// Lua 事件 速查数据：从 lua-api-data.js 中拆出的全部事件（订阅接口 + 事件列表）。
window.__LUA_EVENTS_DATA = {
  "_meta": {
    "title": "Lua 事件 速查",
    "description": "从 Lua API 速查中拆出的全部事件：订阅接口与引擎/CoreMod/UI 事件。",
    "api_version": "0.1",
    "source_audit": [
      "Engine/Scripting/LuaBindings.cpp"
    ],
    "risk_candidates": [
      "engine.events.clear 是全局清理入口，会影响同一 Lua runtime 中其他 MOD 的订阅。"
    ]
  },
  "groups": [
    {
      "name": "事件",
      "items": [
        { "api": "engine.events.subscribe(source?, name, fn, priority?)", "params": "string?, string, function, integer?", "returns": "handler id", "note": "来源可省略；省略时监听所有来源。priority 越大越早执行。" },
        { "api": "engine.events.unsubscribe(source?, name, id)", "params": "string?, string, handler id", "returns": "bool", "note": "来源可省略；取消精确事件订阅。" },
        { "api": "engine.events.clear(name)", "params": "string", "returns": "-", "note": "[experimental] 清空某事件的所有处理器；会影响同一 runtime 的其他 MOD。" },
        { "api": "engine.events.subscribe_prefix(source?, prefix, fn, priority?)", "params": "string?, string, function, integer?", "returns": "handler id", "note": "按冒号层级匹配嵌套事件；来源可省略。" },
        { "api": "engine.events.unsubscribe_prefix(id)", "params": "handler id", "returns": "bool", "note": "取消前缀订阅。" },
        { "api": "engine.events.emit(source, name, payload)", "params": "string, string, table", "returns": "-", "note": "来源置于最前；引擎使用 e，CoreMod 使用 core，UI 使用 ui。" },
        { "api": "inventory:changed（事件）", "params": "-", "returns": "payload", "note": "字段：entity_id、reason、block_id、block_key、delta。" },
        { "api": "stockpile:changed（事件）", "params": "-", "returns": "payload", "note": "CoreMod 库存区账本变更；字段：item_hash、item_id、delta、count、reason。" },
        { "api": "ui:data:changed（事件）", "params": "-", "returns": "payload", "note": "UI 聚合快照脏通知；字段：domain、source、event。domain 如 colony/resources、work/orders、research/tech、events/focuses。" },
        { "api": "ui:command（事件）", "params": "-", "returns": "payload", "note": "UI 命令入口执行时广播；字段：name、payload。" },
        { "api": "research:started（事件）", "params": "-", "returns": "payload", "note": "开始研究科技时触发；字段：tech_id、civilization_index。" },
        { "api": "recipe:crafted（事件）", "params": "-", "returns": "payload", "note": "字段：entity_id、recipe_id、output_block_id、output_block_key、output_count。" },
        { "api": "job:assigned（事件）", "params": "-", "returns": "payload", "note": "字段：entity_id、job_id、level。" },
        { "api": "block:interacted（事件）", "params": "-", "returns": "payload", "note": "字段：entity_id、x、y、z、action_type、action。" },
        { "api": "core:task_activated / task_execution_starting / task_completed / task_cancelled / task_interrupted（事件）", "params": "-", "returns": "payload", "note": "权威任务生命周期通知；字段为 task_uuid、tick。同步回调可按 UUID 读取任务快照，Lua 不可自行发布。" },
        { "api": "focus:chosen（事件）", "params": "-", "returns": "payload", "note": "字段：focus_id、instance_id、choice_id、choice_action、tick。" },
        { "api": "focus:dismissed（事件）", "params": "-", "returns": "payload", "note": "字段：focus_id、instance_id、tick。" },
        { "api": "faction:spawned（事件）", "params": "-", "returns": "payload", "note": "字段：instance_id、def_id、faction_hash、display_name、relation、spawned_tick、reason。仅供未来有文档依据的专项规则显式加入阵营实例时发布；CoreMod 当前不产生该事件。" },
        { "api": "raid:started / raid:wave / raid:ended（事件）", "params": "-", "returns": "payload", "note": "字段：instance_id、def_id、faction_id、reason、alert_level、wave_index、waves、spawned、alive、tick。reason 取值 triggered、wave_deployed、attackers_cleared、duration_elapsed。详见袭击注册页。" },
        { "api": "tick（事件）", "params": "-", "returns": "payload", "note": "每个模拟 tick 触发；字段：tick、dt、tick_of_day、day、season、season_name、year。" },
        { "api": "day_changed（事件）", "params": "-", "returns": "payload", "note": "日期变更时触发；字段：day、previous_day、season、season_name、year。" },
        { "api": "season_changed（事件）", "params": "-", "returns": "payload", "note": "季节变更时触发；字段：season、previous_season、season_name、year。" },
        { "api": "year_changed（事件）", "params": "-", "returns": "payload", "note": "年份变更时触发；字段：year、previous_year。" }
      ]
    }
  ]
};
