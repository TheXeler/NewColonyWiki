# Entity rendering acceptance and benchmarks

## Current follow-up results (2026-10-11)

### Whole-game rerun: eight successful executions

The owner requested another run after the memory-related deferral. Current
Renderer, dependent DLLs and the game benchmark rebuilt successfully with one
job and full Release optimization. The five watched source fingerprints
(Renderer.hpp, WorkPointEffects.hpp, Engine.cpp, ChunkManager.hpp and the game
benchmark) stayed unchanged during the rebuild. Eight actual Engine::run
executions completed with exit 0: a forward CPU/GPU sweep and a reverse sweep.
The previous initial-world crash did not recur. This is rerun evidence, not
proof of the previous crash's root cause.

Each execution uses seed 424242, a 960x540 window, vsync/validation off, four
workers, normal terrain/simulation/network/Lua/HUD, and 100 or 1,000 extra
prototype colonists. Each measures wall seconds 15-40; startup and shutdown are
outside the observation window. CPU/GPU modes switch both entity poses and
entity culling, so this comparison does not isolate either feature. GPU modes
actually evaluated 65 unique GPU poses per frame; CPU modes evaluated none on
GPU. Visible populations were 115 and approximately 1,011-1,015.

Values below are equal-weight averages of the two run means, in milliseconds.

| Extras / mode | Samples, both runs | Entity prepare | Whole CPU frame | Mean frame range by run | SimLock | UiPublish |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 100 / CPU | 9,013 | 0.09086 | 5.5464 | 5.5200-5.5728 | 1.5780 | 0.7628 |
| 100 / GPU | 8,966 | 0.06099 | 5.5754 | 5.4568-5.6939 | 1.6091 | 0.7746 |
| 1,000 / CPU | 184 | 0.21797 | 274.2335 | 269.8414-278.6256 | 119.7235 | 117.4062 |
| 1,000 / GPU | 184 | 0.18683 | 273.7092 | 263.9281-283.4904 | 118.5791 | 118.0616 |

GPU-mode entity preparation is approximately 33% lower at 100 extras and 14%
lower at 1,000 extras. Whole-game mean frame differences are smaller than run
variation and are not evidence of a repeatable whole-game FPS improvement.
At 1,000 extras, SimLock plus UiPublish account for approximately 86% of the
measured mean CPU frame. The logs also show slow Attention simulation ticks;
UI publication includes server-side waiting/work and should not be interpreted
as RmlUi rasterization alone. No simulation/UI rewrite was included in this
performance rerun.

CPU-frame P95 ranges across the two runs: 100 CPU 20.33-20.71 ms, 100 GPU
19.93-20.94 ms, 1,000 CPU 527.23-628.94 ms, 1,000 GPU 495.40-626.55 ms.
Per-run P99 and GPU timings are retained in JSON; with only 89-95 high-load
samples per run, extreme-tail estimates need longer measurements. GPU frame
means also vary substantially between runs, so they are not used to claim a
stable whole-game graphics speedup.

Artifacts: `%TEMP%/nc-entity-acceptance-20261011-retry8`. Forward files are in
the root; reverse files are in `reverse/`. Both contain four CSVs and their
engine logs. `game-results.json`, `reverse/game-results.json` and
`game-summary.json` retain means, medians, P95/P99 and run ranges.
`build-game.log`, `source-fingerprints-start.json` and `binary-fingerprints.json`
retain build and identity evidence. The complete project test suite remains a
separate pending gate; successful game performance runs do not substitute for it.

### Current Renderer rerun and fixes

The current smoke executable rebuilt and finally passed 47/47 checks with
synchronization validation. This rerun first exposed missing attachment-read
access in the main and SSAO geometry render-pass resume dependencies. LOAD
operations read preserved color/depth after automatic layout transitions. Both
clear/capture and resume passes now use identical color/depth read/write
destination masks, retaining framebuffer/pipeline compatibility. The first
attempt limited the mask change to resume and exposed a compatibility error;
the common mask fixes both issues without changing attachment load/store modes.

The first retest also exposed stale test-local DLLs: updating a DLL implementation
can preserve its import library, so the executable does not relink and POST_BUILD
staging does not run. Tests/CMakeLists.txt now gives both GPU smoke and game
benchmark an always-run runtime staging target; the game staging target waits
for runtime dependencies. Source-built and staged Renderer hashes matched before
the successful final check. Intermediate failing logs/XML are retained.

The final current-source performance run passed all three suites: 32 dynamic
pose cases, 16 submission cases and 8 CPU/GPU culling cases. Dynamic/submission
use 30 warmup and 120 measured frames. No build ran concurrently.
The culling suite uses 30 warmup and 60 measured frames.

| Dynamic controls, 100 entities / 64 unique poses | CPU prepare ms | GPU prepare ms | CPU-path CPU frame ms | GPU-path CPU frame ms |
| --- | ---: | ---: | ---: | ---: |
| 300 vertices / 8 bones / 8 Morphs | 2.15482 | 0.046775 | 2.53017 | 0.43409 |
| 3,000 vertices / 64 bones / 8 Morphs | 23.5204 | 0.066137 | 24.5159 | 1.22775 |
| 30,000 vertices / 64 bones / 8 Morphs | 239.346 | 0.100394 | 247.376 | 8.11255 |

