# AI 操作与测试游戏

`--AI_TEST` 开启本机自动化接口。主要流程是读取真实 RML 界面树，选择控件，提交该控件的界面命令，再读取回执和变化后的界面。Lua 与控制台用于准备场景、内部查询和诊断。

`--DEBUG` 独立控制日志，AI_TEST 不隐式打开 DEBUG。`--UI-AUTOFIRE` 固定脚本钩子已移除。

本文描述第一版接口。构建、导出及实际运行结果见仓库 `NCDOCS/AI_TEST-implementation-status.md`；各项运行覆盖应分别记录，不能用源码接线代替运行证据。

## 连接运行实例

启动选定运行目录的程序：

```powershell
.\output\NewColony\NewColony.exe --DEBUG --AI_TEST
```

运行实例在自己的 `ai_test/<session_id>/session.json` 发布连接描述。多个实例时应按目录、session 和 PID 明确选择，不能猜测默认端口。描述文件包含本机 token，不应贴入日志或测试报告。退出时本实例的文件撤销；崩溃遗留文件需通过连接检查识别。

仓库提供 Python 标准库客户端，无需安装 Python 包：

```powershell
python tools/ai_test/client.py --session <session.json> --method session.info
python tools/ai_test/client.py --session <session.json> --all-nodes
```

`--params-file` 从 UTF-8 JSON 文件读取参数，便于避免 shell 转义。`lua.execute` 可配合 `--code-file` 读取多行测试代码；这不改变 Mod 运行时只能加载 staged/package 内容的规则。

客户端默认提交后轮询至终态。超时返回原 request_id 和 `client_wait_timeout`，操作仍可能执行；使用同一 ID 调用 `request.get`。不要以新 ID 自动重试有副作用的操作。

需要保存包含本地化文本的回执时，使用 `--output-file <path>` 直接写 UTF-8 JSON，避免 Windows PowerShell 的重定向转码。session.info 的 client_lua/server_lua 表示当前生命周期允许执行，client_lua_initialized 单独表示 VM 已初始化；加载过程中不能将初始化等同于可调用。

## 第一版方法

| 方法 | 参数与结果 |
|---|---|
| `session.info` | 真实运行基目录、日志路径、frame、world_generation、tick、暂停/加载/VM/UI 状态和能力列表。 |
| `ui.snapshot` | `limit` 默认 200，上限 500；首次调用冻结可见界面树。继续读取使用 snapshot_id 和 offset；客户端 `--all-nodes` 自动读完。 |
| `ui.inspect` | element_ref；读取控件属性和原始内部 RML。 |
| `ui.channels` | 无 channel 时列出通道与字节大小；指定 channel 时返回当前 JSON 值。 |
| `ui.command` | element_ref、event（click/change/dblclick，默认 click）；按真实控件解析 target/payload。 |
| `ui.command` raw | 显式 mode=raw、target、payload；仅验证命令执行，不证明该控件可见可用。 |
| `ui.input` | events 数组；通过 InputManager 与物理输入相同的回调路径交付。 |
| `wait.until` | source=session/channel/ui；数据条件使用 channel、path（JSON Pointer）、equals；界面条件使用 id/target/text、present。timeout_ms 最长 60000；跨入世界等待需显式 follow_world=true。观察超时不会撤销操作。 |
| `lua.execute` | code、side=client/server；返回类型化多返回值、print 输出和直接错误。 |
| `console.execute` | line；复用控制台端路由，回显直接返回。 |
| `request.get` | 顶层 request_id 指向原请求，返回其当前状态。 |
| `request.cancel` | 取消尚未执行的请求；已经开始的操作不能假称撤销。 |

传输为 loopback TCP 上四字节大端长度加 UTF-8 JSON，一次连接处理一个请求。测试协议版本为 1，与游戏联机协议独立。通过描述文件中的 session_id/token 识别本次进程会话。

请求 ID 在一次会话内不得重复用于不同内容；同一 ID、方法与参数返回原结果，避免重试重复执行。会话有请求总数、队列和内存上限；达到后返回明确错误，需要重新启动测试会话。结果不写入存档，不提供跨重启回执。

## 读取和操作界面

