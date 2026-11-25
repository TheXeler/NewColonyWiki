// Lua 事件 速查数据：从 lua-api-data.js 中拆出的全部事件（订阅接口 + 事件列表）。
window.__LUA_EVENTS_DATA = {
  "_meta": {
    "title": "Lua 事件 速查",
    "description": "从 Lua API 速查中拆出的全部事件：订阅接口与引擎/CoreMod/UI 事件。",
    "api_version": "0.1",
    "source_audit": [
      "Engine/Scripting/ModRuntime.cpp",
      "Engine/Scripting/EventRuntime.cpp",
      "CoreMod/data/events/"
    ],
    "risk_candidates": [
      "事件 ID 必须在 data/events 中声明；未声明的事件在订阅或发布时直接报错。",
      "回调收到事件上下文（type、initial、current、cancel、is_cancelled），业务字段在 current 中。",
      "引擎脚本环境的 block:interacted、raid:* 和日历事件没有声明，MOD 监听器无法订阅。"
    ]
  },
  "groups": [
    {
      "name": "事件",
      "items": [
        { "api": "engine.events.subscribe(event_id, priority, fn, world_bound)", "params": "string, integer, function, bool", "returns": "handler id", "note": "只订阅 data/events 中已声明的事件；priority 越大越早执行；world_bound 为 true 时要求世界存在，并在世界卸载时清理。" },
        { "api": "engine.events.unsubscribe(id)", "params": "handler id", "returns": "bool", "note": "只删除本 MOD 自己注册的订阅。" },
        { "api": "engine.events.emit(event_id, data) / emit({type=..., data=...})", "params": "string, table", "returns": "-", "note": "先按 data/events 的字段 schema 校验，再在当前 Lua runtime 内分发；未声明事件和非 table 载荷被拒绝，引擎权威任务生命周期事件不允许 Lua 发布。" },
        { "api": "engine.timers.create(name, delay, period, calls, data?)", "params": "string, integer, integer, integer, table?", "returns": "timer id", "note": "持久定时任务，随存档往返；period=0 表示只执行一次，calls=0 表示无限重复。" },
        { "api": "engine.timers.temporary(delay, period, calls, fn)", "params": "integer, integer, integer, function", "returns": "timer id", "note": "临时回调，不写入存档。" },
        { "api": "engine.timers.cancel/freeze/resume/status/query(id)", "params": "timer id", "returns": "mixed", "note": "取消、冻结、恢复、读取状态或查询剩余次数；只对本 MOD 创建的定时任务生效。" },
        { "api": "core:stockpile_changed（事件）", "params": "-", "returns": "payload", "note": "CoreMod 库存区账本变更；字段：item_id、delta、count、reason。" },
        { "api": "core:research_started（事件）", "params": "-", "returns": "payload", "note": "开始研究科技时触发；字段：tech_id、civilization_uuid。" },
        { "api": "core:recipe_crafted（事件）", "params": "-", "returns": "payload", "note": "继承 core:manufacturing_completed；字段：task_uuid、worker_uuid、recipe_id、output_count、output_piles。" },
        { "api": "core:job_assigned（事件）", "params": "-", "returns": "payload", "note": "字段：entity_uuid、job_id、rank、level。" },
        { "api": "core:item_spoiled / core:item_ground_despawned（事件）", "params": "-", "returns": "payload", "note": "地面堆或所有者槽内容腐坏、未被预留的地面堆消失；字段含 entity_uuid 或 owner_kind、item_id、count、tick。" },
        { "api": "core:task_activated / core:task_execution_starting / core:task_completed / core:task_cancelled / core:task_interrupted（事件）", "params": "-", "returns": "payload", "note": "权威任务生命周期通知；字段为 task_uuid、tick（中断另含可选 suspended）。同步回调可按 UUID 读取任务快照，Lua 不可自行发布。" },
        { "api": "core:focus_chosen（事件）", "params": "-", "returns": "payload", "note": "字段：focus_uuid、focus_id、choice_id、choice_action、tick。" },
        { "api": "core:focus_dismissed（事件）", "params": "-", "returns": "payload", "note": "字段：focus_uuid、focus_id、tick。" },
        { "api": "core:faction_spawned（事件）", "params": "-", "returns": "payload", "note": "字段：faction_uuid、def_id、display_name、relation、spawned_tick、reason。仅供未来有文档依据的专项规则显式加入阵营实例时发布；CoreMod 当前不产生该事件。" },
        { "api": "core:tick（事件）", "params": "-", "returns": "payload", "note": "每个模拟 tick 触发；字段：tick、dt。" },
        { "api": "core:world_load_completed（事件）", "params": "-", "returns": "payload", "note": "读档恢复完成；字段：world_id、from_save。" },
        { "api": "block:interacted / raid:started / raid:wave / raid:ended / day_changed / season_changed / year_changed（事件）", "params": "-", "returns": "-", "note": "仅引擎脚本环境（ScriptEngine）发布，未在 data/events 声明，MOD 监听器不可订阅；请改用 engine.raids.active()、engine.time 或 core:tick。" }
      ]
    }
  ]
};