For the largest row GPU-frame time rose from 6.54221 to 7.64195 ms. One shared
pose with the small model changed CPU-frame time from 0.368342 to 0.380333 ms;
compute is not universally beneficial. At 1,000 entities with 30,000 vertices,
GPU mode still takes 53.3529 ms CPU frame / 52.3732 ms GPU frame. Geometry cost
remains substantial despite removing repeated CPU-controlled bounds work.

For 10,000 rigid instances all visible, culling CPU preparation fell from
0.966707 to 0.640648 ms with GPU culling, while GPU frame rose from 0.122095 to
0.201729 ms. At 10% visible, preparation rose from 0.552213 to 0.587758 ms and
GPU frame from 0.024889 to 0.101508 ms. This supports the adaptive dense/sparse
selection rather than unconditional GPU culling.

Retry 8 evidence: `renderer-correctness.xml/log`, `renderer-performance.xml/log`,
the three `entity_*_benchmark.csv` files, `renderer-binary-fingerprints-final.json`
and `build-renderer.log`. The eight game comparison runs preceded this narrow
synchronization correction; final Renderer fixtures separately validate the
scene-capture resume behavior and MSAA/SSAO paths.

Five more current-source submission sweeps passed 80 cases. Medians of run means
for 10,000 instances / 64 models are below. Full CPU-frame costs have overlapping
run ranges; reduced submit time does not guarantee a total-frame gain.

| Culling mode | Direct calls | Aggregate calls | Direct submit ms | Aggregate submit ms | Direct CPU frame ms | Aggregate CPU frame ms |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| CPU | 64 | 1 | 0.040808 | 0.002963 | 1.70967 | 1.49037 |
| GPU | 64 | 1 | 0.035068 | 0.003227 | 1.30929 | 1.38005 |

The GPU-culling row has a higher aggregate CPU-frame median in this rerun;
do not describe aggregate submission as universally faster. Run ranges are
retained in `submission-summary.json`; raw `submission-repeat-1..5.csv/xml/log`
retain the five independent sweeps. Existing configurable adaptive thresholds
remain rather than fitting a new policy to this noisy single-machine result.

After the synchronization correction, the game benchmark rebuilt/staged with
matching Renderer DLL hashes and a further 100-extra GPU-mode verification
completed with exit 0 and 11,467 active-world samples. Its files are in `sanity/`.
This ninth execution checks final-runtime operation, not a paired performance
comparison; it is excluded from `game-summary.json` and no FPS improvement is
inferred from it. All build and benchmark processes finished.

### Renderer measurements retained from Batch 7 (historical)

The owner explicitly requested actual performance execution; manual compilation
alone was not performance acceptance. The final Renderer gate passed 47/47
checks with synchronization validation. The final benchmark run passed both
suites: 32 dynamic-pose cases and 16 direct/aggregate submission cases, with
30 warmup and 120 measured frames per case. No build ran concurrently.

Environment: Ryzen 5 5600, RTX 5060 (driver 610.88), MSVC Release
`/Ox /GL /LTCG /cgthreads:1`; benchmark vsync and validation disabled.

| Dynamic controls, 100 entities | CPU prepare ms | GPU prepare ms | CPU-path CPU frame ms | GPU-path CPU frame ms | CPU-path GPU ms | GPU-path GPU ms |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 300 vertices / 8 bones / 8 Morphs / 64 unique poses | 2.218 | 0.0468 | 2.594 | 0.442 | 0.0766 | 0.1367 |
| 3,000 vertices / 64 bones / 8 Morphs / 64 unique poses | 28.247 | 0.0951 | 29.239 | 1.316 | 0.5052 | 0.9015 |
| 30,000 vertices / 64 bones / 8 Morphs / 64 unique poses | 269.273 | 0.1188 | 275.592 | 8.386 | 5.5696 | 7.8411 |
| 300 vertices / 8 bones / 8 Morphs / 1 shared pose | 0.0542 | 0.0169 | 0.3974 | 0.4096 | 0.0695 | 0.1142 |

These measurements support selecting compute by unique poses per model rather
than summing poses from unrelated models. The default remains 32 poses per
model. The regression verifies 8 models with 10 poses each remain CPU, whereas
one model with 80 poses uses GPU after warmup. A forced path remains available.

Five repeated submission sweeps passed 80 measured cases. For 10,000 instances,
64 models and GPU culling, the median of run means was 1.05089 ms direct versus
1.01879 ms aggregate CPU frame, and 0.0290283 versus 0.00249667 ms submission.
Actual draw calls fell from 64 to 1. Stable opaque plans no longer reupload their
draw tables. Small four-batch scenes showed inconsistent total-frame benefit;
default aggregation requires 8 batches or 2,048 candidates, plus capabilities
and budget. The small-scene fallback and changed thresholds passed the final gate.

Final artifacts in `%TEMP%/nc-entity-acceptance-20261011-batch7`:
`adaptive-final-correctness.xml/log`, `adaptive-final-performance.xml/log`,
`final-dynamic-pose.csv`, `final-submission.csv`, `submission-repeat-1..5.csv`,
`performance-environment.json` and `performance-summary.json`.
The earlier equal-wall-window attempt was deferred; it is superseded by the
eight successful reruns above. The full project suite remains pending.
The earlier game benchmark and its dependencies built successfully with full
Release optimization. The first new run crashed before sampling while creating
initial chunks: Windows recorded `world.dll+0x14b9c`, exception `0xc0000005`.
The dump's nearest exported function is `ChunkManager::build_initial_chunks`;
disassembly shows an invalid container-node dereference. This is localization,
not a proven root cause or an assertion that Renderer changes are unrelated.
Concurrent changes to `WorkPointEffects.hpp` occurred after Renderer.cpp's object
was compiled; cross-DLL layout inconsistency needs a coherent rebuild and rerun.
System commit headroom then fell to approximately 1.4 GiB. The owner explicitly
selected preserving results and deferring whole-game performance revalidation.
No further compilation or game runs were started after that choice.

