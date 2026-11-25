// 控制台命令速查数据：按 Engine/EngineConsoleCommands.cpp 的注册结果整理。
window.__CONSOLE_COMMANDS_DATA = {
  "_meta": {
    "title": "控制台命令速查",
    "description": "按当前引擎命令注册表整理的命令表：命令、用法、默认权限、执行侧与说明。",
    "source_audit": [
      "Engine/EngineConsoleCommands.cpp",
      "Engine/ConsoleCommandRegistry.hpp",
      "CoreMod/config/console_permissions.json",
      "CoreMod/config/console_aliases.json"
    ],
    "risk_candidates": [
      "没有显式权限条目的命令回退到 developer，所以标记为 developer（默认）的命令在普通模式服务端需要显式放宽权限。",
      "别名先展开，再检查目标命令权限；config/console_aliases.json 里的同名别名会覆盖内置别名。",
      "= 前缀简写与别名一样先展开再检查权限，因此不会绕过 lua 的权限要求。",
      "luafile 与 luacfile 只执行已安装 MOD 的 scripts 目录下的 .lua 文件：绝对路径、盘符与 NTFS 流冒号、纯点号段（. / .. / ...）、以及解析后落在 scripts 目录之外的符号链接都会被拒绝。",
      "权限表里保留的 spawn、combat_test_arena 条目在当前构建中没有对应的注册命令。"
    ]
  },
  "groups": [
    {
      "name": "帮助与内置别名",
      "items": [
        { "command": "help", "usage": "help [page] [size] | help <command> | help ?keyword [page] [size]", "access": "player", "side": "客户端", "note": "分页列出全部命令、查看单条命令用法与示例，或按关键词搜索。page 最小为 1，size 会被限制在 1-100；关键词同时匹配命令名和帮助摘要。" },
        { "command": "lsd", "usage": "lsd [参数...]", "access": "同目标命令", "side": "同目标命令", "note": "内置别名，等价于 list_data。别名展开后按目标命令检查权限。" },
        { "command": "lr", "usage": "lr [参数...]", "access": "同目标命令", "side": "同目标命令", "note": "内置别名，等价于 list_recipes。" },
        { "command": "lp", "usage": "lp [参数...]", "access": "同目标命令", "side": "同目标命令", "note": "内置别名，等价于 list_protos。" },
        { "command": "inv", "usage": "inv [参数...]", "access": "同目标命令", "side": "同目标命令", "note": "内置别名，等价于 inventory。" },
        { "command": "ms", "usage": "ms [参数...]", "access": "同目标命令", "side": "同目标命令", "note": "内置别名，等价于 mod_settings。" },
        { "command": "ems", "usage": "ems [参数...]", "access": "同目标命令", "side": "同目标命令", "note": "内置别名，等价于 export_mod_settings。以上别名在读取 console_aliases.json 之前注册，配置里的同名条目会覆盖它们。" }
      ]
    },
    {
      "name": "MOD、注册表与数据查询",
      "items": [
        { "command": "mods", "usage": "mods", "access": "developer（默认）", "side": "服务端", "note": "列出已安装 MOD 与其中真正加载的数量；禁用或已启用但需重启的条目带 [disabled] / [enabled, restart required] 标记。" },
        { "command": "mod_list", "usage": "mod_list", "access": "developer（默认）", "side": "服务端", "note": "列出已加载 MOD 与列表校验码，用于核对联机双方的 MOD 一致性。" },
        { "command": "export_mod_list", "usage": "export_mod_list [path]", "access": "developer（默认）", "side": "服务端", "note": "把 MOD 列表与校验码导出为 JSON，默认路径 mod_list.json。" },
        { "command": "mod_settings", "usage": "mod_settings [mod_id] [key]", "access": "modder", "side": "服务端", "note": "查看 MOD 的最终配置值与来源；禁用 MOD 的配置同样可查，条目带 [disabled] 标记。" },
        { "command": "export_mod_settings", "usage": "export_mod_settings [output_path]", "access": "modder", "side": "服务端", "note": "导出最终 MOD 配置快照 JSON，省略路径时写入 logs 下的默认快照文件。" },
        { "command": "list_data", "usage": "list_data [type] [page] [size] [prefix=...] [mod=...] [sort=asc|desc]", "access": "developer（默认）", "side": "服务端", "note": "分页列出注册表数据；省略 type 时列出全部类型。type 只接受 blocks、entities、recipes、jobs、civilizations、techs、focuses，其余首个词会被当成页码。" },
        { "command": "data", "usage": "data <type> <id>", "access": "developer（默认）", "side": "服务端", "note": "查看单条数据的 id、type、mod 与来源文件。需要同时给出 type 和 id 两个参数。" },
        { "command": "list_recipes", "usage": "list_recipes [page] [size] [prefix=...] [sort=asc|desc]", "access": "developer（默认）", "side": "服务端", "note": "分页列出已注册配方。" },
        { "command": "recipes", "usage": "recipes", "access": "developer（默认）", "side": "服务端", "note": "不分页，直接打印全部配方 ID。" },
        { "command": "list_protos", "usage": "list_protos [page] [size] [prefix=...] [sort=asc|desc]", "access": "developer（默认）", "side": "服务端", "note": "分页列出实体原型。" },
        { "command": "protos", "usage": "protos", "access": "developer（默认）", "side": "服务端", "note": "不分页，直接打印全部实体原型 ID。" },
        { "command": "list_techs", "usage": "list_techs", "access": "modder", "side": "服务端", "note": "按分类列出研究科技。" },
        { "command": "list_factions", "usage": "list_factions", "access": "modder", "side": "服务端", "note": "列出已注册的 NPC 阵营定义与名称模板数量。" },
        { "command": "list_name_pools", "usage": "list_name_pools", "access": "modder", "side": "服务端", "note": "列出已注册的名称池与词条数量。" },
        { "command": "list_faction_instances", "usage": "list_faction_instances", "access": "modder", "side": "服务端", "note": "列出已经生成的 NPC 阵营实例：名称、关系值与生成 Tick。" },
        { "command": "gen_name", "usage": "gen_name <template> [seed]", "access": "modder", "side": "服务端", "note": "按名称模板生成调试名称，模板里可写 ${random_name}；传入 seed 可复现结果。" }
      ]
    },
    {
      "name": "世界、实体与袭击",
      "items": [
        { "command": "entities", "usage": "entities", "access": "developer（默认）", "side": "服务端", "note": "打印当前世界的实体数量。" },
        { "command": "selection", "usage": "selection", "access": "developer（默认）", "side": "客户端", "note": "显示当前悬停与选择状态。" },
        { "command": "spawn_proto", "usage": "spawn_proto <entity_id>", "access": "developer", "side": "服务端", "note": "按原型 ID 生成非殖民者实体；带 ColonistTag 的原型固定拒绝。" },
        { "command": "raid", "usage": "raid list | raid status | raid start <RaidID> | raid stop [RaidUUID] | raid resume [RaidUUID] | raid pause [RaidUUID]", "access": "developer", "side": "服务端", "note": "list 列出全部袭击定义；status 列出活动袭击的 UUID、定义、波次、存活数、目标和 active/paused；start 通过服务端启动并分配 UUID；stop/pause/resume 省略 UUID 时作用于全部活动袭击。UUID 随存档与联机状态保留。" },
        { "command": "tp", "usage": "tp <entity_uuid> <x> <y> <z>", "access": "developer", "side": "服务端", "note": "按实体 UUID 传送到指定坐标；实体不存在或已死亡时报错。" },
        { "command": "inventory", "usage": "inventory <entity_uuid>", "access": "developer（默认）", "side": "服务端", "note": "只读查看指定实体的背包内容与装备槽：槽位、定义 ID、数量与品质。" },
        { "command": "inventory_page", "usage": "inventory_page <entity_uuid>", "access": "developer（默认）", "side": "服务端", "note": "与 inventory 等价，保留旧名字。" },
        { "command": "lookup_block", "usage": "lookup_block <block_id_u32>", "access": "developer（默认）", "side": "服务端", "note": "把哈希后的 u32 方块 ID 反查成数据 ID。" },
        { "command": "hash_id", "usage": "hash_id <data_id>", "access": "developer（默认）", "side": "服务端", "note": "把数据 ID 计算成 u32 方块哈希。" }
      ]
    },
    {
      "name": "时间与网络",
      "items": [
        { "command": "time", "usage": "time <set|add|query> [value]", "access": "developer", "side": "服务端", "note": "query 查询当前时间；set 设定时刻，支持 morning/noon 等名称、00:00 至 23:59 或日内数值；add 用正整数增量推进。目标时刻已过时前进到次日，不倒退模拟时钟。" },
        { "command": "tps", "usage": "tps", "access": "developer", "side": "服务端", "note": "显示固定模拟 Tick 率（SIMULATION_TPS = 20）。" },
        { "command": "crop_growth", "usage": "crop_growth [1|64|query]", "access": "developer", "side": "服务端", "note": "直接输入在所有作物64倍正向生长与正常速度之间切换，回显ON/OFF和倍率；1显式关闭，64显式开启，query只查询。环境限制、负向成长、种收工时和腐坏时间不变。与游戏倍速相乘，仅本次服务端进程有效，不写存档，重启恢复1倍。" },
        { "command": "net_status", "usage": "net_status", "access": "developer", "side": "客户端", "note": "查看网络角色、连接状态、同步计数、MOD 同步状态与重连状态。" },
        { "command": "net_commands", "usage": "net_commands", "access": "developer", "side": "服务端", "note": "查看服务端收到的网络命令统计（received、last_seq），仅服务端有数据。" },
        { "command": "net_server", "usage": "net_server [port]", "access": "developer", "side": "客户端", "note": "启动服务端权威同步服务器，省略端口时使用 7777。" },
        { "command": "net_join", "usage": "net_join <server> [port]", "access": "developer", "side": "客户端", "note": "连接服务器并接收快照。" },
        { "command": "net_disconnect", "usage": "net_disconnect", "access": "developer", "side": "客户端", "note": "断开当前客户端或服务端会话。" }
      ]
    },
    {
      "name": "相机、界面与本地化",
      "items": [
        { "command": "camera_pos", "usage": "camera_pos", "access": "developer（默认）", "side": "客户端", "note": "显示相机位置与朝向。" },
        { "command": "camera_reset", "usage": "camera_reset", "access": "developer（默认）", "side": "客户端", "note": "把相机复位到默认位置。" },
        { "command": "camera_target", "usage": "camera_target <x> <y> <z>", "access": "developer（默认）", "side": "客户端", "note": "设置相机注视点。" },
        { "command": "view_mode", "usage": "view_mode <normal|building|underground|xray on|xray off>", "access": "player", "side": "客户端", "note": "切换或查看视图模式：normal、building、underground，以及 xray on|off。" },
        { "command": "locale_list", "usage": "locale_list", "access": "developer（默认）", "side": "客户端", "note": "列出已加载的本地化语言与当前语言。" },
        { "command": "locale_set", "usage": "locale_set <locale_id>", "access": "developer（默认）", "side": "客户端", "note": "运行时切换本地化语言。" },
        { "command": "locale_reload", "usage": "locale_reload", "access": "developer（默认）", "side": "客户端", "note": "热重载 core 与全部 MOD 的本地化文件。" },
        { "command": "ui_lab", "usage": "ui_lab [show|hide|toggle|components|tech_tree]", "access": "developer（默认）", "side": "客户端", "note": "显示、隐藏或切换 RmlUI 设计实验室，也可直接打开 components 或 tech_tree 预览场景。只有 --DEBUG 运行会加载该文档；改完共享 RCSS 后用 reload rml 刷新。" }
      ]
    },
    {
      "name": "脚本、事件与热重载",
      "items": [
        { "command": "lua", "usage": "lua <code>", "access": "developer", "side": "服务端", "note": "在服务端 Lua VM 执行代码，结果回传请求客户端；与 echo、emit 按网络接纳顺序处理。运行时不可用或世界正在迁移时拒绝执行。也可以写成 = 前缀简写。" },
        { "command": "=（前缀简写）", "usage": "=<lua code>", "access": "同 lua", "side": "同 lua", "note": "整行以 = 开头时展开成 lua <code>，例如 =engine.time.tps。展开发生在权限与执行侧判断之前，所以它等同 lua，不会放宽权限；已注册的命令名不会被前缀覆盖。" },
        { "command": "luafile", "usage": "luafile <mod_id:relative/path>", "access": "developer", "side": "服务端", "note": "在服务端 Lua VM 执行某个 MOD scripts 目录下的 .lua 文件：core:tests/probe 解析为 mods/core/scripts/tests/probe.lua，省略 .lua 会自动补上。只接受已安装 MOD；拒绝绝对路径、盘符与 NTFS 流冒号、纯点号段（. / .. / ...），以及解析后落在 scripts 目录之外的符号链接。" },
        { "command": "luac", "usage": "luac <code>", "access": "developer", "side": "客户端", "note": "在请求客户端的 Lua VM 执行代码，不经过服务端；还没有创建世界（例如主菜单）时会报告客户端 Lua 运行时不可用。" },
        { "command": "luacfile", "usage": "luacfile <mod_id:relative/path>", "access": "developer", "side": "客户端", "note": "在请求客户端的 Lua VM 执行 MOD scripts 目录下的 .lua 文件；路径解析与安全检查同 luafile。" },
        { "command": "echo", "usage": "echo <lua_expression>", "access": "developer", "side": "服务端", "note": "在服务端求值一段 Lua 表达式，暂停时仍可处理；错误详情见服务端日志，执行由统一 watchdog 监测。" },
        { "command": "emit", "usage": "emit <event_name>", "access": "modder", "side": "服务端", "note": "以空 payload 派发一个事件，用于手动触发事件订阅。" },
        { "command": "reload", "usage": "reload | reload rml", "access": "modder", "side": "服务端 / rml 为客户端", "note": "仅 --DEBUG 可用。不带参数向服务端排队注册表重载，候选准备失败会保留旧环境，保存或载入期间延后；reload rml 由本客户端重载游戏内 RML/RCSS。Lua 文件变化由自动监听单独处理，不能把 Lua 路径传给此命令。" }
      ]
    },
    {
      "name": "GPU 与渲染调试",
      "items": [
        { "command": "gpu_stats", "usage": "gpu_stats", "access": "developer", "side": "客户端", "note": "打印 GPU 模拟、剔除与区块网格计数。" },
        { "command": "gpu_probes", "usage": "gpu_probes [on|off|status]", "access": "developer", "side": "客户端", "note": "开启、关闭或查看 GPU 诊断探针（gpu_probe_occlusion / gpu_probe_light）；流体是 CPU 权威，没有 GPU 路径。" },
        { "command": "gpu_chunk_cull", "usage": "gpu_chunk_cull [on|off|status]", "access": "developer", "side": "客户端", "note": "开启、关闭或查看 GPU 区块剔除。" },
        { "command": "gpu_probe_occlusion", "usage": "gpu_probe_occlusion <chunk_x> <chunk_z>", "access": "developer", "side": "客户端", "note": "对已加载区块运行 GPU 遮挡高度探针。" },
        { "command": "gpu_probe_light", "usage": "gpu_probe_light <chunk_x> <chunk_z>", "access": "developer", "side": "客户端", "note": "对已加载区块运行 GPU 天空光探针。" }
      ]
    },
    {
      "name": "控制台配置维护",
      "items": [
        { "command": "reload_permissions", "usage": "reload_permissions", "access": "developer", "side": "服务端", "note": "重新读取并应用 console_permissions.json。" },
        { "command": "reload_aliases", "usage": "reload_aliases", "access": "developer", "side": "服务端", "note": "重新读取并应用 console_aliases.json；配置里的同名别名会覆盖内置别名。" },
        { "command": "reload_config", "usage": "reload_config <permissions|aliases|all>", "access": "developer", "side": "服务端", "note": "按分组重新加载控制台配置。" },
        { "command": "validate_config", "usage": "validate_config <permissions|aliases|all>", "access": "developer", "side": "服务端", "note": "只校验配置文件、不应用，打印 pass/warn/error 汇总。" },
        { "command": "validate_config_export", "usage": "validate_config_export <permissions|aliases|all> [output_path]", "access": "developer", "side": "服务端", "note": "校验配置并把汇总报告导出到文件。" },
        { "command": "export_console_snapshot", "usage": "export_console_snapshot [output_path]", "access": "developer", "side": "服务端", "note": "把当前控制台运行时快照导出为 JSON，省略路径时写入 logs 下的默认快照文件。" },
        { "command": "diff_console_snapshot", "usage": "diff_console_snapshot <fileA> <fileB>", "access": "developer", "side": "服务端", "note": "比较两个控制台运行时快照 JSON 文件的差异。" },
        { "command": "diff_console_snapshot_current", "usage": "diff_console_snapshot_current <snapshot_file>", "access": "developer", "side": "服务端", "note": "把快照文件与当前运行时控制台状态做比较。" },
        { "command": "diff_console_snapshot_export", "usage": "diff_console_snapshot_export <fileA> <fileB> [output_path]", "access": "developer", "side": "服务端", "note": "比较两个快照文件并导出差异报告。" },
        { "command": "diff_console_snapshot_current_export", "usage": "diff_console_snapshot_current_export <snapshot_file> [output_path]", "access": "developer", "side": "服务端", "note": "把快照与运行时状态比较并导出差异报告。" }
      ]
    },
    {
      "name": "Doctor 管线与归档",
      "items": [
        { "command": "doctor_console_config", "usage": "doctor_console_config [output_dir]", "access": "developer", "side": "服务端", "note": "运行 validate/reload/snapshot/diff 组成的 doctor 管线，省略目录时输出到 logs/Doctor。" },
        { "command": "doctor_console_config_strict", "usage": "doctor_console_config_strict [output_dir]", "access": "developer", "side": "服务端", "note": "运行严格 doctor 管线，配置、重载或差异有问题时直接判定失败。" },
        { "command": "doctor_console_config_archive", "usage": "doctor_console_config_archive [tag]", "access": "developer", "side": "服务端", "note": "运行 doctor 管线并把结果归档到带时间戳的目录，可附加 tag。" },
        { "command": "list_doctor_archives", "usage": "list_doctor_archives [limit]", "access": "developer", "side": "服务端", "note": "按时间倒序列出归档目录，limit 会被限制在 1-500。" },
        { "command": "show_doctor_archive", "usage": "show_doctor_archive <archive_name>", "access": "developer", "side": "服务端", "note": "显示某个归档的 manifest 与 doctor 汇总状态。" },
        { "command": "open_doctor_archive", "usage": "open_doctor_archive <archive_name>", "access": "developer", "side": "服务端", "note": "打印某个归档的绝对路径与关键文件。" },
        { "command": "open_latest_doctor_archive", "usage": "open_latest_doctor_archive", "access": "developer", "side": "服务端", "note": "打印最新归档的绝对路径与关键文件。" },
        { "command": "verify_doctor_archives", "usage": "verify_doctor_archives [limit]", "access": "developer", "side": "服务端", "note": "校验最近若干归档的关键文件是否齐全。" },
        { "command": "diff_doctor_archives", "usage": "diff_doctor_archives <archiveA> <archiveB>", "access": "developer", "side": "服务端", "note": "比较两个归档的 doctor_summary.json。" },
        { "command": "diff_doctor_archives_export", "usage": "diff_doctor_archives_export <archiveA> <archiveB> [output_path]", "access": "developer", "side": "服务端", "note": "比较两个归档并导出差异报告。" },
        { "command": "prune_doctor_archives", "usage": "prune_doctor_archives [keep]", "access": "developer", "side": "服务端", "note": "保留最新 N 个归档，删除更旧的归档。" },
        { "command": "prune_doctor_archives_preview", "usage": "prune_doctor_archives_preview [keep]", "access": "developer", "side": "服务端", "note": "预览会被删除的归档，不实际删除。" }
      ]
    }
  ]
};
