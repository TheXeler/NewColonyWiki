window.__LUA_API_DATA = {
  "_meta": {
    "title": "Lua API 速查",
    "description": "按当前引擎绑定整理的函数表。用搜索框过滤模块、函数名、参数或说明。",
    "api_version": "0.1",
    "source_audit": [
      "Engine/Scripting/ScriptEngine.cpp",
      "Engine/Scripting/LuaBindings.cpp"
    ],
    "status_rules": {
      "stable": "文档化、由 CoreMod 或宿主 UI/系统路径依赖，兼容性优先；engine.api_version 与 engine.version.api 是稳定版本入口。",
      "experimental": "暴露低级引擎状态、开发编辑器能力、注册型扩展点、网络命令或运行时世界修改入口；可用但后续可能收窄参数和权限。",
      "deprecated": "保留兼容但不建议新脚本使用；engine.api.version() 属于此类。"
    },
    "risk_candidates": [
      "engine.ecs.create_entity/destroy_entity/set_* 直接操作 ECS 组件，绕过原型、职业、库存、AI 和事件规则时容易破坏世界一致性。",
      "engine.world.place_block/remove_block/set_block_data 与 engine.network.send_build/send_mine 可直接改变体素世界，应优先走订单、建造、挖掘或网络同步规则。",
      "engine.events.clear 与 engine.timers.clear 是全局清理入口，会影响同一 Lua runtime 中其他 MOD 的订阅和定时器。",
      "engine.blueprint_editor.load_from_file 与 engine.locale.load_locale 触达文件系统；当前绑定限制到 MOD 或 generated 内容目录。",
      "engine.locale.reload/load_locale 与 blueprint_editor.save 是开发/编辑器向能力，不适合作为普通内容 MOD 的核心运行时依赖。"
    ]
  },
  "groups": [
    {
      "name": "版本与日志",
      "items": [
        { "api": "engine.api_version", "params": "属性", "returns": "string", "note": "[stable] 当前公共 MOD API 版本；推荐新脚本使用。" },
        { "api": "engine.version.api", "params": "属性", "returns": "string", "note": "[stable] 当前公共 MOD API 版本；与 engine.api_version 等价。" },
        { "api": "engine.api.version()", "params": "-", "returns": "string", "note": "[deprecated] 旧版本查询入口，仅为兼容保留；新脚本改用 engine.api_version 或 engine.version.api。" },
        { "api": "engine.log.debug(msg)", "params": "string", "returns": "-", "note": "写调试日志，自动加 Lua 标记。" },
        { "api": "engine.log.info(msg)", "params": "string", "returns": "-", "note": "写信息日志，自动加 Lua 标记。" },
        { "api": "engine.log.warn(msg)", "params": "string", "returns": "-", "note": "写警告日志。" },
        { "api": "engine.log.error(msg)", "params": "string", "returns": "-", "note": "写错误日志。" }
      ]
    },
    {
      "name": "时间",
      "items": [
        { "api": "engine.time.tps", "params": "属性", "returns": "number", "note": "模拟每秒 tick 数（20）。" },
        { "api": "engine.time.dt", "params": "属性", "returns": "number", "note": "每 tick 的模拟时间间隔（0.05s）。" },
        { "api": "engine.time.day_ticks_per_day", "params": "属性", "returns": "integer", "note": "每个游戏日的日内 tick 数。" },
        { "api": "engine.time.day_ticks_per_sim_tick", "params": "属性", "returns": "integer", "note": "每个模拟 tick 推进的日内 tick 数。" },
        { "api": "engine.time.days_per_season", "params": "属性", "returns": "integer", "note": "每季天数。" },
        { "api": "engine.time.seasons_per_year", "params": "属性", "returns": "integer", "note": "每年季节数。" },
        { "api": "engine.time.days_per_year", "params": "属性", "returns": "integer", "note": "每年天数。" },
        { "api": "engine.time.get_tick_of_day()", "params": "-", "returns": "integer", "note": "当前日内 tick。" },
        { "api": "engine.time.get_day()", "params": "-", "returns": "integer", "note": "当前年内日期。" },
        { "api": "engine.time.get_season()", "params": "-", "returns": "integer", "note": "当前季节索引。" },
        { "api": "engine.time.get_season_name()", "params": "-", "returns": "string", "note": "当前季节名。" },
        { "api": "engine.time.get_year()", "params": "-", "returns": "integer", "note": "当前年份。" }
      ]
    },
    {
      "name": "设置与天气",
      "items": [
        { "api": "engine.settings.set_auto_save(mode)", "params": "string", "returns": "bool", "note": "设置自动保存频率：never、daily、monthly 或 yearly。" },
        { "api": "engine.settings.get_auto_save()", "params": "-", "returns": "string", "note": "返回当前自动保存频率文本。" },
        { "api": "engine.settings.get_auto_save_frequency()", "params": "-", "returns": "integer", "note": "返回自动保存频率枚举值。" },
        { "api": "engine.weather.get()", "params": "-", "returns": "table", "note": "返回当前天气：type、intensity、temperature、humidity、wind_x、wind_z、started_tick、next_transition_tick、precipitating。" },
        { "api": "engine.weather.get_type()", "params": "-", "returns": "string", "note": "返回当前天气类型：clear、cloudy、rain、storm 或 snow。" },
        { "api": "engine.weather.is_precipitating()", "params": "-", "returns": "bool", "note": "当前是否正在下雨、暴风雨或下雪。" }
      ]
    },
    {
      "name": "确定性随机",
      "items": [
        { "api": "engine.random.seed(seed)", "params": "integer", "returns": "-", "note": "重置 Lua 确定性随机流。引擎初始化、新世界和读档时会用世界 seed 自动调用；因 LuaJIT 的 number 是 double（安全整数仅到 2^53），引擎会把 64 位世界 seed 折叠到 2^53 以内再传入，每世界确定性不变。脚本自行调用时传普通整数即可。" },
        { "api": "engine.random.float()", "params": "-", "returns": "number", "note": "返回 [0, 1) 范围内的确定性浮点数。" },
        { "api": "engine.random.int(min, max)", "params": "integer, integer", "returns": "integer", "note": "返回闭区间 [min, max] 内的确定性整数；参数顺序反了会自动交换。" },
        { "api": "engine.random.bool()", "params": "-", "returns": "bool", "note": "返回确定性布尔值。" }
      ]
    },
    {
      "name": "音频",
      "items": [
        { "api": "engine.audio.play(id, volume, loop)", "params": "string, number?, bool?", "returns": "handle id", "note": "播放已注册到 SoundBank 的音频，失败时返回 0。" },
        { "api": "engine.audio.play_3d(id, x, y, z, volume, loop)", "params": "string, number, number, number, number?, bool?", "returns": "handle id", "note": "在世界坐标播放 3D 音频。" },
        { "api": "engine.audio.stop(handle)", "params": "handle id", "returns": "-", "note": "停止单个播放实例。" },
        { "api": "engine.audio.stop_all()", "params": "-", "returns": "-", "note": "停止全部当前播放实例。" },
        { "api": "engine.audio.set_master_volume(value)", "params": "number", "returns": "-", "note": "设置主音量，范围会夹到 0 到 1。" },
        { "api": "engine.audio.set_music_volume(value)", "params": "number", "returns": "-", "note": "设置音乐分类音量。" },
        { "api": "engine.audio.set_effects_volume(value)", "params": "number", "returns": "-", "note": "设置音效分类音量。" },
        { "api": "engine.audio.set_ambient_volume(value)", "params": "number", "returns": "-", "note": "设置环境音分类音量。" },
        { "api": "engine.audio.get_master_volume()", "params": "-", "returns": "number", "note": "读取主音量。" },
        { "api": "engine.audio.get_music_volume()", "params": "-", "returns": "number", "note": "读取音乐分类音量。" },
        { "api": "engine.audio.get_effects_volume()", "params": "-", "returns": "number", "note": "读取音效分类音量。" },
        { "api": "engine.audio.get_ambient_volume()", "params": "-", "returns": "number", "note": "读取环境音分类音量。" },
        { "api": "engine.audio.set_listener_position(x, y, z)", "params": "number, number, number", "returns": "-", "note": "设置音频 listener 位置；主循环也会按摄像机位置同步。" }
      ]
    },
    {
      "name": "ECS 实体",
      "items": [
        { "api": "engine.ecs.create_entity()", "params": "-", "returns": "entity id", "note": "[experimental] 创建一个空实体；低级 ECS 入口，内容 MOD 优先使用原型。" },
        { "api": "engine.ecs.spawn_prototype(id)", "params": "data id", "returns": "entity id 或 0", "note": "按 data/entities 原型创建实体。" },
        { "api": "engine.ecs.destroy_entity(entity)", "params": "entity id", "returns": "-", "note": "[experimental] 销毁实体；会绕过更高层 gameplay 流程，慎用于运行时内容。" },
        { "api": "engine.ecs.is_alive(entity)", "params": "entity id", "returns": "bool", "note": "实体是否还存在。" },
        { "api": "engine.ecs.entity_count()", "params": "-", "returns": "number", "note": "当前实体总数。" },
        { "api": "engine.ecs.has_component(entity, name)", "params": "entity id, string", "returns": "bool", "note": "组件名用小写，如 position、health。" },
        { "api": "engine.ecs.create_colonist(x, y, z, name)", "params": "number, number, number, string?", "returns": "entity id", "note": "创建带殖民者常用组件的实体；坐标不安全时会在附近搜索可站立位置。" },
        { "api": "engine.ecs.set_position(entity, x, y, z)", "params": "number, number, number", "returns": "-", "note": "[experimental] 直接设置 Position 组件；移动行为优先使用 move_to 或系统命令。" },
        { "api": "engine.ecs.get_position(entity)", "params": "entity id", "returns": "table", "note": "返回 { x, y, z }，没有组件时返回空表。" },
        { "api": "engine.ecs.get_velocity(entity)", "params": "entity id", "returns": "table", "note": "返回 { x, y, z }。" },
        { "api": "engine.ecs.get_speed(entity)", "params": "entity id", "returns": "table", "note": "get_velocity() 的同义接口，返回 { x, y, z }。" },
        { "api": "engine.ecs.move_to(entity, x, y, z)", "params": "number, number, number", "returns": "bool", "note": "通过导航 API 请求实体移动到目标位置。" },
        { "api": "engine.ecs.stop_move(entity)", "params": "entity id", "returns": "-", "note": "停止实体当前导航移动。" },
        { "api": "engine.ecs.has_path(entity)", "params": "entity id", "returns": "bool", "note": "实体当前是否有导航路径。" },
        { "api": "engine.ecs.set_rotation(entity, yaw, pitch)", "params": "number, number", "returns": "-", "note": "设置 Rotation 组件。" },
        { "api": "engine.ecs.get_rotation(entity)", "params": "entity id", "returns": "table", "note": "返回 { yaw, pitch }。" },
        { "api": "engine.ecs.set_scale(entity, x, y, z)", "params": "number, number, number", "returns": "-", "note": "设置 Scale 组件。" },
        { "api": "engine.ecs.get_scale(entity)", "params": "entity id", "returns": "table", "note": "返回 { x, y, z }。" },
        { "api": "engine.ecs.set_health(entity, current, max)", "params": "integer, integer", "returns": "-", "note": "[experimental] 直接设置 Health 组件；可能绕过伤害、治疗和事件规则。" },
        { "api": "engine.ecs.get_health(entity)", "params": "entity id", "returns": "table", "note": "返回 { current, max }。" },
        { "api": "engine.ecs.set_needs(entity, hunger, fatigue)", "params": "number, number", "returns": "-", "note": "设置殖民者的两项需求。" },
        { "api": "engine.ecs.get_needs(entity)", "params": "entity id", "returns": "table", "note": "返回 { hunger, fatigue }。" },
        { "api": "engine.ecs.get_mood(entity)", "params": "entity id", "returns": "table", "note": "返回 mood_value、broken_down、breakdown_timer、thought_count。" },
        { "api": "engine.ecs.set_mood_value(entity, value)", "params": "entity, number", "returns": "-", "note": "设置心情值，范围会夹到 0 到 100。" },
        { "api": "engine.ecs.set_name(entity, name)", "params": "string", "returns": "-", "note": "设置 Name 组件。" },
        { "api": "engine.ecs.get_name(entity)", "params": "entity id", "returns": "string", "note": "没有 Name 时返回 nil。" },
        { "api": "engine.ecs.add_colonist_tag(entity)", "params": "entity id", "returns": "-", "note": "给实体加上殖民者标记。" },
        { "api": "engine.ecs.has_colonist_tag(entity)", "params": "entity id", "returns": "bool", "note": "检查实体是否有殖民者标记。" },
        { "api": "engine.ecs.set_ai_state(entity, tree, lod)", "params": "integer, integer", "returns": "-", "note": "设置 AIState，current_node 置为 0。" },
        { "api": "engine.ecs.get_ai_state(entity)", "params": "entity id", "returns": "table", "note": "返回 behavior_tree_id、current_node、lod_level。" },
        { "api": "engine.ecs.set_job(entity, id, level)", "params": "data id, integer", "returns": "-", "note": "[experimental] 直接设置 Job 组件，不检查职业规则；通常改用 engine.jobs.assign。" },
        { "api": "engine.ecs.get_job(entity)", "params": "entity id", "returns": "table", "note": "返回哈希后的 job_id 和 level。" },
        { "api": "engine.ecs.add_job_xp(entity, xp)", "params": "entity, number", "returns": "bool", "note": "给 Job 组件增加经验值并按默认等级上限升级；返回本次是否升级。" },
        { "api": "engine.ecs.give_item(entity, id, count)", "params": "data id, integer", "returns": "bool", "note": "按物品堆叠上限加入库存，成功时触发 inventory:changed。" },
        { "api": "engine.ecs.get_inventory(entity)", "params": "entity id", "returns": "table", "note": "返回原始 item_id 和 count。" },
        { "api": "engine.ecs.give_block(entity, block_id, count)", "params": "entity, data id, integer", "returns": "bool", "note": "把方块物品放入空的 HeldItem 槽，并触发库存事件。" },
        { "api": "engine.ecs.has_held_item(entity)", "params": "entity id", "returns": "bool", "note": "实体是否有 HeldItem 组件。" },
        { "api": "engine.ecs.get_held_item(entity)", "params": "entity id", "returns": "table", "note": "返回 item_id 和 count。" },
        { "api": "engine.ecs.set_held_item(entity, item_id, count)", "params": "entity, hashed id, integer", "returns": "bool", "note": "[experimental] 写入已有 HeldItem 槽；可能绕过库存账本和预留规则。" },
        { "api": "engine.ecs.clear_held_item(entity)", "params": "entity id", "returns": "bool", "note": "清空已有 HeldItem 槽。" },
        { "api": "engine.ecs.has_stats(entity)", "params": "entity id", "returns": "bool", "note": "实体是否有 Stats 组件。" },
        { "api": "engine.ecs.get_stats(entity)", "params": "entity id", "returns": "table", "note": "返回基础属性、经验和派生工作/战斗数值；Stats 组件包含 hit_rate、attack_range、attack_frequency 三个基础派生战斗字段。" },
        { "api": "engine.ecs.set_base_stats(entity, str, dex, int)", "params": "entity, number, number, number", "returns": "-", "note": "[experimental] 设置基础属性并重新计算派生数值。" },
        { "api": "engine.ecs.add_stat_xp(entity, attr, xp)", "params": "entity, string, number", "returns": "-", "note": "给 strength/str、dexterity/dex 或 intelligence/int 增加经验。" },
        { "api": "engine.ecs.set_block_interactor(entity, x, y, z, action)", "params": "integer...", "returns": "-", "note": "设置方块交互意图并触发 block:interacted。action: 1=mine, 2=place, 3=interact。" },
        { "api": "engine.ecs.get_block_interactor(entity)", "params": "entity id", "returns": "table", "note": "返回 x、y、z、action_type，没有组件时返回空表。" },
        { "api": "engine.ecs.set_prototype_ref(entity, id)", "params": "entity id, data id", "returns": "-", "note": "直接设置 PrototypeRef 组件。" },
        { "api": "engine.ecs.get_prototype_ref(entity)", "params": "entity id", "returns": "string", "note": "读取 PrototypeRef；没有组件时返回空字符串。" },
        { "api": "engine.ecs.query_all_entities()", "params": "-", "returns": "table", "note": "返回所有实体 ID。" },
        { "api": "engine.ecs.get_all_entities()", "params": "-", "returns": "table", "note": "query_all_entities() 的同义接口。" },
        { "api": "engine.ecs.get_entity_type(entity)", "params": "entity id", "returns": "string 或 nil", "note": "按组件粗略返回 colonist、item、worker 或 entity；实体不存在时返回 nil。" },
        { "api": "engine.ecs.query_colonists()", "params": "-", "returns": "table", "note": "返回有 Position 和 ColonistTag 的实体条目。" },
        { "api": "engine.ecs.query_with_position()", "params": "-", "returns": "table", "note": "返回有 Position 组件的实体条目。" },
        { "api": "engine.ecs.query_with_health()", "params": "-", "returns": "table", "note": "返回有 Health 组件的实体条目。" },
        { "api": "engine.ecs.add_equipment(entity)", "params": "entity id", "returns": "-", "note": "给实体添加 Equipment 组件（空装备栏）。" },
        { "api": "engine.ecs.has_equipment(entity)", "params": "entity id", "returns": "bool", "note": "实体是否有 Equipment 组件。" }
      ]
    },
    {
      "name": "脚本数据组件",
      "items": [
        { "api": "engine.data.ensure(entity)", "params": "entity id", "returns": "bool", "note": "给存活实体创建脚本数据组件；已存在时保持原数据。" },
        { "api": "engine.data.has(entity)", "params": "entity id", "returns": "bool", "note": "实体是否有脚本数据组件。" },
        { "api": "engine.data.set(entity, path, value)", "params": "entity, string, any", "returns": "bool", "note": "按点分路径写入值，自动创建中间 compound。" },
        { "api": "engine.data.get(entity, path, fallback)", "params": "entity, string, any?", "returns": "any", "note": "按点分路径读取值；不存在时返回 fallback 或 nil。" },
        { "api": "engine.data.remove(entity, path)", "params": "entity, string", "returns": "bool", "note": "删除路径上的值。" },
        { "api": "engine.data.type(entity, path)", "params": "entity, string", "returns": "string", "note": "返回 Lua 类型名；表返回 compound，函数/userdata 也会按实际类型名返回。" },
        { "api": "engine.data.get_all(entity)", "params": "entity id", "returns": "table 或 nil", "note": "返回整个数据 compound。" },
        { "api": "engine.data.clear(entity)", "params": "entity id", "returns": "bool", "note": "清空实体脚本数据组件。" }
      ]
    },
    {
      "name": "Modding 查询",
      "items": [
        { "api": "engine.modding.get_data_json(type, id)", "params": "data type, data id", "returns": "string", "note": "返回注册表中的原始 JSON，未找到时返回空字符串。" },
        { "api": "engine.modding.resolve_block_id(hash)", "params": "hashed id", "returns": "string", "note": "把方块哈希解析为数据 ID；未找到时返回空字符串。" },
        { "api": "engine.modding.list_by_type(type)", "params": "blocks/combat 等", "returns": "table", "note": "列出指定数据类型的全部 ID；combat 类型当前主要包含启动默认值记录。" },
        { "api": "engine.modding.get_block_info(hash)", "params": "integer", "returns": "table", "note": "返回哈希方块 ID 的注册信息：id、hash、exists、material、has_item_block、mineable、choppable、selectable 和 drops。" },
        { "api": "engine.modding.get_crop_info(crop_id)", "params": "data id", "returns": "table 或 nil", "note": "读取作物注册信息，包含 farmland、growth_stages、growth_ticks、crop_block 和 outputs。" },
        { "api": "engine.modding.get_setting(mod, key, fallback)", "params": "string, string, any", "returns": "any", "note": "读取配置，结合清单默认值和用户覆盖后的最终值。" }
      ]
    },
    {
      "name": "Tag（矿物词典）",
      "items": [
        { "api": "engine.tags.has(block, tag)", "params": "block id 或 hash, string", "returns": "bool", "note": "判断方块是否属于某 tag。详见 Tag 注册页。" },
        { "api": "engine.tags.blocks(tag)", "params": "string", "returns": "table", "note": "返回该 tag 下所有方块：每行 { hash, id }。" },
        { "api": "engine.tags.list()", "params": "-", "returns": "table", "note": "返回所有已声明 tag 字符串。" },
        { "api": "engine.tags.of_block(block)", "params": "block id 或 hash", "returns": "table", "note": "返回该方块拥有的 tag 字符串数组。" }
      ]
    },
    {
      "name": "合成 / 建筑 / 职业",
      "items": [
        { "api": "engine.crafting.craft(entity, recipe)", "params": "entity id, data id", "returns": "bool", "note": "直接调用 RecipeSys::craft：只检查实体单个 HeldItem 槽；成功时扣除输入、添加输出，并触发库存和配方事件。" },
        { "api": "engine.crafting.list_recipes()", "params": "-", "returns": "table", "note": "列出已加载的配方 ID。" },
        { "api": "engine.crafting.get_recipe(recipe)", "params": "data id", "returns": "table 或 nil", "note": "返回配方详情：id、inputs、output、可选 Job 和 job_level。" },
        { "api": "systems.resources.summary()", "params": "-", "returns": "table", "note": "CoreMod 资源汇总入口；当前返回 stockpile 快照，供主界面、科技、制造和建造聚合读取。" },
        { "api": "systems.resources.stockpile_snapshot()", "params": "-", "returns": "table", "note": "返回 stockpile 账本数组：{ item_hash, item_id, count }。" },
        { "api": "systems.resources.preview(requirements)", "params": "table", "returns": "table", "note": "按需求数组返回 { item_hash, item_id, required, available, missing }。" },
        { "api": "systems.crafting.queue(entity, recipe, faction, x, y, z, duration)", "params": "entity, data id, hashed id, position, number?", "returns": "table", "note": "CoreMod 辅助系统。优先从 stockpile 账本预留输入材料并发布 data=0 的 craft 工作，由 Lua 在完成后回写产物；未预留时才保留 HeldItem/C++ 直接制作路径。材料不足返回 { ok=false, reason=\"missing_inputs\" }。" },
        { "api": "engine.buildings.list_definitions()", "params": "-", "returns": "table", "note": "列出已加载的建筑定义 ID。" },
        { "api": "engine.buildings.register_runtime_definition(table)", "params": "table", "returns": "bool", "note": "注册当前运行时可用的建筑定义。字段使用 size_x/size_y/size_z、materials 和 blueprint；不会自动写入 MOD 文件或存档。" },
        { "api": "engine.buildings.validate_placement(def_id, x, y, z)", "params": "data id, integer, integer, integer", "returns": "table", "note": "检查建筑蓝图能否放置到指定原点，返回 ok、reason 和冲突坐标。" },
        { "api": "engine.buildings.create(def_id, x, y, z)", "params": "data id, integer, integer, integer", "returns": "table", "note": "创建建筑实例并返回 instance_id、definition_hash、state、x、y、z 和 progress。" },
        { "api": "engine.buildings.find(instance_id)", "params": "integer", "returns": "table 或 nil", "note": "读取建筑实例状态，返回 instance_id、definition_hash、state、x、y、z 和 progress。" },
        { "api": "engine.buildings.find_definition(id)", "params": "data id", "returns": "table 或 nil", "note": "读取建筑定义，包含 size、materials、construction_ticks 和 blueprint。" },
        { "api": "engine.buildings.advance_construction(instance_id, dt)", "params": "integer, number", "returns": "bool", "note": "推进施工进度；到 1.0 时切换为 Completed 并返回 true。" },
        { "api": "engine.buildings.set_state(instance_id, state)", "params": "integer, integer", "returns": "bool", "note": "直接设置建筑状态枚举值。" },
        { "api": "engine.buildings.set_preview(def_id, x, y, z, valid)", "params": "data id, integer, integer, integer, bool", "returns": "bool", "note": "在 HUD 上显示建筑放置预览线框。" },
        { "api": "engine.buildings.clear_preview()", "params": "-", "returns": "-", "note": "清除建筑放置预览。" },
        { "api": "engine.buildings.remove(instance_id)", "params": "integer", "returns": "bool", "note": "删除建筑实例。" },
        { "api": "engine.buildings.begin_placement(def_id)", "params": "data id", "returns": "bool", "note": "开始交互式建筑放置模式。" },
        { "api": "engine.buildings.end_placement()", "params": "-", "returns": "-", "note": "结束交互式建筑放置模式。" },
        { "api": "engine.buildings.placement_active()", "params": "-", "returns": "bool", "note": "当前是否处于建筑放置模式。" },
        { "api": "engine.buildings.placement_state()", "params": "-", "returns": "table", "note": "返回放置状态：active、def_id、x、y、z、valid。" },
        { "api": "systems.construction.preview_materials(def_id)", "params": "data id", "returns": "table", "note": "返回施工材料预检查：{ ok, reason, materials, missing }。" },
        { "api": "systems.construction.order(def_id, x, y, z)", "params": "data id, integer, integer, integer", "returns": "table", "note": "定义和位置有效时创建施工订单；材料足够返回 { ok=true, status=\"constructing\", info, reserved_materials }，缺料仍排队并返回 { ok=true, status=\"waiting_materials\", materials, missing }。" },
        { "api": "systems.construction.active()", "params": "-", "returns": "table", "note": "返回当前 CoreMod 施工记录，含 instance_id、def_id、status、position、materials、missing 和 reserved_materials，供调试或经营聚合读取。" },
        { "api": "engine.blueprint_editor.open(x,y,z, sx,sy,sz)", "params": "6 个 integer", "returns": "bool", "note": "在指定原点打开尺寸为 sx*sy*sz 的 3D 幽灵画布。最大 16x16x16。" },
        { "api": "engine.blueprint_editor.close()", "params": "-", "returns": "-", "note": "关闭画布并丢弃未保存内容。" },
        { "api": "engine.blueprint_editor.is_active()", "params": "-", "returns": "bool", "note": "画布是否处于激活状态。" },
        { "api": "engine.blueprint_editor.origin()", "params": "-", "returns": "table{x,y,z}", "note": "画布世界原点。" },
        { "api": "engine.blueprint_editor.size()", "params": "-", "returns": "table{x,y,z}", "note": "画布尺寸。" },
        { "api": "engine.blueprint_editor.set_tool(name)", "params": "string", "returns": "bool", "note": "切换工具：pen/rect/fill/erase/select/room/floor_plan/roof/door/window。" },
        { "api": "engine.blueprint_editor.get_tool()", "params": "-", "returns": "string", "note": "读取当前工具名。" },
        { "api": "engine.blueprint_editor.set_block(block_id)", "params": "data id", "returns": "bool", "note": "设置笔刷/矩形/填充使用的方块。" },
        { "api": "engine.blueprint_editor.set_floor_block(block_id)", "params": "data id", "returns": "bool", "note": "设置 Room/FloorPlan 提交时快照使用的地板材料。" },
        { "api": "engine.blueprint_editor.set_wall_block(block_id)", "params": "data id", "returns": "bool", "note": "设置 Room/FloorPlan 提交时快照使用的墙体材料。" },
        { "api": "engine.blueprint_editor.set_roof_block(block_id)", "params": "data id", "returns": "bool", "note": "设置 flat roof 使用的屋顶材料。" },
        { "api": "engine.blueprint_editor.set_roof_type(type)", "params": "string", "returns": "-", "note": "设置屋顶类型；支持 none、flat 或 gable。" },
        { "api": "engine.blueprint_editor.room_count()", "params": "-", "returns": "integer", "note": "返回当前设计中的 Room 数量。" },
        { "api": "engine.blueprint_editor.set_layer(y) / get_layer()", "params": "integer / -", "returns": "- / integer", "note": "切换/读取当前 Y 层。" },
        { "api": "engine.blueprint_editor.undo() / redo()", "params": "-", "returns": "bool", "note": "撤销或重做最近一次操作。" },
        { "api": "engine.blueprint_editor.can_undo() / can_redo()", "params": "-", "returns": "bool", "note": "是否还有可撤销/重做的项。栈上限 100。" },
        { "api": "engine.blueprint_editor.rotate()", "params": "-", "returns": "-", "note": "顺时针旋转画布 90°，size_x ↔ size_z 互换。" },
        { "api": "engine.blueprint_editor.mirror_x() / mirror_z()", "params": "-", "returns": "-", "note": "沿 X 或 Z 轴镜像画布内容。" },
        { "api": "engine.blueprint_editor.clear()", "params": "-", "returns": "-", "note": "清空所有方块。" },
        { "api": "engine.blueprint_editor.copy() / paste(x,y,z)", "params": "- / 3 个 integer", "returns": "-", "note": "把选区复制到剪贴板，在指定世界坐标粘贴。" },
        { "api": "engine.blueprint_editor.has_clipboard()", "params": "-", "returns": "bool", "note": "剪贴板是否有内容。" },
        { "api": "engine.blueprint_editor.clear_selection()", "params": "-", "returns": "-", "note": "清空当前选区。" },
        { "api": "engine.blueprint_editor.has_selection()", "params": "-", "returns": "bool", "note": "是否有选区。" },
        { "api": "engine.blueprint_editor.cell_count()", "params": "-", "returns": "integer", "note": "画布中已绘制的方块数。" },
        { "api": "engine.blueprint_editor.is_dirty()", "params": "-", "returns": "bool", "note": "画布内容是否有未保存的修改。" },
        { "api": "engine.blueprint_editor.mark_clean()", "params": "-", "returns": "-", "note": "将画布标记为已保存（清除脏标记）。" },
        { "api": "engine.blueprint_editor.set_door_block(block_id)", "params": "data id", "returns": "bool", "note": "设置设计使用的门材料方块。" },
        { "api": "engine.blueprint_editor.set_window_block(block_id)", "params": "data id", "returns": "bool", "note": "设置设计使用的窗材料方块。" },
        { "api": "engine.blueprint_editor.paste_hover()", "params": "-", "returns": "bool", "note": "在鼠标悬停位置粘贴剪贴板内容；没有悬停目标时返回 false。" },
        { "api": "engine.blueprint_editor.load_from_file(path) / load_definition(id)", "params": "path / data id", "returns": "bool", "note": "[experimental] 从导出的建筑 JSON 或已注册建筑定义加载 design；文件路径限制在 MOD 或 generated 内容目录，没有 design 时回退导入顶层 blueprint 方块。" },
        { "api": "engine.blueprint_editor.save(name)", "params": "string", "returns": "table{id,path,persisted} 或 nil", "note": "把画布打包为 BuildingDef 调用 register_runtime_definition，并导出 JSON 到 player_blueprints。JSON 保留 blueprint/materials/size，并附加 design skeleton 或房间/屋顶/门窗设计数据；空画布返回 nil。" },
        { "api": "engine.selection.hovered_block()", "params": "-", "returns": "table", "note": "读取当前鼠标悬停方块，包含 active、x/y/z、face 和 adjacent_x/y/z。" },
        { "api": "engine.selection.selected_block()", "params": "-", "returns": "table", "note": "读取当前已确认选择的方块。普通模式下左键会确认选择。" },
        { "api": "engine.jobs.list()", "params": "-", "returns": "table", "note": "列出已加载的职业 ID。" },
        { "api": "engine.jobs.defs() / tree()", "params": "-", "returns": "table", "note": "返回职业定义或转职树节点；每个节点包含 category，combat 表示战斗职业。" },
        { "api": "engine.jobs.can_assign(entity, Job)", "params": "entity, data id", "returns": "bool", "note": "检查实体是否满足转职条件。" },
        { "api": "engine.jobs.assign(entity, Job, level)", "params": "entity, data id, integer?", "returns": "bool", "note": "分配职业，成功时触发 job:assigned；分配 category=combat 的职业会建立 Squad/CombatState。V2 战斗不再为 mage 建立 ManaReserve。" },
        { "api": "engine.jobs.resign(entity)", "params": "entity", "returns": "bool", "note": "撤销当前职业，回到父职业或 core:colonist，等级设为目标职业上限并清空经验。" },
        { "api": "engine.jobs.add_xp(entity, xp)", "params": "entity, number", "returns": "bool", "note": "按当前职业定义增加经验并自动升级；达到 max_level 后停止累计经验。" },
        { "api": "engine.jobs.xp_required_for_level(level)", "params": "integer", "returns": "number", "note": "返回职业从该等级升到下一级所需经验。" },
        { "api": "require(\"components.combat\")", "params": "-", "returns": "table", "note": "CoreMod 战斗组件字段清单：Squad、CombatState、SquadSoldierVisual、兼容保留的 ManaReserve 和 CombatMode；Squad 包含隐藏 attack_cooldown。" },
        { "api": "require(\"systems.combat_data\").weapon_counters()", "params": "-", "returns": "table", "note": "V2 返回空规则表；近战基础战斗不读取武器克制。" },
        { "api": "require(\"systems.combat_data\").suppression_rules()", "params": "-", "returns": "table", "note": "V2 返回空规则表；近战基础战斗不产生压制层数。" },
        { "api": "CombatSystem::list_squads(world)", "params": "C++", "returns": "SquadView[]", "note": "战斗 HUD 查询入口：小队生命、人数、目标、战斗态、阵营和兼容用武器粗分类。" }
      ]
    },
    {
      "name": "工作池",
      "items": [
        { "api": "engine.work.post(type, faction_id, x, y, z, duration, payload_id)", "params": "string, hashed id, number, number, number, number?, integer?", "returns": "work id", "note": "发布工作到工作池；type 是兼容工作标签入口，mine/chop 默认 Block+Destroy，其它默认 Block+Interact；脚本驱动 work 通过 work:completed 完成，显式 Block payload 的 Block+Interact 才触发底层 block interaction；faction_id 必填且不能为 0。" },
        { "api": "engine.work.cancel(id)", "params": "work id", "returns": "-", "note": "取消工作。" },
        { "api": "engine.work.cancel_matching(work_tag, faction_id?, payload_id?)", "params": "string, hashed id?, integer?", "returns": "integer", "note": "按工作标签、阵营和可选 payload_id 批量取消工作，返回取消数量。指令菜单按 mine/chop 标签中断已发布的采集/挖矿工作；正在执行的 AI 会在下一次检查工作有效性时退出当前工作。" },
        { "api": "engine.work.is_valid(id)", "params": "work id", "returns": "bool", "note": "检查工作是否仍在工作池中。" },
        { "api": "engine.work.total()", "params": "-", "returns": "integer", "note": "返回工作池中活跃工作数量。" },
        { "api": "engine.work.list() 当前工作池实例：instance_id、tag、category、target_kind、action、payload_kind、payload_id、faction_id、assigned_worker、progress、estimated_duration、x/y/z、target_entity、active。" }
      ]
    },
    {
      "name": "区域",
      "items": [
        { "api": "engine.zone.list_types()", "params": "-", "returns": "table", "note": "列出已加载的区域类型 ID。" },
        { "api": "engine.zone.get_type_info(type_id)", "params": "data id", "returns": "table", "note": "读取区域类型定义；失败时返回 { ok=false }。" },
        { "api": "engine.zone.create_rect(type_id, name, min_x, min_y, min_z, max_x, max_y, max_z, overrides)", "params": "string, string, integer...", "returns": "table", "note": "创建矩形区域实例，可用 overrides 覆盖 shape、targets 和 filter。" },
        { "api": "engine.zone.remove(instance_id)", "params": "integer", "returns": "bool", "note": "按实例 ID 删除区域。" },
        { "api": "engine.zone.find_at(x, y, z)", "params": "integer, integer, integer", "returns": "table", "note": "查询坐标所在区域；失败时返回 { ok=false }。" },
        { "api": "engine.zone.all_zones()", "params": "-", "returns": "table", "note": "列出全部区域实例。" },
        { "api": "engine.zone.find_zones_by_type(type_id)", "params": "data id", "returns": "table", "note": "按区域类型列出实例。" },
        { "api": "engine.zone.find_zones_with_target(x, y, z, target)", "params": "integer, integer, integer, string", "returns": "table", "note": "查找覆盖指定坐标且包含目标类型的区域。" },
        { "api": "engine.zone.remove_at(x, y, z)", "params": "integer, integer, integer", "returns": "bool", "note": "删除指定坐标处的区域。" },
        { "api": "engine.zone.remove_cell(x, y, z)", "params": "integer, integer, integer", "returns": "bool", "note": "从区域系统中移除单个坐标格。" },
        { "api": "engine.selection.start(options)", "params": "table", "returns": "bool", "note": "开始一次性通用选取；shape 可为 2d 或 3d。2D 从鼠标命中表面的外侧格开始（顶面通常为 Y+1），3D 从命中的实际方块开始。调用方可通过 filter.blocks、filter.items（ID 别名）或 filter.tags 提供允许的方块 ID/TAG 列表。" },
        { "api": "engine.selection.cancel()", "params": "-", "returns": "-", "note": "取消当前选区。" },
        { "api": "engine.selection.confirm_zone()", "params": "-", "returns": "bool", "note": "将当前选区创建为持久区域。" },
        { "api": "engine.selection.cells()", "params": "-", "returns": "table", "note": "返回当前选取的完整几何范围；预览范围不等于有效目标，实际目标由 start(options) 提供的 ID/TAG 过滤得到。每行包含 x、y、z、block_hash、block_id 和 solid。" },
        { "api": "engine.selection.state()", "params": "-", "returns": "table", "note": "返回当前选区形状、起点、当前点、范围和深度偏移。" },
        { "api": "engine.selection.confirm_mine()", "params": "-", "returns": "table", "note": "消费当前 3D 选取中匹配 filter 的方块并发布 mine 工作；选取随后结束，返回 { ok, count }。" },
        { "api": "engine.selection.confirm_chop()", "params": "-", "returns": "table", "note": "消费当前 2D 选取中匹配 filter 的方块并发布 chop 工作；选取随后结束，返回 { ok, count }。" },
        { "api": "engine.zone.set_drag_active(active)", "params": "bool", "returns": "-", "note": "传 false 时取消当前区域拖拽指定。" },
        { "api": "engine.zone.is_drag_active()", "params": "-", "returns": "bool", "note": "当前是否处于区域拖拽指定状态。" },
        { "api": "engine.zone.set_setting(instance_id, key, value)", "params": "integer, string, string|bool|number|nil", "returns": "bool", "note": "写入区域实例的 settings 键值对（值会被转成字符串）；传 nil 删除该键。失败返回 false。" },
        { "api": "engine.zone.get_setting(instance_id, key, fallback)", "params": "integer, string, any", "returns": "string|any", "note": "读取区域实例的 settings 键；不存在时返回 fallback 或 nil。返回值始终是字符串。" }
      ]
    },
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
        { "api": "work:completed（事件）", "params": "-", "returns": "payload", "note": "字段：instance_id、worker、tag、category、target_kind、action、payload_kind、payload_id、faction_id、x、y、z、target_entity、tick。" },
        { "api": "focus:chosen（事件）", "params": "-", "returns": "payload", "note": "字段：focus_id、instance_id、choice_id、choice_action、tick。" },
        { "api": "focus:dismissed（事件）", "params": "-", "returns": "payload", "note": "字段：focus_id、instance_id、tick。" },
        { "api": "faction:spawned（事件）", "params": "-", "returns": "payload", "note": "字段：instance_id、def_id、faction_hash、display_name、relation、min_relation、max_relation、inclination、spawned_tick、reason（initial/console/script/spawned）。在 faction_spawn_rules 自动 spawn、控制台 spawn_faction / spawn_initial_factions、Lua engine.factions.spawn / spawn_initial 调用时各发一次。" },
        { "api": "tick（事件）", "params": "-", "returns": "payload", "note": "每个模拟 tick 触发；字段：tick、dt、tick_of_day、day、season、season_name、year。" },
        { "api": "day_changed（事件）", "params": "-", "returns": "payload", "note": "日期变更时触发；字段：day、previous_day、season、season_name、year。" },
        { "api": "season_changed（事件）", "params": "-", "returns": "payload", "note": "季节变更时触发；字段：season、previous_season、season_name、year。" },
        { "api": "year_changed（事件）", "params": "-", "returns": "payload", "note": "年份变更时触发；字段：year、previous_year。" }
      ]
    },
    {
      "name": "定时器",
      "items": [
        { "api": "engine.timers.after(ticks, fn)", "params": "integer, function", "returns": "timer id", "note": "一次性定时器，回调参数为 tick、dt、timer_id。" },
        { "api": "engine.timers.every(ticks, fn)", "params": "integer, function", "returns": "timer id", "note": "重复定时器，ticks 为 0 时按 1 处理。" },
        { "api": "engine.timers.cancel(id)", "params": "timer id", "returns": "bool", "note": "取消定时器。" },
        { "api": "engine.timers.clear()", "params": "-", "returns": "-", "note": "[experimental] 清空全部 Lua 定时器；会影响同一 runtime 的其他 MOD。" }
      ]
    },
    {
      "name": "焦点",
      "items": [
        { "api": "engine.focus.register_condition(name, fn)", "params": "string, function", "returns": "bool", "note": "注册焦点条件，回调返回 bool。" },
        { "api": "engine.focus.register_choice_action(name, fn)", "params": "string, function", "returns": "bool", "note": "注册焦点选项动作。" },
        { "api": "engine.focus.subscribe(fn)", "params": "function", "returns": "handler id", "note": "监听焦点触发通知。" },
        { "api": "engine.focus.unsubscribe(id)", "params": "handler id", "returns": "bool", "note": "取消焦点触发监听。" },
        { "api": "engine.focuses.list()", "params": "-", "returns": "table", "note": "列出焦点定义 ID。" },
        { "api": "engine.focuses.active()", "params": "-", "returns": "table", "note": "列出当前活跃的焦点实例和 choices。" },
        { "api": "engine.focuses.choose(instance, choice)", "params": "instance id, string", "returns": "bool", "note": "执行选项动作并触发 focus:chosen。" },
        { "api": "engine.focuses.dismiss(instance)", "params": "instance id", "returns": "bool", "note": "关闭焦点并触发 focus:dismissed。" }
      ]
    },
    {
      "name": "UI 数据桥",
      "items": [
        { "api": "engine.ui.data.snapshot(name)", "params": "string?", "returns": "table", "note": "读取经营快照；RmlUI 通道支持 world_info、resource_snapshot、colonist_list、event_list、tech_tree、view_modes、orders_kinds、build_defs、construction_active、craft_recipes、combat_state；combat_hud.lua 额外包装 battle_hud 通道；Lua 聚合名 colony/resources、colonists、work/orders、research/tech、events/focuses 可用。" },
        { "api": "engine.ui.bottom_bar.register_slot(def)", "params": "table", "returns": "handle", "note": "注册 RmlUI-backed 底栏扩展按钮；支持 id、label、tooltip、priority、active/enabled、on_click。CoreMod 经此注册底部栏入口：commands_menu.lua 注册「指令」(id=core:commands_menu, priority=73，下拉采集/挖矿) 与「战斗」(id=core:combat_entry, priority=94) 两个 slot。" },
        { "api": "engine.ui.command.run(target, payload)", "params": "string, table", "returns": "table", "note": "发出 UI 命令。底部栏「战斗」入口用 target=\"core:combat.toggle_hud\" 切换 battle_hud.rml；战斗 HUD 按钮发 target=\"core:combat.command\"，当前由 combat_hud.lua 返回 combat_system_pending，等待 CombatSystem 命令 API 接通。" },
        { "api": "engine.ui.window.register(def)", "params": "table", "returns": "handle", "note": "注册 RmlUI-backed 兼容窗口；支持 title、position、size_hint、background_argb、draggable、render() 返回 table/tabs_table、buttons 和 on_close。background_argb 默认 0xe815191d；draggable 缺省时跟随 flags 中的 movable。" },
        { "api": "engine.ui.floating.show(def)", "params": "table", "returns": "handle", "note": "显示 RmlUI-backed 浮动提示；支持 title、body、severity。" },
        { "api": "engine.ui.rml.register_panel(def)", "params": "table", "returns": "handle", "note": "注册自定义 RML document；document 是相对 MOD 根目录的字面路径（不走本地化解析）并禁止越界，runtime 通过 lua_ui_rml_panels 通道动态加载/关闭。支持 visible（默认 true）、background_argb、draggable 和 on_close 回调。" },
        { "api": "engine.ui.rml.unregister_panel(handle_or_id)", "params": "handle|string", "returns": "bool", "note": "关闭并卸载对应 RML document；移除前触发 on_close(ctx) 回调。" },
        { "api": "engine.ui.rml.update_panel(handle_or_id, patch)", "params": "handle|string, table", "returns": "bool", "note": "用 patch 表合并更新面板字段（visible、document 路径等）；下一帧快照刷新后生效。" },
        { "api": "engine.ui.rml.show_panel(handle_or_id)", "params": "handle|string", "returns": "bool", "note": "置 visible=true 显示面板；update_panel 的便捷封装。" },
        { "api": "engine.ui.rml.hide_panel(handle_or_id)", "params": "handle|string", "returns": "bool", "note": "置 visible=false 隐藏面板而不卸载。" },
        { "api": "engine.ui.rml.is_registered(handle_or_id)", "params": "handle|string", "returns": "bool", "note": "查询某 RML 面板当前是否已注册。" },
        { "api": "engine.ui.rml.clear(mod_id?)", "params": "string?", "returns": "-", "note": "清空已注册面板；传 mod_id 只清该 MOD，省略则清空全部。" },
        { "api": "engine.ui.rml.reload(mod_id?)", "params": "string?", "returns": "bool", "note": "强制热重载面板文档：递增内部 reload_epoch，runtime 在下一帧 lua_ui_rml_panels 快照中检测到变化即 Close+LoadDocument，即使 .rml 路径未变也会重新读取磁盘内容。传 mod_id 只重载该 MOD，返回是否有面板被标记。" },
        { "api": "engine.ui.data.resources()", "params": "-", "returns": "table", "note": "资源快照，汇总 stockpile 账本和殖民者手持物品，返回 totals 和 rows。" },
        { "api": "engine.ui.data.colonists()", "params": "-", "returns": "table", "note": "殖民者快照，供人员界面派生 colonists_list 与 selected_colonist_view；selected_colonist_view 包含 name/entity/status/Job/job_level/job_xp/role/health/health_max、mood_value、mood_thoughts、基础属性及经验、工作属性、战斗属性(hit_rate/attack_range/attack_frequency)、background、equipment.item、inventory、class_tree。" },
        { "api": "engine.ui.data.work()", "params": "-", "returns": "table", "note": "工作/订单快照，包含工作池实例，以及可建造定义和可制造配方列表。" },
        { "api": "engine.ui.data.research()", "params": "-", "returns": "table", "note": "科技快照，包含当前文明研究状态、科技节点、分类、前置、解锁、已研究/可研究/当前研究状态。" },
        { "api": "engine.ui.data.events()", "params": "-", "returns": "table", "note": "事件/焦点快照，包含 instance_id、severity、详情和可执行 actions。" },
        { "api": "engine.ui.data.battle_hud()", "params": "-", "returns": "table", "note": "战斗 HUD 快照，包含 visible、battle_mode、alert_level、squads、selected_squad、mana、commands；由 combat_hud.lua 基于 combat_state 和后续 CombatSystem 查询聚合。" },
        { "api": "engine.ui.data.channels()", "params": "-", "returns": "table", "note": "返回 Web UI 使用的快照通道名列表。" },
        { "api": "engine.ui.command.run(target, payload)", "params": "string, table?", "returns": "bool|table", "note": "统一 UI 命令入口；支持 core:bottombar.*、core:orders.start、core:colonists.select/change_class/resign_class/sort/filter、core:research.start、core:view.set_mode/toggle_xray、core:events.act/dismiss、core:build.begin、core:craft.queue、core:locale.set，并兼容旧 panel/order/colonist/research/event 短名。" },
        { "api": "engine.ui.command.panel_open(panel)", "params": "string", "returns": "bool", "note": "打开经营面板的快捷命令，内部转发 panel.open。" },
        { "api": "engine.ui.command.panel_close(panel)", "params": "string", "returns": "bool", "note": "关闭经营面板的快捷命令，内部转发 panel.close。" },
        { "api": "ScriptEngine::get_ui_snapshot(channel)", "params": "string", "returns": "JSON string", "note": "C++ RmlUiHost 包装函数：调用 engine.ui.data.snapshot(channel) 并序列化为页面快照 JSON。" },
        { "api": "ScriptEngine::run_ui_command(target, json_payload)", "params": "string, JSON string", "returns": "JSON string", "note": "C++ RmlUiHost 包装函数：把页面 JSON payload 转成 Lua table 后调用 engine.ui.command.run(target, payload)。" }
      ]
    },
    {
      "name": "库存",
      "items": [
        { "api": "engine.inventory.hash(id)", "params": "data id", "returns": "hashed id", "note": "把字符串 ID 转为库存内部 ID。" },
        { "api": "engine.inventory.resolve(item_id)", "params": "hashed id", "returns": "string", "note": "把库存内部 ID 转回数据 ID。" },
        { "api": "engine.inventory.inspect(entity)", "params": "entity id", "returns": "table", "note": "返回 slot、item_id、id、count。" }
      ]
    },
    {
      "name": "NPC 阵营",
      "items": [
        { "api": "engine.factions.list_defs()", "params": "-", "returns": "table", "note": "列出已注册的 NPC 阵营定义 ID。" },
        { "api": "engine.factions.list_pools()", "params": "-", "returns": "table", "note": "列出已注册的名称池 ID。" },
        { "api": "engine.factions.spawn(def_id, seed)", "params": "data id, integer?", "returns": "table", "note": "生成阵营实例并返回 id、display_name、relation、max_relation、min_relation、spawned_tick、map_q、map_r、influence_radius、map_color。" },
        { "api": "engine.factions.spawn_initial(seed)", "params": "integer?", "returns": "table", "note": "按 faction_spawn_rules 规则批量生成 AI 阵营实例（开新世界时由引擎自动调用一次）；缺省 seed 时从世界 seed 派生。" },
        { "api": "engine.factions.list_spawn_rules()", "params": "-", "returns": "table", "note": "列出已注册的 faction_spawn_rules 规则；每条含 faction_def_id、min_count、max_count。" },
        { "api": "engine.factions.get_instance(id)", "params": "string", "returns": "table 或 nil", "note": "读取已生成阵营实例；包含外交地图字段 map_q、map_r、influence_radius、map_color。" },
        { "api": "engine.factions.list_instances()", "params": "-", "returns": "table", "note": "列出当前已生成的阵营实例；每项包含外交地图字段。" },
        { "api": "engine.factions.modify_relation(id, delta)", "params": "string, integer", "returns": "integer", "note": "调整关系值并返回调整后的关系；结果会按阵营定义限制范围。" },
        { "api": "engine.factions.generate_name(template, pools, seed)", "params": "string, table?, integer?", "returns": "string", "note": "按 ${random_name} 模板和可选名称池生成确定性名称。" },
        { "api": "engine.factions.get_relation_between(first, second)", "params": "string, string", "returns": "integer", "note": "读取两个 NPC 阵营实例之间的双边关系。" },
        { "api": "engine.factions.modify_relation_between(first, second, delta, tick)", "params": "string, string, integer, integer?", "returns": "integer", "note": "调整两个 NPC 阵营实例之间的双边关系；tick 缺省为当前 tick。" },
        { "api": "engine.factions.random_different_inclination_event(delta, tick, salt)", "params": "integer, integer, integer?", "returns": "table", "note": "按世界 seed 和 tick 选择倾向不同的一对阵营并计算关系事件。" },
        { "api": "engine.factions.pair_relations()", "params": "-", "returns": "table", "note": "列出当前所有阵营对关系及 last_changed_tick。" },
        { "api": "engine.factions.diplomacy_actions()", "params": "-", "returns": "table", "note": "列出已注册的外交行动定义：id、relation_threshold、relation_cost、action_type。" },
        { "api": "engine.factions.can_perform(instance_id, action_id)", "params": "string, string", "returns": "bool", "note": "检查指定阵营实例是否可以执行某外交行动。" },
        { "api": "engine.factions.perform_action(instance_id, action_id)", "params": "string, string", "returns": "bool", "note": "执行外交行动；失败时返回 false。" },
        { "api": "engine.world_map.diplomacy_snapshot()", "params": "-", "returns": "table", "note": "返回战略地图快照：has_map、planet_radius、water_coverage、sea_level、tiles(q/r/x/y/water/biome_id/map_color/elevation/temperature/moisture) 和 factions(id/display_name/relation/inclination/map_q/map_r/x/y/influence_radius/map_color)，供外交地图 UI 叠加势力。" },
        { "api": "事件：faction:spawned", "params": "-", "returns": "payload", "note": "阵营实例加入世界时发布；payload 含 instance_id、def_id、display_name、relation、inclination、reason 等；reason 区分 initial/console/script/spawned。" }
      ]
    },
    {
      "name": "网络",
      "items": [
        { "api": "engine.network.send_move(entity, x, y, z)", "params": "entity, number, number, number", "returns": "-", "note": "发送移动命令到网络层。" },
        { "api": "engine.network.send_build(x, y, z, block_id)", "params": "integer, integer, integer, hashed id", "returns": "-", "note": "[experimental] 发送建造方块命令；block_id 是 32 位方块数据 ID 哈希。" },
        { "api": "engine.network.send_mine(x, y, z)", "params": "integer, integer, integer", "returns": "-", "note": "[experimental] 发送挖掘方块命令。" },
        { "api": "engine.network.send_job(entity, Job, level)", "params": "entity, data id, integer?", "returns": "-", "note": "发送分配职业命令。" },
        { "api": "engine.network.send_give(entity, item, count)", "params": "entity, data id, integer", "returns": "-", "note": "发送给予物品命令。" },
        { "api": "engine.network.set_command_handler(fn)", "params": "function", "returns": "-", "note": "设置收到网络命令后的 Lua 回调；回调表包含 type、type_name、sequence 和命令字段。" },
        { "api": "engine.network.is_connected()", "params": "-", "returns": "bool", "note": "网络层是否已初始化。" },
        { "api": "engine.network.mode()", "params": "-", "returns": "string", "note": "返回当前网络模式名称。" }
      ]
    },
    {
      "name": "地形",
      "items": [
        { "api": "engine.terrain.height_at(x, z, cfg)", "params": "integer, integer, table?", "returns": "integer", "note": "查询地形高度（世界级 fbm，居中输出，已含 ridge 山脉抬升）。可传配置表覆盖 base_height/noise/amplitude/mountain 参数。" },
        { "api": "engine.terrain.standable_y_at(x, z)", "params": "integer, integer", "returns": "integer", "note": "查询实体脚部可站立的实际 Y，基于已生成/可生成区块数据。" },
        { "api": "engine.terrain.register_biome(table)", "params": "table", "returns": "-", "note": "注册群系；可设置正整数 weight 控制选择占比，默认 1。" },
        { "api": "engine.terrain.list_biomes()", "params": "-", "returns": "table", "note": "列出群系 ID。" },
        { "api": "engine.terrain.register_ore(table)", "params": "table", "returns": "-", "note": "注册矿物分布：block、replace_block、noise_scale、threshold、min_y、max_y。推荐使用 data/ores/。" },
        { "api": "engine.terrain.register_feature(table)", "params": "table", "returns": "-", "note": "注册地表地物，字段见地物注册页面。" },
        { "api": "engine.terrain.list_features()", "params": "-", "returns": "table", "note": "列出已注册地物 ID。" },
        { "api": "engine.terrain.find_feature(id)", "params": "string", "returns": "table", "note": "返回地物定义；找不到时返回空表。" },
        { "api": "engine.terrain.select_biome(seed, cx, cz)", "params": "integer, integer, integer", "returns": "table", "note": "返回兼容查询用的群系描述；当前世界 seed 查询该 chunk 中心 column 的实际气候群系，其它 seed 走旧的 seed/cx/cz 加权随机选择。实际地形生成按 column 级气候选择群系。" }
      ]
    },
    {
      "name": "本地化",
      "items": [
        { "api": "engine.locale.set_locale(id)", "params": "string", "returns": "-", "note": "切换当前语言；ID 使用已加载语言文件名，例如 zh-cn。" },
        { "api": "engine.locale.get_locale()", "params": "-", "returns": "string", "note": "当前语言 ID。" },
        { "api": "engine.locale.get(category, key)", "params": "string, string", "returns": "string", "note": "按分类和 key 获取翻译文本。" },
        { "api": "engine.locale.t(key)", "params": "string", "returns": "string", "note": "翻译完整 key。" },
        { "api": "engine.locale.list_locales()", "params": "-", "returns": "table", "note": "列出所有可用语言。" },
        { "api": "engine.locale.reload()", "params": "-", "returns": "-", "note": "重新加载本体语言目录、CoreMod 语言目录和已合并的 MOD 语言目录。" },
        { "api": "engine.locale.load_locale(id, path)", "params": "string, string", "returns": "bool", "note": "[experimental] 从文件加载语言包；路径限制在 MOD 或 generated 内容目录。" },
        { "api": "engine.locale.translate(key)", "params": "string", "returns": "string", "note": "当前 LocalizationManager 绑定的完整 key 翻译接口。" },
        { "api": "engine.locale.translate_cat(category, key)", "params": "string, string", "returns": "string", "note": "当前 LocalizationManager 绑定的分类翻译接口。" },
        { "api": "engine.locale.resolve(text)", "params": "string", "returns": "string", "note": "解析可包含本地化引用的文本。" },
        { "api": "engine.locale.resolve_template(text)", "params": "string", "returns": "string", "note": "把字符串中所有 ${category.key} 占位符替换为对应翻译，其余字符原样保留。用于区域默认名等需要随界面语言变动的持久化文本。" },
        { "api": "engine.locale.current_locale()", "params": "-", "returns": "string", "note": "当前语言 ID。" }
      ]
    },
    {
      "name": "装备",
      "items": [
        { "api": "engine.equipment.equip(entity, slot, item_hash, count)", "params": "entity, \"Equipment\", hashed id, integer", "returns": "bool", "note": "将物品装备到唯一 Equipment 槽。" },
        { "api": "engine.equipment.unequip(entity, slot)", "params": "entity, string", "returns": "table", "note": "从栏位卸下物品，返回 item_id 和 count；无效槽位返回 0。" },
        { "api": "engine.equipment.get_equipment(entity)", "params": "entity id", "returns": "table", "note": "返回唯一 Equipment 槽的 item_id 和 count。" },
        { "api": "engine.equipment.get_slot(entity, slot)", "params": "entity, \"Equipment\"", "returns": "table", "note": "返回唯一 Equipment 槽的 item_id 和 count。" }
      ]
    },
    {
      "name": "世界方块",
      "items": [
        { "api": "engine.world.remove_block(x, y, z)", "params": "integer, integer, integer", "returns": "bool", "note": "[experimental] 移除指定坐标的方块；y 越界时返回 false。内容流程优先走挖掘/建造订单。" },
        { "api": "engine.world.place_block(x, y, z, block_id)", "params": "integer, integer, integer, string", "returns": "bool", "note": "[experimental] 在指定坐标放置方块；y 越界或 ID 为空时返回 false。内容流程优先走建造订单。" },
        { "api": "engine.world.get_block(x, y, z)", "params": "integer, integer, integer", "returns": "table", "note": "查询方块，返回 exists、id、hash 和 block_id。" },
        { "api": "engine.world.get_block_data(x, y, z)", "params": "integer, integer, integer", "returns": "integer", "note": "读取方块附加数据；不可用或 y 越界时返回 0。" },
        { "api": "engine.world.set_block_data(x, y, z, data)", "params": "integer, integer, integer, integer", "returns": "bool", "note": "[experimental] 写入方块附加数据；不可用或 y 越界时返回 false。" }
      ]
    },
    {
      "name": "工具",
      "items": [
        { "api": "engine.util.data_id_hash(id)", "params": "data id", "returns": "hashed id", "note": "计算 data ID 的 FNV-1a 哈希值，用于 inventory/equipment 交互。" }
      ]
    }
  ]
};