The previous four successful game runs are retained as exploratory CSVs; their
high-load observation windows were unequal. `performance-summary.json` places
them in `game_exploratory`; its final `game` array is empty. Do not use them as
an equal-duration CPU/GPU verdict. Evidence retained beside the Renderer data:
`build-performance-game.log`, `game-100-cpu-engine.log`,
`game-startup-crash.dmp`, `game-startup-crash-events.json`,
`game-crash-analysis.txt`, and `exploratory-entity_game_benchmark_*.csv`.

## Follow-up execution history (2026-10-11)

The entries below record intermediate builds, failures and exploratory timing.
Pending statements in this history are superseded by the current results above.

Five repeated, no-build submission sweeps completed (80 measured cases).
Median-of-run means for 10,000 instances / 64 models / GPU culling were 1.05089 ms
direct versus 1.01879 ms aggregate CPU frame, with submit 0.0290283 versus
0.00249667 ms and 64 versus 1 calls. Steady draw-table upload bytes were eliminated.
Small four-batch scenes showed no consistent gain; source adds an adaptive
minimum of eight batches or 2,048 candidate instances while retaining forced
benchmark selection. The final policy and per-model pose regression check
still require rebuilding/revalidation.

The coherent game benchmark built successfully after rebuilding simulation
objects changed by another thread during compilation. Its first startup exposed
top-level diplomacy proposal registration calling a runtime-only authoritative
API during Mod candidate loading. `network/diplomacy_server.lua` now requires
the definitions without executing registration, and initializes them from
Server lifecycle callbacks. Normal candidate loading remains enabled. The four
initial CPU/GPU game runs subsequently completed and emitted active-world CSVs.

Initial 100-extra-colonist CPU/GPU runs (115 visible) measured entity preparation
0.09131 / 0.06762 ms and mean whole CPU frame 5.543 / 5.408 ms. At 1,000 extras,
CPU/GPU mean preparation was 0.2286 / 0.1922 ms, but whole CPU frames were
224.18 / 272.03 ms. Slow-frame logs identify UiPublish and simulation mutex waits,
with slow Attention ticks, rather than entity rendering as the dominant load.
The game clamps dt, so initial high-load GPU_STATS automatic exit took 105-113
wall seconds; those CSVs are exploratory, not equal-duration final comparisons.
The benchmark source now enforces a 40-second wall window (15-second warmup)
and records SimLock/UiPublish columns. Final equal-window runs remain pending.

Performance execution resumed after the owner clarified that manual compilation
had not included performance tests. Memory was sufficient and no other build ran.
The updated Release leaf built, and its 47 nonbenchmark checks passed. The first
32 dynamic-pose and 16 submission cases then passed with 30 warmup and 120 measured
frames. Artifacts: `final-correctness.xml`, `performance-initial.xml`,
`initial-dynamic-pose.csv`, `initial-submission.csv` in the Batch 7 directory.

The initial submission run exposed that aggregation was not active: physical
device properties were populated after logical-device feature selection. Source
now reads the physical API version before selection; a new assertion compares
the enabled draw-parameter feature against the actual physical feature. The
subsequent 16-case run exercised real multi-draw: 64 calls became 1, and submit
CPU time dropped from approximately 0.033 ms to 0.0025 ms. Preparing/uploading
the draw table offset that gain in several cases. Source now caches unchanged
opaque submission plans and per-slot tables; its build/retest is in progress.
The animation-sharing test isolates direct submission to keep its exact palette
upload contract; aggregate uploads have an independent gate.

The dynamic-pose data shows a clear distinction: 64 unique poses strongly favor
compute, whereas one shared pose can lose GPU/frame time. At 100 entities and
30,000 vertices, CPU preparation was 232.324 ms versus 0.08324 ms with GPU poses;
GPU-frame time increased from 5.280 ms to 7.727 ms. Source keeps the 32-pose default
threshold but now counts unique poses per model, avoiding aggregate false
positives from many models with a single pose each. Final retests and actual
game-loop measurements remain pending; source status is separate from results.

The owner subsequently authorized all remaining implementation and acceptance.
The earlier Batch 6 results below do not validate NCEM v9 / assembly revision 8,
HDR/KHR shading, opaque-scene transmission, GPU controlled poses or indexed
aggregate submission. The current source is covered by additional focused gates,
complexity/submission CSV benchmarks and an explicit real-game benchmark target.
Follow-up artifacts use `%TEMP%/nc-entity-acceptance-20261011-batch7`.

The full-optimization Renderer build encountered C1002 / LNK1257 during LTCG
while Windows commit headroom was below 1 GiB. Acceptance-only CMake linker
flags now include `/cgthreads:1`; `/Ox`, `/GL` and `/LTCG` remain enabled.
This controls link-time code-generation memory without changing the repository's
release preset or disabling production optimization. Before this follow-up,
45 data/GPU cases passed 44; the single outdated expanded-map fixture assertion
was corrected. Newer source validation and performance gates remain pending.

