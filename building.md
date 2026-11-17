# Windows 构建脚本

Windows 使用 `bash/Build.bat`；Git Bash 使用 `bash/Build.sh`。两者均配置并构建 MSVC / Ninja 的 Release 预设。执行构建前应保存当前工作；`Build.bat` 还会先运行源码检查器及自动修复。

## 默认编译并行数

两个入口共同调用 `bash/BuildParallelism.ps1`，按开始构建前的可用物理内存和逻辑 CPU 数计算默认并行数：

```text
并行数 = max(1, min(逻辑 CPU 数, floor((可用内存 - 4 GiB) / 2 GiB)))
```

保留 4 GiB 给系统、其他应用和构建开销，其余每 2 GiB 分配一个并发构建任务。Release 配置启用 `/GL`，链接峰值也需要余量；这里的预留是并行数估算，不是对进程用量的强制限制。内存按原始字节计算并向下取整，不先四舍五入到整数 GiB；逻辑 CPU 数也限制最大并行数，不再固定最多 4 路。

| 可用物理内存 | 默认并行数（CPU 数足够时） |
| --- | ---: |
| 8 GiB | 2 |
| 10 GiB | 3 |
| 14 GiB | 5 |
| 16 GiB | 6 |
| 20 GiB | 8 |
| 32 GiB | 14 |

资源读取失败时退回 1 路。脚本输出选定的任务数；自动模式还输出可用内存、逻辑 CPU 数和预算。计算只在启动时进行，不会在编译期间动态调整，也不代表每个翻译单元或链接阶段的内存峰值保证。

已设置且非空的 `CMAKE_BUILD_PARALLEL_LEVEL` 优先，跳过自动预算。例如，在 PowerShell 中：

```powershell
$env:CMAKE_BUILD_PARALLEL_LEVEL = '4'
.\bash\Build.bat
```

在 Git Bash 中：

```bash
CMAKE_BUILD_PARALLEL_LEVEL=4 ./bash/Build.sh
```

这些命令会实际执行构建；只有明确需要编译时才运行。2026-11-17 的 4 路 Release 增量构建已成功：91 项 C++ 编译、12 项链接，构建进程树驻留内存合计采样峰值约 3.78 GiB，单个编译进程最大驻留内存约 1.56 GiB，单个链接进程约 3.16 GiB。该次使用的是旧预算；当前“预留 4 GiB、每路 2 GiB”仍是默认估算，6 路及更高并行度和全量重编的峰值、吞吐量尚未实测。
