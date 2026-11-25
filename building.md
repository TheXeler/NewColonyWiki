# Windows 构建脚本

Windows 使用 `bash/Build.bat`；Git Bash 使用 `bash/Build.sh`。两者均配置并构建 MSVC / Ninja 的 Release 预设。执行构建前应保存当前工作；`Build.bat` 还会先运行源码检查器及自动修复。

## 内存预算与编译并行数

两个入口共同调用 `bash/BuildParallelism.ps1`，在 CMake 配置前和正式构建前分别读取可用物理内存、系统提交内存余量和逻辑 CPU 数。提交余量是 Windows 的提交上限减去当前提交用量。提交余量低于 8 GiB 或无法读取内存计数器时，脚本会报错退出。

```text
物理内存允许的任务数 = max(1, floor((可用物理内存 - 4 GiB) / 4 GiB))
提交余量允许的任务数 = floor((提交余量 - 4 GiB) / 4 GiB)
并行上限 = min(逻辑 CPU 数, 物理内存允许的任务数, 提交余量允许的任务数)
```

预算为系统和其他应用预留 4 GiB，每个并发任务按 4 GiB 估算，涵盖 Release 的 `/GL` 编译和 `/LTCG` 链接。物理内存压力大时降为单任务，仍须满足提交余量门槛。比如，物理内存可用 16 GiB、提交余量为 10 GiB 时，上限为 1 路。脚本在每次检查时输出两项内存读数，正式构建前还会输出选定的并行数。当前预算是启动时的估算，编译期间没有动态调节或进程内存配额。

可通过 `CMAKE_BUILD_PARALLEL_LEVEL` 请求并行数。`Build.bat --parallel N` 或 `Build.bat -j N` 优先于环境变量，最终并行数始终受内存和 CPU 预算约束。`Build.bat` 继续接受 `--target` 等 CMake 构建参数，使用 `--parallel N` 控制并行数。例如，在 PowerShell 中：

```powershell
$env:CMAKE_BUILD_PARALLEL_LEVEL = '4'
.\bash\Build.bat
```

在 Git Bash 中：

```bash
CMAKE_BUILD_PARALLEL_LEVEL=4 ./bash/Build.sh
```

2026-11-17 的 4 路 Release 增量构建使用旧预算，完成了 91 项 C++ 编译和 12 项链接。构建进程树的驻留内存合计采样峰值约为 3.78 GiB，单个编译进程的峰值约为 1.56 GiB，单个链接进程约为 3.16 GiB。