The subsequent Renderer/smoke leaf build succeeded with single-thread LTCG,
and 46 nonbenchmark cases ran: 45 passed, including the new mixed-geometry
multi-draw case under both CPU/GPU culling. The remaining extended GPU case
reported an invalid render-pass handle after switching MSAA. Source now refreshes
the SSAO composite's borrowed target and recreates its sample-dependent pipeline.
Its revalidation is pending: the next leaf build failed with C1060 during a
system commit spike. Source changes after the 46-case sweep are explicitly
unvalidated; the complete suite and new benchmarks have not run.

Continuation check: all 39 current CoreMod graphics/compute shader products
were present, newer than their sources and shared GLSL includes, and passed
`spirv-val --target-env vulkan1.0`. The additional deformation math-check shader
also passed SPIR-V validation. This establishes the shader gate only; it does
not validate the pending C++ changes or replace actual GPU execution. Evidence:
`%TEMP%/nc-entity-acceptance-20261011-batch7/spirv-validation.json`.

## Current coherent acceptance (2026-10-11)

The explicit acceptance request superseded the earlier manual-only handoff.
The independent MSVC Release build at
`%TEMP%/nc-entity-coherent-acceptance-build` successfully built NewColony, its
runtime DLLs, NewColonyEntityRenderingTests, NewColonyEntityGpuSmoke and
NewColonyEntityNetworkSmoke. Build jobs were limited to one after memory checks.
The corrected configure/build code page is 936; the clean restarted build records
actual Ninja header dependencies. This proves the coherent temporary package,
not arbitrary older objects in the repository's release build directory.

| Gate | Executed result |
| --- | --- |
| CPU/import/cache/assembly/appearance/network/preprocessing | 64/64 passed, exit 0 |
| GPU rendering, lifetime, streaming and adaptive culling | 5/5 passed, exit 0; synchronization validation enabled, no VUID/hazard |
| Lua appearance API | Passed in the CPU target |
| Whole-world appearance save/load | Passed using actual save/load and collected render input |
| Separate authenticated localhost TCP server/client | Both PASS and exit 0; phases 0-6, destruction/new UUID and fresh-session rejoin |
| Current performance repeat | All three benchmark tests passed: 30 assembly + 12 spatial + 8 forced CPU/GPU cases |

The extended GPU case runs the actual shared deformation GLSL against CPU
position references for bind, animated and blended/look/morph-controlled poses.
It also checks compacted opaque instances, indirect counts, reload, frame reuse
and default switching between small, dense and sparse populations. A public
Windows ABI mismatch was corrected: VulkanContext's opaque Windows handles use
`_WIN32` rather than the private Vulkan platform macro. All affected consumers
were rebuilt. The last failing network fixture held an EntityVisual pointer
across capture's AttributeCache archetype migration; reacquiring it after mutable
capture fixed the test without changing production replication.

Artifacts are under `%TEMP%/nc-entity-acceptance-20261011-batch6`:
`build-integration.log`, `coherent-integration-acceptance.xml`,
`coherent-gpu-acceptance.xml`, the two TCP stdout/stderr logs, and
`tcp-result.json`. The latter records both process exit codes as zero. Tests used
current source-built binaries and staged content, without a source-tree runtime
fallback. Visual acceptance was already confirmed and was not repeated.
The complete unrelated project test suite and whole-game FPS were not measured.
Knowledge-graph transport was closed during final source verification; exact
source reads were used instead of relying on stale graph completeness.

## Final coherent performance repeat (2026-10-11)

The same Ryzen 5 5600 / RTX 5060 ran 50 current-source cases with no concurrent
build, validation/vsync disabled and 30 warmup plus 60 measured frames per case.
The executable was the CMake-built NewColonyEntityGpuSmoke from the coherent
package. The three suites used the filter
`EntityRenderBenchmark.AssembledExportedModels:EntityRenderBenchmark.SpatialOutfitDiversity:EntityRenderBenchmark.GpuCullingAndIndirect`.
All passed, exit 0. Evidence includes coherent-benchmark-acceptance.xml/log and
the retained CSVs `coherent-entity_assembly_benchmark.csv`,
`coherent-entity_spatial_benchmark.csv` and
`coherent-entity_gpu_culling_benchmark.csv` in the acceptance artifact directory.

| Population / visible | CPU prepare ms | GPU-path prepare ms | CPU GPU-frame ms | GPU-path GPU-frame ms | CPU upload bytes | GPU-path upload bytes |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 1,000 / all | 0.1104 | 0.0628 | 0.0212 | 0.0349 | 60,064 | 108,096 |
| 1,000 / 10% | 0.0567 | 0.0484 | 0.0132 | 0.0265 | 6,064 | 108,096 |
| 10,000 / all | 1.0318 | 0.6593 | 0.1064 | 0.2098 | 600,064 | approximately 1,080,100 |
| 10,000 / 10% | 0.6230 | 0.7072 | 0.0284 | 0.1124 | 60,064 | approximately 1,080,100 |

GPU culling reduces the 10,000 fully visible case's CPU preparation by about
36%, while adding GPU compute work and candidate/bounds upload. In the sparse
case it increases both preparation and GPU-frame cost. These results support
adaptive selection: minimum population 2,048, 60% entry / 40% exit hysteresis,
using completed counts and no blocking readback. The population threshold is a
RenderConfig field; the visibility hysteresis is currently fixed in Renderer.
Explicit CPU/GPU selection remains available and disables adaptation. These
fixture timings do not establish a universal GPU advantage or game FPS gain.
The whole GPU-frame columns include culling; draw-only timestamps do not.

