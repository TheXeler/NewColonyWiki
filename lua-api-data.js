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
      "stable": "文档化、由 CoreMod 或宿主 UI/系统路径依赖；engine.api_version 与 engine.version.api 是稳定版本入口。",
      "experimental": "暴露低级引擎状态、开发编辑器能力、注册型扩展点、网络命令或运行时世界修改入口；可用但后续可能收窄参数和权限。"
    },
    "risk_candidates": [
      "殖民者需求、治疗结果、待登记移除和患者搬运只通过带工作或候选上下文校验的领域接口提交。",
      "engine.world.place_block/remove_block/set_block_data 只允许 Host/单机写入；玩法请求统一走 Host 处理的 UiCommand，不提供旧的直接网络写入口。",
      "engine.events.clear 与 engine.timers.clear 是全局清理入口，会影响同一 Lua runtime 中其他 MOD 的订阅和定时器。",
      "engine.locale.reload/load_locale 是开发向能力，不适合作为普通内容 MOD 的核心运行时依赖。"
    ]
  },
  "groups": [
    {
      "name": "版本与日志",
      "items": [
        { "api": "engine.api_version", "params": "属性", "returns": "string", "note": "[stable] 当前公共 MOD API 版本；推荐新脚本使用。" },
        { "api": "engine.version.api", "params": "属性", "returns": "string", "note": "[stable] 当前公共 MOD API 版本；与 engine.api_version 等价。" },
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
        { "api": "engine.time.day_ticks_per_sim_tick", "params": "属性", "returns": "integer", "note": "每个模拟 tick 推进 3 个游戏秒；20 TPS 下现实 1 秒对应游戏 1 分钟。" },
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
        { "api": "engine.ecs.is_alive(entity)", "params": "entity id", "returns": "bool", "note": "实体是否还存在。" },
        { "api": "engine.ecs.entity_count()", "params": "-", "returns": "number", "note": "当前实体总数。" },
        { "api": "engine.ecs.has_component(entity, name)", "params": "entity id, string", "returns": "bool", "note": "组件名用小写，如 position、health。" },
        { "api": "engine.ecology.spawn_animal_at(rule_id, x, y, z)", "params": "animal_distributions id, number, number, number", "returns": "entity id 或 0", "note": "Host 生态结算专用：从已注册动物分布规则解析 animal 原型并在指定位置原子生成；不是通用实体创建入口。" },
        { "api": "engine.ecs.get_position(entity)", "params": "entity id", "returns": "table", "note": "返回 { x, y, z }，没有组件时返回空表。" },
        { "api": "engine.ecs.get_velocity(entity)", "params": "entity id", "returns": "table", "note": "返回 { x, y, z }。" },
        { "api": "engine.ecs.get_speed(entity)", "params": "entity id", "returns": "table", "note": "get_velocity() 的同义接口，返回 { x, y, z }。" },
        { "api": "engine.ecs.move_to(entity, x, y, z)", "params": "number, number, number", "returns": "bool", "note": "仅允许招募系统驱动带 active PendingRegistration 的待登记新人；普通殖民者不能由经营 MOD 直接指定移动。" },
        { "api": "engine.ecs.has_path(entity)", "params": "entity id", "returns": "bool", "note": "实体当前是否有导航路径。" },
        { "api": "engine.ecs.set_rotation(entity, yaw, pitch)", "params": "number, number", "returns": "-", "note": "设置 Rotation 组件。" },
        { "api": "engine.ecs.get_rotation(entity)", "params": "entity id", "returns": "table", "note": "返回 { yaw, pitch }。" },
        { "api": "engine.ecs.set_scale(entity, x, y, z)", "params": "number, number, number", "returns": "-", "note": "设置 Scale 组件。" },
        { "api": "engine.ecs.get_scale(entity)", "params": "entity id", "returns": "table", "note": "返回 { x, y, z }。" },
        { "api": "engine.ecs.get_health(entity)", "params": "entity id", "returns": "table", "note": "返回 { current, max }。" },
        { "api": "engine.ecs.get_needs(entity)", "params": "entity id", "returns": "table", "note": "返回 { hunger, fatigue }。" },
        { "api": "engine.ecs.get_mood(entity)", "params": "entity id", "returns": "table", "note": "返回 mood_value、broken_down、breakdown_timer、thought_count。" },
        { "api": "engine.ecs.get_name(entity)", "params": "entity id", "returns": "string", "note": "没有 Name 时返回 nil。" },
        { "api": "engine.ecs.has_colonist_tag(entity)", "params": "entity id", "returns": "bool", "note": "检查实体是否有殖民者标记。" },
        { "api": "engine.ecs.get_ai_state(entity)", "params": "entity id", "returns": "table", "note": "返回 behavior_tree_id、current_node、lod_level。" },
        { "api": "engine.ecs.get_job(entity)", "params": "entity id", "returns": "table", "note": "返回哈希后的 job_id 和 level。" },
        { "api": "engine.ecs.get_block_interactor(entity)", "params": "entity id", "returns": "table", "note": "返回 x、y、z、action_type，没有组件时返回空表。" },
        { "api": "engine.ecs.get_prototype_ref(entity)", "params": "entity id", "returns": "string", "note": "读取 PrototypeRef；没有组件时返回空字符串。" },
        { "api": "engine.ecs.query_all_entities()", "params": "-", "returns": "table", "note": "返回所有实体 ID。" },
        { "api": "engine.ecs.get_all_entities()", "params": "-", "returns": "table", "note": "query_all_entities() 的同义接口。" },
        { "api": "engine.ecs.get_entity_type(entity)", "params": "entity id", "returns": "string 或 nil", "note": "按组件粗略返回 colonist、item、worker 或 entity；实体不存在时返回 nil。" },
        { "api": "engine.ecs.query_colonists()", "params": "-", "returns": "table", "note": "返回有 Position 和 ColonistTag 的实体条目。" },
        { "api": "engine.ecs.query_with_position()", "params": "-", "returns": "table", "note": "返回有 Position 组件的实体条目。" },
        { "api": "engine.ecs.query_with_health()", "params": "-", "returns": "table", "note": "返回有 Health 组件的实体条目。" },
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
        { "api": "engine.json.decode(text)", "params": "JSON string", "returns": "Lua value or nil", "note": "基础 API；在 MOD on_load 前可用。解析无效或空 JSON 时返回 nil。" },
        { "api": "engine.modding.resolve_block_id(hash)", "params": "hashed id", "returns": "string", "note": "把方块哈希解析为数据 ID；未找到时返回空字符串。" },
        { "api": "engine.modding.list_by_type(type)", "params": "blocks/combat 等", "returns": "table", "note": "列出指定数据类型的全部 ID；CoreMod 的 combat 内容当前为空。" },
        { "api": "engine.modding.get_block_info(hash)", "params": "integer", "returns": "table", "note": "返回 id/hash/exists、material、category、food_value、has_item_block、mineable/choppable/selectable、hardness 和统一产出表配置状态。" },
        { "api": "engine.modding.get_crop_info(crop_id)", "params": "data id", "returns": "table 或 nil", "note": "读取作物注册信息，包含 farmland、growth_stages、growth_ticks、crop_block 和 outputs。" },
        { "api": "engine.modding.get_setting(mod, key, fallback)", "params": "string, string, any", "returns": "any", "note": "读取配置，结合清单默认值和用户覆盖后的最终值。" }
      ]
    },
    {
      "name": "Tag（分类接口）",
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
        { "api": "engine.crafting.list_recipes()", "params": "-", "returns": "table", "note": "列出已加载的配方 ID。" },
        { "api": "engine.crafting.get_recipe(recipe)", "params": "data id", "returns": "table 或 nil", "note": "返回 id、inputs、output、Job/job_level、manufacturing_mode、work_amount、processing_difficulty 和 output_table。" },
        { "api": "engine.research.get_tech(tech_id)", "params": "data id", "returns": "table 或 nil", "note": "返回科技定义，含 opening_materials、required_workstations、required_job 和 required_job_level。" },
        { "api": "engine.research.state(index?)", "params": "integer?", "returns": "table", "note": "返回文明研究状态，含 current_research、research_progress、research_paused 和 researched。" },
        { "api": "engine.research.pause(index?) / resume(index?)", "params": "integer?", "returns": "bool", "note": "暂停或恢复文明当前研究；engine.techs 是同一表的别名。" },
        { "api": "engine.colonists.memorials()", "params": "-", "returns": "table", "note": "返回死亡殖民者纪念记录：entity_id、name、job_id/level、death_tick 和位置；该数据进入 world.json。" },
        { "api": "systems.resources.summary()", "params": "-", "returns": "table", "note": "CoreMod 资源汇总入口；当前返回 stockpile 快照，供主界面、科技、制造和建造聚合读取。" },
        { "api": "systems.resources.stockpile_snapshot()", "params": "-", "returns": "table", "note": "返回 stockpile 账本数组：{ item_hash, item_id, count }。" },
        { "api": "systems.resources.preview(requirements)", "params": "table", "returns": "table", "note": "按需求数组返回 { item_hash, item_id, required, available, missing }。" },
        { "api": "systems.crafting.queue(entity, recipe, faction, x, y, z, duration, force_storage)", "params": "entity, data id, hashed id, position, number?, bool?", "returns": "table", "note": "CoreMod 制作执行器。通过 engine.work reservation ledger 预留 stockpile 输入并发布 Craft 工作；完成时提交预留，取消时释放。" },
        { "api": "systems.production.queue(worker, recipe, faction, count, priority, designated_worker, duration, maintain)", "params": "entity, data id, hashed id, integer, integer, entity?, number?, bool?", "returns": "table", "note": "创建生产订单；支持目标次数或维持库存、优先级和指定工人。另有 pause/resume/cancel/snapshot。" },
        { "api": "systems.food.create_plan/copy_plan/rename_plan/assign_plan/set_min_nutrition/set_category", "params": "plan/entity/category", "returns": "bool", "note": "CoreMod 饮食计划 API；snapshot_plans 返回计划。进食从 stockpile 选择 category=food 且达到最低 food_value 的物品。" },
        { "api": "systems.treatment.create_template/copy_template/rename_template/set_template_*", "params": "template/injury/resource", "returns": "bool", "note": "CoreMod 治疗模板 API；食物、药品和医疗包按 injury 分别保存。queue 发布 Treat 工作并占用治疗点，snapshot/snapshot_templates 返回运行态。" },
        { "api": "engine.buildings.list_definitions()", "params": "-", "returns": "table", "note": "列出已加载的建筑定义 ID。" },
        { "api": "engine.buildings.has_completed(def_id)", "params": "data id", "returns": "bool", "note": "是否存在该定义的已完成建筑。" },
        { "api": "engine.buildings.nearest_treatment_point(x,y,z) / treatment_status(instance_id)", "params": "position / integer", "returns": "table", "note": "查询最近治疗点，或读取 capacity、reserved、occupied、exists 和 usable。" },
        { "api": "engine.buildings.reserve_treatment/release_treatment/occupy_treatment/vacate_treatment(instance_id)", "params": "integer", "returns": "bool", "note": "管理建筑实例的治疗预留和占用计数。" },
        { "api": "engine.buildings.validate_placement(def_id, x, y, z)", "params": "data id, integer, integer, integer", "returns": "table", "note": "检查建筑蓝图能否放置到指定原点，返回 ok、reason 和冲突坐标。" },
        { "api": "engine.buildings.create_planned(def_id, x, y, z)", "params": "data id, integer, integer, integer", "returns": "table", "note": "位置通过建筑碰撞校验后创建 Planned 实例并返回状态。" },
        { "api": "engine.buildings.find(instance_id)", "params": "integer", "returns": "table 或 nil", "note": "读取建筑实例状态，返回 instance_id、definition_hash、state、x、y、z 和 progress。" },
        { "api": "engine.buildings.find_definition(id)", "params": "data id", "returns": "table 或 nil", "note": "读取建筑定义，包含 size、materials、construction_ticks 和 blueprint。" },
        { "api": "engine.buildings.complete_construction(work_id, instance_id)", "params": "integer, integer", "returns": "bool", "note": "仅在匹配该建筑 payload 的 Build 工作完成派发期间提交完成。" },
        { "api": "engine.buildings.set_construction_state(instance_id, state)", "params": "integer, integer", "returns": "bool", "note": "只允许未完成建筑在 Planned 与 Constructing 之间转换。" },
        { "api": "engine.buildings.place_blueprint_block(work_id, instance_id, x, y, z, block_id)", "params": "work/building/position/data id", "returns": "bool", "note": "仅在匹配 Build 完成上下文中放置该定义明确声明的蓝图格。" },
        { "api": "engine.buildings.set_preview(def_id, x, y, z, valid)", "params": "data id, integer, integer, integer, bool", "returns": "bool", "note": "在 HUD 上显示建筑放置预览线框。" },
        { "api": "engine.buildings.clear_preview()", "params": "-", "returns": "-", "note": "清除建筑放置预览。" },
        { "api": "engine.buildings.begin_placement(def_id)", "params": "data id", "returns": "bool", "note": "开始交互式建筑放置模式。" },
        { "api": "engine.buildings.end_placement()", "params": "-", "returns": "-", "note": "结束交互式建筑放置模式。" },
        { "api": "engine.buildings.placement_active()", "params": "-", "returns": "bool", "note": "当前是否处于建筑放置模式。" },
        { "api": "engine.buildings.placement_state()", "params": "-", "returns": "table", "note": "返回放置状态：active、def_id、x、y、z、valid。" },
        { "api": "systems.construction.preview_materials(def_id)", "params": "data id", "returns": "table", "note": "返回施工材料预检查：{ ok, reason, materials, missing }。" },
        { "api": "systems.construction.order(def_id, x, y, z)", "params": "data id, integer, integer, integer", "returns": "table", "note": "定义和位置有效时创建施工订单；材料足够返回 { ok=true, status=\"constructing\", info, reserved_materials }，缺料仍排队并返回 { ok=true, status=\"waiting_materials\", materials, missing }。" },
        { "api": "systems.construction.active()", "params": "-", "returns": "table", "note": "返回当前 CoreMod 施工记录，含 instance_id、def_id、status、position、materials、missing 和 reserved_materials，供调试或经营聚合读取。" },
        { "api": "engine.selection.hovered_block()", "params": "-", "returns": "table", "note": "读取当前鼠标悬停方块，包含 active、x/y/z、face 和 adjacent_x/y/z。" },
        { "api": "engine.selection.selected_block()", "params": "-", "returns": "table", "note": "读取当前已确认选择的方块。普通模式下左键会确认选择。" },
        { "api": "engine.jobs.list()", "params": "-", "returns": "table", "note": "列出已加载的职业 ID。" },
        { "api": "engine.jobs.defs() / tree()", "params": "-", "returns": "table", "note": "返回职业定义或转职树节点；每个节点包含 category，combat 表示战斗职业。" },
        { "api": "engine.jobs.can_assign(entity, Job)", "params": "entity, data id", "returns": "bool", "note": "检查实体是否满足转职条件。" },
        { "api": "engine.jobs.aggregate_attributes(entity)", "params": "entity id", "returns": "table", "note": "返回按初始值统一汇总职业、状态和药剂修饰后的最终属性。" },
        { "api": "engine.jobs.xp_required_for_level(level)", "params": "integer", "returns": "number", "note": "读取 career_progression_rules 对应等级需求；配置缺失或没有后续等级时返回 0。" },
        { "api": "engine.jobs.progression_configuration()", "params": "-", "returns": "table", "note": "返回职业经验规则 valid/error、成功工作基础经验和四段升级需求。" },
        { "api": "require(\"systems.combat_data\").weapon_counters()", "params": "-", "returns": "table", "note": "接口未定，返回空规则表。" },
        { "api": "require(\"systems.combat_data\").suppression_rules()", "params": "-", "returns": "table", "note": "接口未定，返回空规则表。" },
        { "api": "CombatSystem::list_squads(world)", "params": "C++", "returns": "SquadView[]", "note": "兼容状态查询入口；运行时不推进小队战斗玩法。" }
      ]
    },
    {
      "name": "工作池",
      "items": [
        { "api": "engine.work.post(type, faction_id, x, y, z, duration, payload_id, target_entity)", "params": "string, hashed id, number, number, number, number?, integer?, entity?", "returns": "work id", "note": "发布通用脚本工作；Mine/Chop 只能由指定工具经 Host 创建，Research 只能由已付款项目派生。faction_id 必填且不能为 0。" },
        { "api": "engine.work.cancel(id)", "params": "work id", "returns": "-", "note": "取消工作。" },
        { "api": "engine.work.interrupt_all(worker)", "params": "entity", "returns": "integer", "note": "解除该工人已领取的工作并返回数量，产生 work:interrupted。" },
		{ "api": "engine.work.set_locked(id, locked)", "params": "work id, bool", "returns": "bool", "note": "复用 blocked_until_tick 的永久阻塞哨兵锁定或立即解锁工作；锁定任务继续存在但不可领取。" },
        { "api": "engine.work.set_metadata(id, source_id, priority, designated_worker?)", "params": "work id, integer, 0-9, entity?", "returns": "bool", "note": "写订单来源、优先级和指定工人；0 是特殊优先级，1-9 是普通优先级。" },
        { "api": "engine.work.set_qualification(id, job_id, job_level)", "params": "work id, hashed id, integer", "returns": "bool", "note": "限制领取工作所需的职业和最低等级。" },
        { "api": "engine.work.set_available/available/reserved/reserve/commit_reservation/release_reservation", "params": "item hash、数量、reservation id", "returns": "mixed", "note": "共享资源 reservation ledger；CoreMod stockpile、crafting 和生产订单使用。" },
        { "api": "engine.work.cancel_matching(work_tag, faction_id?, payload_id?)", "params": "string, hashed id?, integer?", "returns": "integer", "note": "按工作标签、阵营和可选 payload_id 批量取消工作，返回取消数量。指令菜单按 mine/chop 标签中断已发布的采集/挖矿工作；正在执行的 AI 会在下一次检查工作有效性时退出当前工作。" },
        { "api": "engine.work.is_valid(id)", "params": "work id", "returns": "bool", "note": "检查工作是否仍在工作池中。" },
        { "api": "engine.work.total()", "params": "-", "returns": "integer", "note": "返回工作池中活跃工作数量。" },
		{ "api": "engine.work.list()", "params": "-", "returns": "table", "note": "当前工作实例；除目标、进度外还含 source_id、priority、designated_worker、reservation_id、blocked_until_tick、locked、qualification_expression 和 step_index。" },
		{ "api": "engine.work.set_qualification_expression()", "params": "work_id, expression", "returns": "bool", "note": "保存由 #职业ID_RANK_LEVEL、AND、OR 和括号组成的权威资格表达式。" }
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
		{ "api": "faction:spawned（事件）", "params": "-", "returns": "payload", "note": "字段：instance_id、def_id、faction_hash、display_name、relation、spawned_tick、reason。仅供未来有文档依据的专项规则显式加入阵营实例时发布；CoreMod 当前不产生该事件。" },
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
        { "api": "engine.ui.bottom_bar.register_slot(def)", "params": "table", "returns": "handle", "note": "注册 RmlUI-backed 底栏扩展按钮；支持 id、label、tooltip、priority、active/enabled、on_click。CoreMod 注册伐木、采掘、区域、指令、制造、仓储、科技、招募、策略和日志入口；区域打开持续区域二级菜单，当前实现阶段另有临时人员入口，运行中不显示难度入口。" },
        { "api": "engine.ui.command.run(target, payload)", "params": "string, table", "returns": "table", "note": "发出 UI 命令。Lua UI 动作分开报告 callback_missing（动作已过期或未注册）与 callback_failed（已注册回调执行报错）。当前没有战斗玩法命令；战斗 HUD 不注册独立经营底栏入口。" },
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
        { "api": "engine.ui.data.colonists()", "params": "-", "returns": "table", "note": "殖民者快照，供人员界面派生 colonists_list 与 selected_colonist_view；selected_colonist_view 包含 name/entity/status/Job/job_level/job_xp/role/health/health_max、mood_value、mood_thoughts、文档基础/工作/战斗属性、background、equipment.item、inventory、class_tree。" },
        { "api": "engine.ui.data.work()", "params": "-", "returns": "table", "note": "工作/订单快照，包含工作池实例，以及可建造定义和可制造配方列表。" },
        { "api": "engine.ui.data.research()", "params": "-", "returns": "table", "note": "科技快照，包含当前文明研究状态、科技节点、分类、前置、解锁、已研究/可研究/当前研究状态。" },
        { "api": "engine.ui.data.events()", "params": "-", "returns": "table", "note": "事件/焦点快照，包含 instance_id、severity、详情和可执行 actions。" },
        { "api": "engine.ui.data.battle_hud()", "params": "-", "returns": "table", "note": "接口未定快照，只包含 visible、interface_defined=false、status=combat_interface_undefined 和空 commands。" },
        { "api": "engine.ui.data.channels()", "params": "-", "returns": "table", "note": "返回 Web UI 使用的快照通道名列表。" },
        { "api": "engine.ui.command.run(target, payload)", "params": "string, table?", "returns": "bool|table", "note": "统一 UI 命令入口；已定义的玩法写入经 Host UiCommand，包括生产、研究、治疗、招募、仓储、区域、地面回收与焦点。外交操作尚未定义，不在命令白名单中。" },
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
        { "api": "engine.factions.list_spawn_rules()", "params": "-", "returns": "table", "note": "读取 faction_spawn_rules schema；CoreMod 当前为空，引擎不会据此自动生成实例。" },
        { "api": "engine.factions.get_instance(id)", "params": "string", "returns": "table 或 nil", "note": "读取已由外部专项规则显式加入的阵营实例及地图状态。" },
        { "api": "engine.factions.list_instances()", "params": "-", "returns": "table", "note": "列出当前阵营实例；CoreMod 不随机生成实例。" },
        { "api": "engine.factions.generate_name(template, pools, seed)", "params": "string, table?, integer?", "returns": "string", "note": "按 ${random_name} 模板和可选名称池生成确定性名称。" },
        { "api": "engine.factions.get_relation_between(first, second)", "params": "string, string", "returns": "integer", "note": "读取两个 NPC 阵营实例之间的双边关系。" },
        { "api": "engine.factions.pair_relations()", "params": "-", "returns": "table", "note": "列出当前所有阵营对关系及 last_changed_tick。" },
        { "api": "engine.factions.proposal_defs()", "params": "-", "returns": "table", "note": "读取外交提案 schema；CoreMod 当前为空。" },
        { "api": "engine.factions.list_negotiations()", "params": "-", "returns": "table", "note": "只读谈判状态；当前没有玩法写入口。" },
        { "api": "engine.factions.evaluate_proposal(target, proposal, offered_score)", "params": "string, string, integer?", "returns": "table", "note": "只读评估接口；无已注册提案时返回配置拒绝，不执行或修改状态。" },
        { "api": "engine.factions.diplomatic_status(target)", "params": "string", "returns": "string", "note": "读取玩家与目标实例的外交状态。" },
        { "api": "engine.factions.has_treaty(target, treaty)", "params": "string, string", "returns": "bool", "note": "只读查询玩家与目标实例是否存在指定条约。" },
        { "api": "engine.world_map.diplomacy_snapshot()", "params": "-", "returns": "table", "note": "返回战略地图快照：has_map、planet_radius、water_coverage、sea_level、tiles(q/r/x/y/water/biome_id/map_color/elevation/temperature/moisture) 和 factions(id/display_name/relation/map_q/map_r/x/y/map_color)，供外交地图 UI 叠加已有地点。" },
        { "api": "事件：faction:spawned", "params": "-", "returns": "payload", "note": "保留给未来专项规则显式加入阵营实例时发布；CoreMod 当前不产生。" }
      ]
    },
    {
      "name": "网络",
      "items": [
        { "api": "engine.network.send_ui(target, payload)", "params": "string, table", "returns": "table", "note": "提交 Host 权威 UiCommand，返回 submitted/pending 状态；普通 MOD 优先使用 engine.ui.command.run。" },
        { "api": "engine.network.is_handling_command()", "params": "-", "returns": "bool", "note": "当前是否正在 Host 的已接收命令处理上下文中；供命令桥避免递归提交。" },
        { "api": "engine.network.set_command_handler(fn)", "params": "function", "returns": "-", "note": "设置收到网络命令后的 Lua 回调；回调表包含 type、type_name、sequence 和命令字段。" },
        { "api": "engine.network.is_connected()", "params": "-", "returns": "bool", "note": "网络层是否已初始化。" },
        { "api": "engine.network.mode()", "params": "-", "returns": "string", "note": "返回当前网络模式名称。" }
      ]
    },
    {
      "name": "地形",
      "items": [
        { "api": "engine.terrain.height_at(x, z, cfg)", "params": "integer, integer, table?", "returns": "integer", "note": "查询地形高度（世界级 fbm，居中输出，已含 ridge 山脉抬升）。可传配置表覆盖 base_height/noise/amplitude/mountain 参数。" },
        { "api": "engine.terrain.standable_y_at(x, z)", "params": "integer, integer", "returns": "integer|nil", "note": "查询实体脚部可站立的实际 Y；已加载但没有任何实体表面的空列返回 nil，不会回退并复活程序地形。" },
        { "api": "engine.terrain.list_biomes()", "params": "-", "returns": "table", "note": "列出群系 ID。" },
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
        { "api": "engine.equipment.get_equipment(entity)", "params": "entity id", "returns": "table", "note": "返回唯一 Equipment 槽的 item_id 和 count。" },
        { "api": "engine.equipment.get_slot(entity, slot)", "params": "entity, \"Equipment\"", "returns": "table", "note": "返回唯一 Equipment 槽的 item_id 和 count。" }
      ]
    },
    {
      "name": "世界方块",
      "items": [
        { "api": "engine.world.remove_block(x, y, z)", "params": "integer, integer, integer", "returns": "bool", "note": "[experimental] 移除指定坐标的方块；Y 使用有符号可变高度区块列。内容流程优先走采掘/建造订单。" },
        { "api": "engine.world.place_block(x, y, z, block_id)", "params": "integer, integer, integer, string", "returns": "bool", "note": "[experimental] 在指定坐标放置方块；ID 为空时返回 false，Y 使用有符号可变高度区块列。内容流程优先走建造订单。" },
        { "api": "engine.world.get_block(x, y, z)", "params": "integer, integer, integer", "returns": "table", "note": "查询方块，返回 exists、id、hash 和 block_id。" },
        { "api": "engine.world.get_block_data(x, y, z)", "params": "integer, integer, integer", "returns": "integer", "note": "读取有符号任意 Y 坐标的方块附加数据；接口不可用时返回 0。" },
        { "api": "engine.world.set_block_data(x, y, z, data)", "params": "integer, integer, integer, integer", "returns": "bool", "note": "[experimental] 写入有符号任意 Y 坐标的方块附加数据；接口不可用时返回 false。" }
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