真实 RmlUI 布局中的可见节点包括 element_ref、parent_ref、tag、原始 id、文本、表单 value、checked/selected、enabled、焦点、bounds、滚动信息与可解析动作。显示文本可能在文本子节点中，应结合父子关系阅读。

默认一次返回的只是一个页面。检查 next_offset/truncated；没读完不能断言某个控件不存在。新的完整 snapshot 会让上一份 element_ref 失效；继续同一 snapshot_id 的分页不会。旧快照过期或节点身份/动作变化时，重新观察并重新选择。

按控件调用示例参数：

```json
{"element_ref":"<从当前快照取得>","event":"click"}
```

解析使用实际监听器相同的 data-command、data-change-command、data-double-command、data-action、onclick、data-payload 和 data-param-* 规则。data-param-* 保持字符串值；不能自行把 UUID 换成列表序号。界面事件控制器 data-event-* 和没有命令属性的输入控件需要输入模式。

默认命令模式检查可见、禁用和控件中心命中情况。`hit_test=verified_center` 只说明该点命中控件或其子节点；`blocked_or_offscreen` 不能直接操作，应先滚动或检查遮挡。它不等价于完整遮挡区域或每个边缘点的分析。

输入事件使用 GLFW 窗口像素坐标，快照 bounds 使用 RmlUI context 像素。session.info 同时提供窗口与 framebuffer 尺寸，不能默认在所有 DPI 下相同；实际缩放边界以运行验证为准。输入事件格式如下：

```json
{"events":[
  {"kind":"move","x":400,"y":300},
  {"kind":"button","button":0,"pressed":true,"x":400,"y":300},
  {"kind":"button","button":0,"pressed":false,"x":400,"y":300}
]}
```

其余事件是 scroll（x/y 滚动量）、key（GLFW key、可选 scancode、pressed、modifiers）及 text（Unicode codepoint）。先聚焦再输入文本；文本与按键分开发送。世界输入按帧检查按下/抬起边沿时，应分为两个请求并让游戏推进一帧，不把同一帧内的 down/up 当作世界点选已通过。

`input_delivered` 只确认输入交付。`handled` 只确认原生 handler 返回；它可能合法地没有改变状态。需要继续读界面或通道证明效果。服务端注册命令等待真实回包，不把本地 pending 当最终结果。

## Lua、回显和日志

Lua 使用对应 VM owner 执行。返回值有 type，table 采用 entries 中的类型化 key/value，保留混合键和多返回值中的 nil。函数、userdata、线程、循环引用、非有限数和过大结果返回编码错误，不以地址代替数据。

print 只捕获本次同步执行的输出，最多 128 行和 64 KiB；被截断时给出 truncated。`engine.log.*` 仍写普通日志。直接 Lua 编译/执行错误与调用栈随回执返回。Lua 计数 hook 提供执行预算，无法保证中断阻塞的原生调用；原 hook 在调用结束后恢复。

运行或编码失败时，若 execution_started/effects_may_have_occurred 为 true，先检查真实状态，不能自动重放。测试 Lua 不承诺事务回滚。普通远程服务器不会因为客户端加上 AI_TEST 就开放服务器开发权限。

默认回执不携带启动 DEBUG 日志、开发控制台历史或所有 UI 通道。需要诊断时，从 session.info 的 log_path 定向检索 latest.log。会话重启后重新确认路径与 session；不要默认读取仓库根目录的 logs。

RML 容器可声明 `data-ai-content="on-demand"`，默认结构化树只保留该容器并标记 content_omitted，不展开其正文。日志浏览器的日志滚动区采用此声明，因此弹出调试窗口也不会把日志正文灌入默认快照。需要时可显式 ui.inspect 该容器，或直接检索本地日志。此标记只控制观察输出，不改变玩家 UI、事件或布局。

## 当前边界

原生截图接口与界面增量补丁暂未提供；可使用本地截图工具。快照最多 4096 个可见节点，文本和 RML 片段有大小限制。窗口缩放、原生输入、世界切换及具体功能的实际验收以实施记录为准。

测试报告应分别列出命令流程、输入链、视觉效果和实际玩法结果，不能把一项通过写成所有层面通过。