The four-part exported assembly repeat measured 10,000 fully visible instances
at 2.3117 ms input / 0.9246 ms preparation / 0.0052 ms submission / 3.3149 ms
GPU draw for one structure (five draws). Four structures used 20 draws and
3.3720 ms GPU draw. At 10% visible, the one-structure case used 0.3639 ms GPU
draw. Upload averages include occasional table-maintenance copies written by
the CPU, so they can exceed the bare 60-byte visible-instance stream.

The separate nonoverlapping spatial cases retain four parts and 32 colors.
For 10,000 inputs, measured visible counts were 3,623 at distance 80 and 9,988
at distance 320. Increasing structures from 1 to 64 raised draw submissions
from 5 to 320; the latter case's preparation reached 2.3688 ms, input 3.3066 ms
and GPU draw 2.6013 ms at distance 320. Cumulative resident model/table storage
reached 15,318,848 / 7,429,184 bytes, while shared texture allocation stayed
61,440 bytes. Thus reusable structures and shared image/sampler/format resources
remain material to runtime cost. Disk compilation, initial asynchronous latency,
gameplay simulation and broad hardware populations are outside these timings.
Distance LOD is excluded by the owner. Current PBR implements core glTF
metallic-roughness with procedural environment lighting; imported HDR IBL and
the broader KHR material extension family are outside this contract.

## Batch 6 implementation and preliminary measurements (2026-10-11)

The owner removed distance LOD and requested GPU entity culling/indirect draws
plus skinning, morphs, local animation blending, procedural look and PBR.
NCEM is now v7 and assembly revision 5. This changes the measured workload;
historical timings below do not prove current performance.

MSVC /Zs checks passed for GltfLoader, EntityModel, EntityModelCache,
EntityAssembly, EntityGpuCulling, VulkanPipeline, Renderer, NetworkSystem,
the extended CPU test source and the manual runner before its final assertion
additions. Five entity shaders (rigid/deformed vertex, fragment and the two
compute stages) compiled using glslangValidator 1.4.328.1. These are syntax and
shader compilation checks, not executed CPU/GPU tests.

The single-job release Renderer build initially failed to link because the new
cull statistics code called VMA directly across the backend DLL boundary. An
exported VulkanDevice::invalidate_allocation wrapper corrected that ownership.
The subsequent Renderer/backend/assets/resources target build passed. This
partial build does not rebuild the engine/content/native network orchestration.
NewColonyContentData was also checked and required no rebuild.

The manual runner contains EntityExtendedRendering and EntityGpuRendering
correctness cases. GpuCullingAndIndirect emits
`entity_gpu_culling_benchmark.csv`: 1,000/10,000 skinned/morphing instances,
100%/10% visible and CPU/GPU paths, 30 warmup plus 60 measured frames per case.
It records input/preparation/submission/GPU draw times, upload bytes, visible
instances and command submissions, plus complete-call input and CPU/GPU frame
times. Draw timestamps exclude the preceding cull compute; the recorded whole
GPU-frame time includes it.
The eight cases isolate scaling rather than represent complete-game FPS.

Tests/CMakeLists.txt also provides NewColonyEntityGpuSmoke EXCLUDE_FROM_ALL in
a tests-enabled configuration. It builds an isolated entity-renderer-smoke
package with source-compiled shaders and the required sky fixtures; it links
Renderer and leaf DLLs, without the engine archive. GPU correctness uses Vulkan
synchronization validation; benchmark runs disable validation. The old
assembly/spatial benchmarks explicitly select CPU culling for comparison.

Executed against the current Release leaf DLLs before the final adaptive-policy
addition: 32 CPU cases passed and all five GPU correctness/regression cases
passed with synchronization validation and no VUID/hazard. The first CPU run
found a zero tangent normalized to NaN during assembly; the source correction
and rerun passed. The default-pose test also needed an explicit string_view to
select the intended overload. All 24 shaders compiled in the isolated package.

The 30 assembly, 12 spatial and eight CPU/GPU culling cases executed successfully.
Example eight-case culling results (milliseconds, same small skinned fixture):

| Population / visible | CPU prepare | GPU-path prepare | CPU GPU-frame time | GPU-path GPU-frame time | CPU upload bytes | GPU-path upload bytes |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 1,000 / all | 0.0766 | 0.0504 | 0.0206 | 0.0342 | 60,064 | 108,096 |
| 1,000 / 10% | 0.0444 | 0.0430 | 0.0130 | 0.0252 | 6,064 | 108,096 |
| 10,000 / all | 0.7536 | 0.4356 | 0.0997 | 0.1755 | 600,064 | 1,080,096 |
| 10,000 / 10% | 0.4284 | 0.4360 | 0.0205 | 0.0966 | 60,064 | 1,080,096 |

This supports retaining CPU culling for small/sparse populations. The new
default adaptive policy starts at 2,048 instances, enters GPU culling above
60% visibility and leaves it below 40%, using completed GPU counts or current
CPU counts without a blocking readback. Explicit CPU/GPU selection disables
adaptation. The population threshold is configurable; fixed visibility hysteresis is not a general hardware/FPS
guarantee. The amended GPU case passed switching between small, dense and sparse
populations in the coherent package; these earlier forced-path measurements
remain preliminary, preceding that final rebuild.

