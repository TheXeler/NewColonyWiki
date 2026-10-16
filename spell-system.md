# 法术子系统

当前提供底层注册、方案管理、物品实例配置、工作池更新、权威施法命令和独立法术实体。没有法术 HUD、方案编辑界面、正式符文／法杖内容或敌方自动施法策略。源码及测试源码已添加；未编译、未运行测试或游戏验收。

## 职业、法杖与精力

职业通过现有装备的 `supported_jobs` 许可使用法杖，法杖赋予施法能力。施法要求已征召、单人小队（`soldier_cap = 0`），未征召时 `Spells.available` 返回空列表，命令拒绝执行。正式职业的单人小队属性由内容定义，本次不修改职业平衡内容。

物品定义添加 `spell_staff` 配置：

| 字段 | 含义 |
| --- | --- |
| `mana_per_energy` | 杖芯倍率，每单位精力转换的魔力，必须大于零 |
| `slots` | 杖端法术槽数，正整数 |
| `maximum_mana` | 杖端允许装入的单个方案最大投入量 |
| `update_work` | `spell_staff_work` 工作定义编号，控制更新时长、资格与工作台 |

方案编辑不设置投入上限。施法扣除 `方案投入量 / mana_per_energy` 的现有 `needs.fatigue`，不会新增法力池或脱战恢复。精力不足在吟诵完成时中断，不部分扣除。精力归零时解除征召，让已有 AI 睡眠路径接管。

每根法杖必须是数量为 1 的独立物品实例。实例的 `payload_json.spell_staff` 保存 `uuid` 和 `slots` 数组，每个槽为方案 UUID，空槽为 `""`。现有物品 payload 编码随装备、库存、地面、存档和网络传递。制作内容可调用 `Staffs.initialize(location)` 初始化实例；`location` 支持 `equipment`、`inventory`、`ground`、`block`，`engine.spell_host.item_at(location)` 可读取未初始化物品。库存槽下标为原生的 0 起始下标，法术槽为 Lua 的 1 起始下标。`spell_host.items()` 只枚举已有法杖 payload，日常按持有者或缓存位置查询，定期重建位置索引与物品引用。

## 符文注册与计算

UGC Mod 将定义放入 `data/spell_runes/*.json`。引擎加载此类型，CoreMod 在 `mod_ready` 解析注册。空注册表有效，不附带正式内容。

| 字段 | 含义 |
| --- | --- |
| `id`、`name` | 命名空间编号和名称 |
| `initially_unlocked` | 为 true 时开局即能使用 |
| `research` | 解锁研究的编号；研究完成后殖民地共享解锁 |
| `repeat_limit` | 单个方案内重复上限，0 为无限 |
| `fixed_cost` | 单次出现的固定魔力开销，默认 0 |
| `percent_cost` | 单次出现的投入比例，0.1 表示 10%，默认 0 |
| `chant_seconds` | 单次出现的吟诵秒数，默认 0 |
| `coefficients` | 六项系数的加法修改，允许负数 |
| `callbacks` | `release`、`update`、`hit`、`effect` 回调配置 |

每个回调配置为 `{module="mod_id:module.path", func="function_name"}`，省略模块命名空间时使用符文编号所属 Mod。沿用原有 Reaction 的模块回调解析机制，因此不要求 CoreMod 依赖所有 UGC Mod。回调最多返回一个值，返回值不参与默认结算。符文的配置必须引用可解析的 Lua 函数。

投入量为 M，符文 i 出现 n 次时：

`剩余魔力 = M - sum(n * (fixed_cost + M * percent_cost))`

百分比均以初始 M 为基数。总开销超过投入量禁止保存。符文顺序无关；同编号数量合并、重复限制按总数量检查；属性系数叠加，吟诵时长求和。回调按编号排序、按重复次数调用。

六项系数全部默认 0：`damage`、`repulsion`、`speed`、`maximum_range`、`minimum_range`、`duration`。属性值为使用时剩余魔力乘系数。速度为世界距离／秒，斥力通过现有速度机制提交，范围为世界距离，持续时间为秒，向上换算为 20 TPS 的 tick。

- 负伤害治疗；正伤害接入现有战斗伤害提交，伤害／治疗四舍五入至整数。
- 负斥力沿施法方向吸引。
- 负速度从地面目标处向施法者方向运行。
- 范围取绝对值，再交换成最小值不大于最大值。
- 负持续时间控制释放后的延时，不是命中后的延时。

## 方案、引用与杖端更新

公开模块通过声明 CoreMod 依赖后引入：

```lua
local Schemes = require("core:systems.spell_schemes")
local Staffs = require("core:systems.spell_staffs")
local Spells = require("core:systems.spells")
```

`Schemes.save({name=..., mana=..., runes={{id=...,count=...}}}, old_uuid?, colony_uuid?)` 返回方案 UUID 或 `nil, error`；`get(uuid,colony_uuid?)`、`list(colony_uuid?)`、`runes(colony_uuid?)` 返回副本。`unlock(id,colony_uuid?)` 支持脚本解锁。不传殖民地时使用已认证的命令归属；无命令上下文时只允许唯一的玩家殖民地，存在歧义时返回错误。

方案保存 `colony_uuid`，解锁记录按殖民地 UUID 隔离。研究文明实例 UUID 与殖民地 UUID 是不同身份，`Schemes.bind_research(colony_uuid,civilization_uuid)` 为服务端内容提供显式绑定。只有研究实例定义唯一、实际居民归属也只对应一个殖民地时才自动绑定。研究完成事件按绑定解锁，恢复时遍历 UUID 研究实例，不使用固定数字索引。旧世界级数据只迁移到唯一玩家殖民地，无法确定归属则拒绝迁移，避免广播解锁。

方案属于殖民地。无引用时修改原 UUID；有引用时创建新 UUID，旧版本隐藏，已有杖端继续引用旧 UUID。`family_uuid` 与最新版本索引保证中间版本清理后仍能定位最新方案，但不会自动修改引用。配置和回调标识在方案中保存，Mod 重载不会重新编译旧方案。回调代码仍使用当前加载的 Mod 代码，并未保存历史脚本；缺失回调时方案保留并标记不可用，取消相关吟诵并清理活动实体。

managed world state 同时保存方案的引用者集合及引用者到方案的映射。引用包括杖端槽位、吟诵过程、独立法术实体和待完成更新任务。最后一个引用释放后删除隐藏版本。世界加载及重载时核对数据并重建双向记录；不存在的实体／任务不保留引用。

`Staffs.request_update(staff_uuid, slots?, {work_point_uuid?})` 发布更新任务。省略 `slots` 时更新已有槽位的旧版本至同一方案族的最新版本。更新数量与投入量仍需通过杖端限制；已经转交的法杖保留外部殖民地的旧引用，但不能任意装入不属于当前殖民地的新方案。

工作内容放在 `data/spell_staff_work/*.json`，字段为 `id`、`seconds`，可选 `qualification`（现有工作资格表达式）、`workstation_type`。由物品 `spell_staff.update_work` 选择定义，玩家命令只能选择工作点 UUID，不能提供时长或资格。指定工作点必须匹配类型且可用，否则按类型寻找可用点；激活时原生预约工作点，完成／中断走现有释放流程。

使用专属 `staff_update` 工作标签（46），已装备时指定持有者，否则进入普通工作池，并将任务绑定到实际殖民地。征召持有者的 Battle 工作在执行期间暂时锁定，完成／中断后恢复。

成功完成时重新核对物品、殖民地、持有者、工作台和旧槽位，才将新 UUID 写入实例。引用候选与物品 payload 由原生接口统一提交；原生 managed-state 发布失败则不写物品。任务期间旧方案仍有效。中断、取消、持有者变化或旧配置变化均不更新。完成前目标方案也持有引用，不会被提前清理。丢失的任务经过完成事件交付窗口后释放引用与 Battle 锁定。

## 权威命令接口

命令沿用现有注册命令及回复通道，暂不增加界面。

| 命令 | 参数与结果 |
| --- | --- |
| `core:spell.query` | 可选 `colony_uuid`、`scheme_uuid`、`actor_uuid`；返回方案、符文及指定法师可释放槽位，查询不会打断吟诵 |
| `core:spell.save` | `scheme`（名称、投入、符文数量），可选旧 `scheme_uuid`、`colony_uuid`；返回保存后的 UUID |
| `core:spell.staff` | `staff_uuid`，可选 `colony_uuid`；返回槽位、当前方案投影、最新版本 UUID 和杖端配置 |
| `core:spell.staff_update` | `staff_uuid`，可选 `slots`、`work_point_uuid`、`colony_uuid`；返回更新工作 UUID |
| `core:spell.cast` | `entity_uuid`、`slot`、`x/y/z`；开始吟诵 |
| `core:spell.cancel` | `entity_uuid`；取消吟诵，不扣精力 |

所有玩家命令都核对已认证殖民地上下文；请求提供的殖民地 UUID 不能改变认证归属。转交法杖的查询允许查看实际持有的旧方案投影，但不因此开放原殖民地整个方案库。

## 施法与实体运行

权威命令 `core:spell.cast` 接收 `entity_uuid`、`slot`、`x/y/z`。服务端接口 `Spells.cast(caster,slot,target)` 供脚本调用。只支持地面位置，不支持实体指向目标，不自动征召。