An independent tests-enabled Release build completed under the temporary
nc-entity-coherent-acceptance-build directory. Its initial invocation used a
different console code page than configure, resulting in zero recorded Ninja
header dependencies. It was intentionally interrupted, cleaned with the build
tool, and restarted with code page 936 for configure and build. Do not count
that initial attempt as a successful coherent build. Final integration/Lua,
live TCP/full-world save checks passed as recorded above.
Visual acceptance is already confirmed and is not repeated.

## Historical Batch 3 acceptance (2026-10-10)

The final release build and 13 focused correctness tests passed. The Vulkan
integration test enabled synchronization validation and found no VUID or
hazard messages. Visual acceptance is already complete per the project owner;
it was not repeated. The complete project test suite was not run.

## Measurement setup

- CPU: AMD Ryzen 5 5600; GPU: NVIDIA GeForce RTX 5060.
- Release renderer DLLs; manual benchmark driver compiled with MSVC `/O2 /MD`.
- Fixed camera, hidden 256x256 window, vsync and validation disabled during timing.
- Three-vertex GLB, two rigid nodes, one 1-second clip baked at 60 Hz.
- 100, 1,000, and 10,000 entities; 100% or 10% inside the frustum.
- Static, animated, half-static/half-animated, and animated with eight part-color variants.
- Three input paths, giving 72 cases. Each warms up for 30 frames and averages 60 frames.
- Compilation/linking had finished before this final run. The earlier run with
  concurrent compilation is not used for the CPU comparisons below.

`snapshot_reuse` is the production snapshot entry point. `snapshot_fresh`
collects a new instance vector each frame with the same current collector and
passes it to the compatibility setter. `vector` copies preconstructed instance
input and does not include snapshot conversion. Compare the complete
`input_call_ms` field for snapshot paths: the setter's internal `input_ms` in
the fresh path excludes collection and parameter destruction.

## Results

All times are milliseconds per frame. The table uses complete input-call time
and the reused snapshot path's preparation/GPU measurements. Every case below
issued one entity draw call. No input groups were rebuilt after warmup.

| Entities | Playback | Visible | Fresh snapshot input | Reused snapshot input | Reused prepare | Reused GPU interval | CPU upload bytes |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 1,000 | Animated | 100% | 0.136835 | 0.075352 | 0.064670 | 0.008139 | 60,064 |
| 1,000 | Animated + colors | 100% | 0.169927 | 0.072583 | 0.061165 | 0.011180 | 60,064 |
| 10,000 | Static | 100% | 2.929870 | 1.377750 | 0.542363 | 0.082918 | 600,064 |
| 10,000 | Animated | 100% | 2.047660 | 1.240390 | 0.603630 | 0.085708 | 600,064 |
| 10,000 | Mixed | 100% | 2.297710 | 1.158400 | 0.605952 | 0.132391 | 600,064 |
| 10,000 | Animated + colors | 100% | 2.370260 | 1.130630 | 0.567858 | 0.103738 | 600,064 |
| 10,000 | Animated | 10% | 1.804950 | 0.910612 | 0.419940 | 0.010147 | 60,064 |
| 10,000 | Animated + colors | 10% | 2.365510 | 0.858992 | 0.427200 | 0.016901 | 60,064 |

For the fully visible 10,000-entity animated case, reuse reduced complete input
call time by about 39% against fresh collection in this run. Animated entities
with colors reduced that call time by about 52%. This comparison isolates the
input paths in the final implementation; it is not an overall game FPS result
or a comparison against an older complete engine revision.

The 76-byte full-matrix reference uploaded 760,064 bytes for 10,000 visible
instances. The final 60-byte affine format uploads 600,064 bytes, a deterministic
reduction of 160,000 bytes per frame (about 21% including the identity pose).
For 1,000 visible instances the corresponding numbers are 76,064 and 60,064.
The matrix itself changed from 64 to 48 bytes.

The shared table reached 8,256 bytes: 64 bytes of identity data, 7,680 bytes of
clip poses, and 512 bytes for eight appearance variants. It is shared across
entities and frame slots. The correctness smoke test also checks that adding
one two-node appearance stages only 64 new table bytes, while the existing
clip prefix is copied on the GPU. Upload counters include CPU-written instance,
fallback pose, and changed table bytes; they exclude device-to-device copies.

## Scope and next decisions

This fixture measures input allocation, culling/preparation, instance bandwidth,
and shared rigid-animation/appearance scaling. Its three vertices, common
orientation, one material, and overlapping instances do not represent real
colony geometry, pixel load, animation diversity, or many-material submission.
GPU timestamps bracket draws, are collected from completed frame slots, and
can include preceding pipeline work. Small differences are not reliable LOD
or optimization thresholds.

Snapshot input costs more than culling/preparation here. Moving only the
frustum test to the GPU would leave that input cost in place. Representative
multi-model scenes are needed before selecting GPU culling/indirect draws or
distance LOD. Skinning, morph targets, blending, procedural GLB look-at, and
external attachments were not implemented at the time of the Batch 3 run; see
[the performance plan](entity-rendering-performance-plan.md) for their proposed
data and execution paths.

The reusable runner is `Tests/Manual/entity_animation_gpu_smoke.cpp`. Run
`--gtest_filter=-EntityRenderBenchmark.*` for correctness with synchronization
validation, and `--gtest_filter=EntityRenderBenchmark.*` without validation for
measurement. The benchmark writes `entity_benchmark.csv` beside its isolated
temporary executable. Runtime package marker/shader requirements and linker
dependencies are described in the performance plan.

Batch 4 adds independent assemblies and GLB material resources; its authoring
contract is in [entity-assembly.md](entity-assembly.md). The earlier rows above
remain historical measurements and must not be used as timings of Batch 4.

## Batch 4: exported mesh assemblies

The final assembly run uses the same Ryzen 5 5600 / RTX 5060, optimized manual
driver and release DLLs. Compilation finished before measuring. The fixed
512x512 camera sees a 20x20 repeated grid with four body orientations. Geometry
comes from the project's exported player/villager/sheep GLBs; two/four scaled
villager/sheep pieces are attached to the player's head. These are workload
fixtures, not finished character outfits. Each model uses its actual skin PNG,
compiled to RGBA; a synthetic 1-second translation channel moves the body head.

There are 30 cases: 100/1,000/10,000 entities; zero/two/four parts; one/four
distinct binding structures where applicable; all or 10% visible. Eight part
tints coexist with these structures. Each case has 30 warmup plus 60 measured
frames. Validation is disabled while timing and enabled in separate GPU tests.
All benchmark materials are opaque. Blended materials are covered by smoke
testing and have explicitly different submission costs.

| Entities | Parts | Structures | Visible | Input ms | Prepare ms | Submit ms | GPU interval ms | Upload bytes | Draws |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 10,000 | 0 | 1 | 100% | 1.93563 | 0.803538 | 0.005133 | 0.462985 | 600,064 | 1 |
| 10,000 | 2 | 1 | 100% | 3.67267 | 0.827112 | 0.006782 | 1.282230 | 600,064 | 3 |
| 10,000 | 2 | 4 | 100% | 4.64008 | 1.487830 | 0.012807 | 1.340560 | 600,064 | 12 |
| 10,000 | 4 | 1 | 100% | 5.29269 | 0.876218 | 0.007545 | 2.024310 | 600,064 | 5 |
| 10,000 | 4 | 4 | 100% | 4.73572 | 1.269160 | 0.012932 | 2.491570 | 600,064 | 20 |
| 10,000 | 4 | 1 | 10% | 4.58454 | 0.517982 | 0.006548 | 0.215469 | 60,064 | 5 |
| 10,000 | 4 | 4 | 10% | 4.50007 | 0.830215 | 0.007988 | 0.220794 | 60,064 | 10 |

The final four-part single-structure input time is about 5.29 ms versus 13.44 ms
in the first assembly implementation with per-frame binding-string copies,
approximately 61% lower in these two runs. They are sequential runs, not a
statistical hardware-performance guarantee. One immutable binding reference is
now copied through snapshot input; per-frame colors and transforms still need
processing. The full input cost remains material at 10,000 entities.

One 60-byte instance per visible character is uploaded regardless of part count.
Additional models/materials increase GPU work and batch draws: the four-part
single-structure case issues five opaque draws for 10,000 entities, while four
structures issue twenty. With only 10% visible, this fixture's visible indices
cover two of the four structures, producing ten draws. Shared pose/appearance
storage reaches 772,032 bytes across the cumulative cases; it is retained and
is not an independent per-case allocation.

The grid deliberately overlaps when populations exceed 400 and uses temporary
exported assets with limited complexity. It demonstrates model/material and
assembly scaling, not real colony FPS or a recommended outfit complexity.
GPU culling would not remove snapshot input cost, and GPU submission is small
here. Next performance work should prioritize snapshot collection/data layout
and model residency, then measure higher-complexity geometry for LOD. The
current CPU frustum path remains useful: reducing visibility decreases GPU
geometry time and instance upload while retaining bounded CPU preparation.

Validation for Batch 4: a complete single-job clean release build plus final
incremental builds passed; 24 focused tests passed, including the actual Lua
bindings, embedded/external image cache behavior, material deduplication,
invisible rigs, animated attachment bounds, assembly cache invalidation, and
GPU palette overflow/reload. Synchronization validation found no VUID/hazard.
The full project test suite and a live multiplayer/full-world save round trip
were not run. Visual acceptance was not repeated. The runner writes
`entity_assembly_benchmark.csv` next to its temporary executable when invoked
with `--gtest_filter=EntityRenderBenchmark.AssembledExportedModels`.

## Batch 5 benchmark design and historical source handoff

The 2026-10-11 implementation adds in-place input changes, interleaved basis
reuse, resource residency/retirement, table compaction and asynchronous CPU
preparation with frame upload budgets. The earlier unverified source handoff and
external failed compilation are recorded below for history. Current acceptance
is recorded at the top; earlier Batch 4 timings remain historical measurements.

The new `EntityRenderBenchmark.SpatialOutfitDiversity` produces
`entity_spatial_benchmark.csv` in the isolated temporary package. Its 12 cases
use 1,000/10,000 characters in distinct three-unit cells, four exported-model
parts, 1/16/64 structures, 32 colors and camera distances 80/320. Visibility is
measured rather than asserted to be 100%. It records input, preparation,
submission and GPU times, visible instances, draw calls, model/texture/table
storage and upload bytes. The existing 30-case assembly benchmark remains
available for comparison against Batch 4.

Both benchmarks explicitly select synchronous preparation to compare steady
rendering after 30 warmup frames. This excludes asynchronous queue latency,
first-time outfit compilation and upload-budget stalls. Async readiness,
bounded requests/uploads and replacement fallback are checked separately in
`EntityAsyncPreparation`. Residency, shared textures, binding churn, table
compaction and retirement amid continuous uploads are checked in
`EntityResourceResidency`. Benchmark validation is disabled; synchronization
validation is enabled for the GPU correctness cases.