吟诵总时长为所有符文时长之和，使用模拟 tick。注册命令识别单个、嵌套与批量的 `entity_uuid`／`worker_uuid` 接收者，通过 `core:entity_command_received` 打断吟诵。原生移动、停止、防御、攻击、征召、阵型、解除征召、指定新工作及职业变更入口也发送通知，脚本直接调用这些入口同样生效。原生共用 `Engine::notify_entity_order`，新增脚本指令入口可调用 `engine.spell_host.order(entity_uuid)` 发出同一通知。实际血量伤害事件及 tick 血量变化会打断，护盾吸收不会打断。查看界面和法术查询不属于游戏指令。

吟诵结束重新验证装备和精力，预先准备 UUID、运行状态及引用，再由原生 `spell_host.release` 分配 ECS 实体、扣精力并提交 managed state；失败还原精力并移除实体。实体带位置、缩放及引擎内部 `engine:spell` 渲染身份，不进入普通投射物处理。法术实体保留方案引用，释放后不依赖法师存活，没有冷却。

负持续时间在释放时确定等待时间；等待结束才调用 `release` 回调并开始飞行／原地效果。零速度在起始位置起效；无形态的默认范围为环形波动的内外范围，无效果符文时没有伤害等效果。具体模型与动态表现由回调配置。

飞行速度和模型缩放按当前剩余魔力计算；每 5 tick 扣除固定开销。难度规则根级或预设添加 `spell_flight_cost`，预设覆盖根级，非负，允许 0；缺少时施法报告 `spell_difficulty_missing`，本次没有硬编码正式难度数值。

移动使用扫掠碰撞，查询实体碰撞体及经过的非空气方块，选最早命中。默认发射位置取施法者碰撞体中心，避免从脚底发射立即碰到地板；反向法术从地面目标出发时忽略起点正在离开的方块面。到未加载地形或超出扫掠限制时报告运行错误并清理法术。回调可修饰 `context.spell.direction`、`radius` 等运动／形态状态；系统承接位置更新和碰撞。

命中时按剩余魔力固定伤害、斥力、范围及后效时长，调用 `hit`，立即统一结算一次。正持续时间每 10 tick 由单个实体重新查询范围并结算，不为目标创建计时器，到期删除。零持续时间及已延时的法术只结算一次。没有敌我筛选；零范围是点与碰撞体的相交。伤害对同一小队所属者去重，避免多个兵模重复扣同一血池。

默认水平环使用引擎程序生成的 `spell_wave` 网格及白色材质，从内半径向外半径扩散。视觉不改变固定效应范围；瞬发后仅保留 10 tick 的显示阶段，不再执行效果，显示结束才释放实体引用。自定义球形／其他形态不使用这个默认尾效。无需正式美术资源，模型与缩放随现有实体快照保存及同步。

回调上下文提供 `spell`、`values`、`source_uuid`、`rune_id`、`occurrence`；`update` 增加 `dt`，`effect` 增加范围内 `targets`。原生接口位于 `engine.spell_host`：`origin`（施法者碰撞体中心）、`contacts`、`terrain`、`range`（球壳）、`ring`（水平环）、`heal`、`impulse`、`scale`、`visual`、`wave`（默认环形网格）。默认范围查询使用水平环，回调设置 `context.spell.shape = "sphere"` 使用球形范围。额外特殊效果由 Lua 编写。回调或运行异常记录错误并删除法术实体、释放引用。

## 验证范围

`Tests/UnitTests/test_core_spells.cpp` 的测试源码覆盖初始投入比例开销、顺序无关、重复限制、殖民地研究隔离与访问拒绝、负系数与范围交换、版本保留及清理、更新提交失败保持旧配置、旧状态归属迁移及无效实体清理、吟诵扣精力时机、取消、精力不足、周期结算，以及延时／视觉尾效不重复结算。

恢复校验会重算保存的符文开销、吟诵与系数，核对版本索引、计时器和槽位连续性。方案损坏时拒绝发布恢复候选；活动法术／任务失效时在候选校验后清理。运行回调的持久状态必须是无环、有限数值的普通数据，不能将函数或宿主对象放进 `context.spell`。运行发布局部更新单个实体与其引用，不再逐实体复制整个方案库。

测试源码尚未编译或运行。存档恢复、网络命令、真实工作台与任务执行、真实碰撞和模型表现仍需运行验收。按照仓库约定，没有自动执行构建或测试。

`Tests/UnitTests/test_spell_payload_commit.cpp` 增加原生提交测试源码：发布 hook 抛出时保留旧 payload，以及过期、被预约、非法 JSON 的写入不发布 managed state。该测试同样未编译或运行。