Define `NC_RENDERER_ONLY_SMOKE` when compiling the manual runner to omit Lua,
network and prototype integration tests. This limits checks to Renderer and its
leaf dependencies when full engine integration is not required. The
current CMake split makes NewColonyCore publicly depend on NewColonyIO;
standalone linking therefore also needs io.lib and NC_IO_SHARED. The owner
confirmed the module split complete; the current coherent package rebuilt its
consumers. The full runner retains those integration checks when the define is
absent. Current GPU indirect work and its measured limits are recorded above;
distance LOD is excluded.

Additional source checks after that scope gate was lifted:

- `EntityAssemblyCache.*` covers retention of dynamic combinations, changed/disabled
  dependencies, age/count/byte budgets, legacy metadata and malformed sidecars.
- `EntityModelCache.PinnedBytesDecodeTheHashedInputAcrossFileReplacement` checks
  decoding and integrity against the exact hashed dependency snapshot.
- `EntityAsyncPreparation` additionally checks committed content hints before
  any entity snapshot, duplicate hints, CPU-only warming and abandoned candidates.
- `EntityAppearanceIntegration.WholeWorldSaveRestoresAssemblyAndCollectsIdenticalRenderInput`
  uses the actual world save/load path and compares tint, named overrides, sockets,
  rig parts, transforms, visibility, UUID and collected renderer inputs.
- `NetworkSnapshotAppearance.FullAndDeltaWirePacketsPublishAssemblyAndReuseTintOnlyGeometry`
  exercises native capture, complete/delta packet encoding/decoding and client
  publication through cloned ECS candidates. It covers color-only reuse, structural
  replacement, collected render bindings and removal. This belongs to the full
  project test target, not the isolated renderer-only runner, and does not open
  sockets or establish a two-process multiplayer session.

At the original handoff these checks were authored source awaiting manual
validation. They have since passed in the coherent acceptance targets; see the
current results above.

The external DLL-build session subsequently reported an incremental compilation
failure at EntityModelCache.cpp:332 (`source` undeclared). The source-dependent
image check was moved out of the pure byte decoder. This correction has since
been compiled and its focused checks passed. The associated follow-up
adds `EntityModelCacheTest.SourceValidationAndPureDecodeHaveDifferentDependencyPolicies`,
`MainSourceHashAndImportConsumeTheSamePinnedGlb`,
`ExternalGeometryBufferChangesInvalidateCacheAndPinnedImportRetainsItsSnapshot`,
and `EntityAssemblyMaterials.Utf8SourceDirectoryAndEscapedImageUriPreserveDependencyPolicy`.
They cover source freshness, transactional output, pinned GLB/BIN compilation,
missing geometry sources, and encoded image paths. No performance result is
claimed for the reduction in duplicate preprocessing reads.

## Repeatable two-process TCP appearance check

The current sources also include `EntityAssemblyCache.AuthoringPrefixAndCollectedNamesShareTheSameCompiledAssembly`.
The asynchronous GPU case prewarms a `gltf:` prototype hint and resolves its
prefix-free draw name, checking that both share one request. These checks cover
the canonical resource keys introduced in revision 4 and retained in revision 5;
the coherent CPU/GPU cases passed.

`Tests/Manual/entity_appearance_network_smoke.cpp` has an explicit source target
`NewColonyEntityNetworkSmoke`, available with `NEWCOLONY_BUILD_TESTS=ON`. It is
excluded from the default build and from CTest. In an already configured MSVC
test directory, the owner can explicitly build the target from a Visual Studio
developer shell after checking available memory and other build processes:

```powershell
cmake --build build-tests --target NewColonyEntityNetworkSmoke --parallel 1
```

Then run two separate processes, starting the server first and waiting for READY:

```powershell
.\build-tests\bin\NewColonyEntityNetworkSmoke.exe --server --port 17779 --timeout 120
```

```powershell
.\build-tests\bin\NewColonyEntityNetworkSmoke.exe --client --port 17779 --timeout 120
```

Choose another matching port if occupied. The target's Windows post-build step
copies the current module DLLs and runtime dependencies beside the executable,
following the existing test layout. The harness registers the same small
prototype fixture in both processes; it does not need GLB/shader files and does
not create a Vulkan window. Logs are separated by role/port under the system
temporary directory. Both processes must print PASS and exit with code zero.
Timeout, handshake rejection, a mismatch or a missing phase is failure.

The server advances only after client acknowledgments: initial full outfit,
color/visibility-only delta, a new hat model/socket transform, hat removal,
reassembly, entity deletion, and a new UUID. The client checks canonical model
names, whole/node/slot colors, complete attachment transforms and rig mode,
shared-geometry reuse, collector change flags, and removal/replacement of render
instances. The client then disconnects, clears its detached candidate world and
rejoins with a new authenticated connection identity; the next full snapshot
must restore the current outfit before the final acknowledgment. Snapshot and
acknowledgment traffic use real sockets and separate address spaces throughout.

This covers native transport/capture/client publication and collected renderer
input, with periodic full snapshots disabled so phase deltas are exercised.
It does not run the game loop, Mod download, Lua appearance commands, GPU draws,
or graphical acceptance. The separate GPU/Lua/save checks cover those boundaries.
The current acceptance built this target and ran two hidden processes on port
17779. Both reported PASS and exited with code zero; logs and tcp-result.json
are retained with the acceptance artifacts. It remains a transport/appearance
integration check, with the gameplay loop and Mod transfer outside its scope.
