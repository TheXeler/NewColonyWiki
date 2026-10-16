# Entity rendering performance plan

Runtime performance is the priority. Mods continue shipping GLB source assets;
the engine owns the generated cache. Changes must preserve the Renderer asset,
backend, resource, and draw-coordination library boundaries.

## Scope update: GPU submission and extended GLB rendering (2026-10-11)

### Follow-up scope authorized on 2026-10-11

After Batch 6 acceptance, the owner explicitly requested all listed remaining
implementation and validation work. The follow-up is active; Batch 6 results
below do not validate these new changes.

Current performance run: the owner clarified that compilation had not included
performance testing. The final Release Renderer gate passed 47/47, including
per-model pose selection and adaptive aggregate submission. The final 32
dynamic-pose and 16 submission scenarios passed (30 warmup / 120 measured frames).
Five repeated submission sweeps passed another 80 cases. Actual 64-to-1
multi-draw submission and unchanged-plan upload reuse were measured. The owner
resumed the deferred game test: after a successful coherent rebuild, eight
equal-wall-window runs (forward and reverse order) passed with exit 0, and the
initial-world crash did not recur. Mean CPU frames at 1,000 extra colonists were
274.23 ms CPU mode versus 273.71 ms GPU mode; approximately 237 ms is SimLock
plus UiPublish. Entity preparation improved, but whole-game FPS did not show a
repeatable gain. Full project tests remain a separate pending gate. See the
benchmark report for evidence and limitations. Historical notes below are
superseded by this status and the current checkbox list.

Retry 8 also passed the rebuilt Renderer 47/47 gate and all 32 dynamic, 16
submission and 8 culling performance cases. The rerun found and fixed LOAD
attachment-read synchronization in compatible main/SSAO resume passes, plus
stale test DLL staging when implementation-only changes do not relink the
executable. GPU smoke and game benchmark now stage runtime DLLs on every
explicit build. The intermediate failures and final passed XML are retained.

- [x] Deduplicate exact controlled poses and local bounds across instances.
- [x] Evaluate animation tracks, local blending/look, hierarchy and deformed bounds
      on the GPU with shared CPU fallback and measured selection.
- [x] Reuse immutable published snapshot inputs and filtered visibility views;
      preserve interpolation, identity replacement and immediate visibility updates.
- [x] Reduce material/geometry state changes and use multi-draw indirect batches
      for diverse outfits, retaining device fallback and transparent ordering.
- [x] Extend authored skin/Morph capacity and retain compact rigid resource paths.
- [x] Add imported HDR environment lighting and extended glTF material channels,
      including clearcoat, transmission/volume/IOR, specular, sheen, iridescence,
      anisotropy, emissive strength, unlit and texture transforms.
- [x] Validate higher vertex/bone/active-Morph populations and dynamic controls;
      compare exact CPU/GPU output and measured costs.
- [ ] Build/run the complete project tests and record failures with ownership.
- [x] Measure the actual game loop in a reproducible generated world with entities,
      terrain and simulation; keep this distinct from renderer-only fixtures.
- [x] Update the authoring contract, resource formats and performance acceptance evidence.

First follow-up gate: the four-influence/eight-target pose-compute source built
successfully, and all five hidden-window GPU cases passed with synchronization
validation. Actual GPU palettes and bounds matched CPU references for 24 requests
across three frame slots, including cubic quaternion interpolation, loop times,
blend/look/morph and indirect culling. Those results precede the subsequent
eight-influence/64-target format and immutable-input changes; their rebuild and
revalidation remain required. Evidence is in
`%TEMP%/nc-entity-acceptance-20261011-batch7/gpu-pose-acceptance.xml`.

The next Renderer leaf build passed. Its 40-case correctness sweep passed 39
cases, including eight influences/64 targets in actual GPU deformation and pose
math. The failing assembly case exposed coefficient-helper source IDs being
assigned separately during composition; all blocks must share the first block's
animation target ID. Source was corrected and assembly revision advanced to 7;
the corrected case has not yet rerun. Another release preset build is active,
so the follow-up does not start a competing compilation or timed benchmark.

The new format is NCEM v9 / assembly revision 8. Rigid vertex data stays compact;
optional deformation records contain eight influences and morphs use consecutive
16-coefficient helper matrices. Pose controls use a 64-bit mask; appearance wire
packets encode a separate sparse nonzero coefficient mask, preserving inactive
values too. NETWORK_VERSION stays 1, requiring matching builds. Published
snapshots now carry nonzero immutable publication tokens; mutable tool inputs
with token zero retain full comparisons. Filtered views invalidate on visibility
revision changes, and repeated render frames update interpolation only.

Distance LOD stays excluded. Current follow-up source work is not a completed
acceptance result. Builds use a separate directory, one job and memory checks;
visual inspection remains unnecessary per the owner.

Further source implementation now includes NCIB v1 HDR preprocessing and
transactional Renderer environment replacement, extended KHR material shading,
optional mipmapped opaque-scene transmission, scale-aware volume attenuation,
immutable aggregate geometry and indexed multi-draw parameters. Different
material image sets retain descriptor boundaries; transparent commands retain
their global ordering. Direct drawing remains available for devices/budgets
that cannot support aggregation. Ordinary opaque shaders omit transmission
inputs and calculations, and the normal render pass discards depth as before.

The earlier 45-case leaf sweep passed 44 cases, including HDR products/uploads,
extended material import/cache and the corrected wide assembly. Its single
failure was the old assertion that every expanded map slot was authored; only
four were authored in that fixture. The corrected assertion and newer rendering
paths have not yet rerun. The active Release build belongs to another thread;
no timed benchmark runs while that build is active.

New acceptance sources cover mixed aggregate geometry under CPU/GPU culling,
MSAA/SSAO capture and reload, a 32-case dynamic-complexity benchmark and a
16-case direct/aggregate submission benchmark. The explicit
`NewColonyEntityGameBenchmark` target runs Engine::run in a generated seeded
world with additional prototype colonists, normal simulation/network/Lua/UI,
15 seconds of warmup and per-frame CSV output. These are source-ready gates,
not completed results. Full project tests and real-game acceptance remain open.

The first new 46-case sweep passed 45, including aggregate submission with CPU
and GPU culling. The extended GPU case failed when switching MSAA: the SSAO
composite retained a destroyed main render-pass handle. Source now rebinds its
composite target and recreates the pipeline with the new sample count. That
correction, release-capacity cleanup and Unlit/transmission classification have
not yet rerun. Current leaf rebuilding hit MSVC C1060 during a system commit
spike (less than 0.5 GiB remaining); no user process or pagefile was changed.

The owner explicitly removed distance LOD from this goal and requested entity
GPU culling/indirect submission plus all five extended capabilities: weighted
skinning, morph targets, local animation blending, procedural look-at and PBR.
These are now required work, rather than conditional future suggestions.
The earlier manual-only verification choice was superseded by the request to
perform acceptance. Acceptance uses a separate coherent Release directory;
builds use one job after checking memory. Results are recorded in the
[benchmark report](entity-rendering-benchmark.md).

- EntityGpuCulling is renderer-owned and uses three independent frame slots.
  Baked local bounds are transformed and tested on the GPU; visible opaque
  instances are compacted into fixed batch slices. A second dispatch publishes
  indirect instance counts. Transparent commands use original instance indices
  and retain global CPU depth ordering. Counts are read only after the existing
  frame fence completes. Devices without graphics-queue compute or indirect
  first-instance support retain the CPU path. No distance LOD is introduced.
  First CPU/GPU measurements support default adaptive selection: below 2,048
  instances or at low visibility use CPU; enter/leave GPU at 60%/40% visibility.
  Explicit CPU/GPU selection remains available. The coherent GPU check passed
  adaptive switching between small, dense and sparse populations.
- NCEM v7 / assembly compiler revision 5 add an optional deformation stream,
  up to four normalized joint weights, mesh-specific inverse-bind palettes,
  up to eight morph targets with position/normal/tangent deltas, two UV sets,
  and glTF metallic/roughness, normal, occlusion and emissive material channels.
  Older generated caches regenerate from the shipped source GLBs.
- Rigid vertices keep an independent compiled shader variant, and ordinary baked
  playback continues sharing immutable palettes. Blending/looking/explicit
  morph control evaluates local TRS then the hierarchy; only those controlled
  instances need frame-local palettes. Deformation-aware bounds cover the same
  sampled geometry used by the shader.
- The owned pose control flows through visual prototype JSON, Lua, immutable
  snapshots, save/load and appearance full/delta replication. Wire version
  remains 1 per repository policy; old/new binaries need a coherent rebuild.
- New sources: EntityExtendedRendering CPU checks and EntityGpuRendering GPU
  checks; the GpuCullingAndIndirect benchmark emits eight CPU/GPU cases. Existing
  historical benchmarks explicitly keep their CPU path for comparable results.

The coherent Release build includes NewColony, dependent runtime DLLs and the
three explicit acceptance executables. Five GPU cases passed with synchronization
validation, including actual shader deformation math, indirect instance counts,
frame-slot reuse, reload and adaptive switching. The full-world save/Lua checks
and separate authenticated TCP server/client checks also passed. Final counts,
measurements and evidence paths are maintained in the benchmark report.

Batch 3 validation (2026-10-10): the final full release build passed, as did
13 focused tests and the 72-case benchmark. Synchronization validation was
clean. Earlier build failures recorded below are historical and were resolved
before this final build. See [the measured results](entity-rendering-benchmark.md).

## Batch 1: compiled animation and shared GPU storage

- [x] Bake rigid animation poses during GLB cache compilation, not first draw.
- [x] Store one conservative local AABB per baked frame in the cache.
- [x] Validate cache counts, ranges, finite values, and frame-to-node layout.
- [x] Use frame AABBs for frustum testing before registering visible animation data.
- [x] Share an immutable GPU animation table across frame slots.
- [x] Stage new tables in the frame command buffer, with transfer-to-vertex barriers.
- [x] Retain old tables and staging buffers until their frame fences complete.
- [x] Cover cache round trips, looping, frame bounds, and invalid payloads in tests.
- [x] Build the renderer release targets and run focused tests.

Validation on 2026-10-10: the release build passed before the final fallback
culling refinement. The final Renderer DLL built successfully. Three entity
cache tests and a hidden-window Vulkan smoke test passed, including frame-slot
reuse, table growth, content reload, empty frames, and synchronization validation.
All 21 GLSL shaders compiled. The last full-engine rebuild and recompilation of
the saved manual runner encountered MSVC C1060 while system commit usage was
96%; do not describe that full rebuild as successful. The successful GPU run
used an equivalent temporary runner against the final DLL.

The reusable manual runner is `Tests/Manual/entity_animation_gpu_smoke.cpp`.
Compile it with the renderer/core DLL import definitions and GoogleTest, GLFW,
Vulkan, simdjson, and LuaJIT dependencies into an isolated temporary directory.
Its inline network codec checks also need `Simulation/Attachments.cpp` and
`Modding/ModRegistry.cpp` linked, or the engine static library that owns them.
Add the marker
`entity_animation_smoke.marker`, compiled `shaders/*.spv`, and the two sky PNGs
beside the executable; point PATH at the release `bin/engine`, `bin/depend`, and
vcpkg DLL directories. Enable synchronization validation with
`VK_LAYER_ENABLES=VK_VALIDATION_FEATURE_ENABLE_SYNCHRONIZATION_VALIDATION_EXT`.
The runner is intentionally excluded from automatic test discovery. Missing
block-model cache log messages are expected in its minimal entity-only package;
the test specifically rejects Vulkan VUID and synchronization-hazard messages.

## Batch 2: CPU preparation and independent updates

- [x] Resolve model, material, and clip names to resource handles at change boundaries.
- [x] Reuse model/material groups while positions and animation times change.
- [x] Separate GLB instance updates from legacy entity and ground-item mesh updates.
- [x] Keep dynamic upload buffers mapped while their allocation is alive.
- [x] Verify content reload invalidates every resolved resource reference.

Batch 2 uses renderer-local numeric model/material binding indices and
model-local clip handles. Incoming names are compared to the previous input;
unchanged bindings reuse the resolved model pointer, atlas region, and clip.
The draw-order vector is sorted only when the input model/material layout or
instance count changes. Clip bindings also cache channel-to-node indices for
the CPU fallback. Reload and shutdown invalidate resolved pointers and clips.

Legacy and ground meshes have separate signatures and GPU ownership. GLB-only
motion does not invalidate either CPU mesh. Ground changes do not invalidate
the legacy mesh. Compatibility callers can still upload a combined mesh; the
next snapshot update replaces it with separate meshes before drawing them.
Mapped instance and fallback pose allocations are flushed before submission
and unmapped before their allocations are replaced or destroyed.

Validation on 2026-10-10: the final `NewColonyRenderer` release target built.
The saved manual runner compiled and all six tests passed (three cache/pose,
two update-signature, one Vulkan integration). The integration test checks
group reuse, missing clips, material changes, 202 visible instances, CPU pose
fallback, mapped-buffer growth, content reload, world cleanup with both
capacity options, and SSAO/non-SSAO paths. Upload counters verify independent
mesh updates; synchronization validation reported no VUID or hazard messages.
The full release build was attempted but stopped in unrelated
`Simulation/Detail/EntityBodyCollision.hpp:204,206`: a const Vec3 is passed to
`contact_coordinate(Vec3&, u8)`. It is not a successful full-engine build.
No FPS or CPU-time improvement is claimed until Batch 3 measurement.

## Batch 3: measure and choose scaling work

- [x] Measure entity CPU preparation, upload bytes, draw calls, animation storage,
      culled instance counts, and GPU draw time with a fixed camera.
- [x] Add repeatable static, animated, and mixed population benchmarks.
- [x] Run the final optimized benchmark including shared appearance variants
      and fresh/reused snapshot collection comparisons.
- [x] Reuse snapshot instance lists, strings, and appearance arrays across frames.
- [x] Reuse the rotation/scale basis of consecutive entities with equal values;
      update each translation separately, avoiding repeated trigonometry.
- [x] Grow immutable GPU tables by copying the existing GPU prefix and staging
      only new poses/colors; retain the copy source until a consumer fence completes.
- Distance LOD is excluded by the owner from this goal.
- [x] Add GPU culling and indirect draws, preserving CPU fallback and adaptive selection.
- [x] Replace 64-byte transforms with 48-byte affine rows; 60-byte instance stride
      includes the pose offset, packed tint, and appearance offset.

`Renderer::entity_render_stats()` exposes CPU input/preparation time, delayed
GPU entity-draw time, upload bytes, animation/appearance table bytes, visible
and culled counts, draw calls, and CPU pose fallback instances. The snapshot
entry point includes collection in the CPU input timer. The compatibility
vector entry point excludes caller argument construction/copy; the benchmark
also records the whole call separately. CPU preparation includes frustum
checks, buffer writes, and changed table preparation. GPU timestamps bracket
the entity draw interval and can include overlap with preceding GPU work.

The benchmark uses a fixed camera and 256x256 hidden window, 100/1,000/10,000
entities, 100% or 10% visible populations, static/animated/mixed playback plus
animated entities with eight appearance variants, 30
warmup frames, and 60 measured frames per case. Validation is disabled during
measurement and enabled separately during correctness smoke testing. A
three-vertex, two-node fixture isolates instance scaling. Input paths compare
preconstructed vectors, reused snapshot collection, and fresh snapshot collection
using the same collector and complete-call timer. These results cannot
establish real-game FPS, complex mesh cost, overdraw cost, or a general LOD
threshold. LOD and GPU culling decisions need representative content as well.

## Appearance integration

- [x] Add whole-instance RGBA8 tint without rebuilding geometry.
- [x] Add up to 16 named GLB node subtree tint/visibility overrides.
- [x] Share GPU colors between identical appearance variants, resolved after culling.
- [x] Preserve appearances through prototype data, saves, and network snapshots.
- [x] Expose guarded Lua tint/part setters and clearing.
- [x] Use one candidate-based JSON parser for prototype and saved appearances.
- [x] Reject malformed counts, duplicate nodes, and invalid visibility values.

The packed color convention is `0xAABBGGRR`. Parent/child colors multiply and
hidden parents hide their descendants. Node overrides coexist with independent
GLB assemblies; see [entity assembly](entity-assembly.md). Appearance
variants share the immutable animation buffer's capacity and lifetime system.
The visual direction/appearance review is complete per the project owner's
confirmation; no additional visual acceptance is required for this batch.

## Extended capabilities and their performance constraints

The following capabilities are implemented in Batch 6. Their bounded formats
and separate rigid path preserve the shared-playback performance model:

- GPU skinning: compile joint indices/normalized weights and inverse bind
  matrices, bake joint palettes and conservative animated bounds, and use a
  separate skinned vertex format/pipeline so rigid meshes retain their compact
  path. Account for each mesh node's bind transform when deriving palettes.
- Morph targets: compile immutable position/normal deltas and baked weight
  tracks; bound the active target count and benchmark buffer reads before
  enabling them for large populations.
- Clip transitions and procedural look-at: evaluate/blend local TRS and then
  compose the hierarchy. Interpolating final world matrices is not a correct
  replacement for quaternion interpolation and hierarchical composition.
  Retain shared baked playback for entities that do not need dynamic poses.
- GPU culling/indirect draws: compare CPU preparation against
  GPU geometry cost using representative scenes and multiple model/material
  batches; preserve the existing CPU frustum fallback and avoid GPU readback.

GPU compute pose evaluation is a separate decision for blending, skinning, or
procedural poses. Benchmark it against shared baked poses before adoption.
Compilation and focused tests establish correctness, not an FPS improvement.

## Batch 4: independent GLB assemblies and material resources

Validation on 2026-10-10: complete single-job clean release compilation and
final incremental compilation passed. All 24 focused tests passed with clean
Vulkan synchronization validation; the 30-case exported-assembly benchmark
passed. The project-wide suite, live multiplayer, and full-world save/load
round trip were not run. See the Batch 4 section of the benchmark report.

- [x] Add 16 bounded independent GLB outfit slots, socket and common-rig binding.
- [x] Allow invisible node/animation rigs to drive fully assembled entities.
- [x] Compose/cache immutable geometry and poses once per structure, independent of tint.
- [x] Share immutable ECS binding structures across snapshots and reuse collected names.
- [x] Precompile prototype assemblies after all input model caches at startup.
- [x] Key dynamic assembly caches by structure and input NCEM contents.
- [x] Preserve slots through prototype, save, network, snapshot, and guarded Lua APIs.
- [x] Compile embedded/external base-color images and sampler/alpha state into NCEM v6.
- [x] Render per-material sRGB textures, share images/samplers across outfit resources.
- [x] Preserve body atlas overrides while parts retain their own materials.
- [x] Handle opaque, mask, and globally depth-sorted entity blend draws.
- [x] Generate mipmaps once at upload and correct reflected/nonuniform normals/winding.
- [x] Bound shared appearances to 256 variants/model; use frame-local overflow palettes.
- [x] Add submission CPU timing and exported multi-model assembly benchmarks.

The combined resource approach uploads one entity instance per outfit and
shares poses across its population. Different structures store separate
combined geometry; at the end of Batch 4, residency/eviction and disk-generation
cleanup remained work. Their Batch 5 source status is recorded below.
Transparent entity draws are individually sorted and cannot retain the same
submission scaling as opaque batches. Full PBR, weighted skinning, morph,
crossfades, procedural look-at, and terrain-wide transparency ordering remain
outside this batch. Authoring and API details are in `entity-assembly.md`.

## Batch 5: runtime input, residency, and asynchronous preparation

The work was ordered by the measured Batch 4 costs. The earlier manual-only
choice was superseded by explicit acceptance authorization. Current validation
is recorded at the top of the benchmark report; historical notes below describe
the earlier source handoff and failed build attempts, not current restrictions.

- [x] Collect snapshot instances in place and report binding/clip/appearance
      changes directly, removing the second full comparison and scratch list.
- [x] Preserve unchanged strings and appearance entries; distinguish motion,
      playback time, instance tint, slot color, and structural changes.
- [x] Cache eight exact orientation/scale bases per collection, including
      interleaved populations; bound the cache and preserve individual positions.
- [x] Expose input change counters and add focused collection/GPU regression checks.
- [x] Compile and run the focused checks under the explicit acceptance authorization.
- [x] Repeat the exported-assembly benchmark and record measured input costs.
- [x] Add model/resource residency accounting, budgets, and unused-resource eviction.
- [x] Retain evicted geometry/materials until all referencing GPU submissions finish.
- [x] Reclaim unused bindings and animation/appearance table space without
      invalidating visible instance offsets or in-flight descriptors.
- [x] Prepare dynamic assemblies on a bounded worker queue, with explicit
      prewarming, duplicate-request sharing, and reload/shutdown cancellation.
- [x] Bound retained CPU preparation results and per-frame GPU upload work.
- [x] Pass owned prototype model/outfit prewarm hints across the content boundary;
      publish only on successful commit and prepare before the first entity snapshot.
- [x] Clean obsolete generated assembly caches using enabled source dependencies,
      input signatures, compiler revision, age and disk budgets.
- [x] Add representative distance/complexity/appearance-diversity benchmark cases.
- [x] Measure those cases and implement GPU culling/indirect submission with
      measured CPU fallback/adaptive policy. Distance LOD is excluded.
- [x] Author full-world appearance save/load and native snapshot capture/wire/delta/
      client publication checks, including color-only reuse and outfit removal.
- [x] Normalize authoring prefixes across precompile, prewarm, library and draw bindings.
- [x] Author an explicit manual two-process TCP appearance/rejoin check.
- [x] Verify full-world appearance save/load and actual multiplayer replication.

The owner confirmed on 2026-10-11 that the DLL split of networking, preprocessing,
general IO, scripting, navigation, generation, GPU simulation, and RML is complete
and compilation validation is in progress. Entity compilation/preparation belongs to rendererassets;
GPU ownership and submission retirement remain coordinated by Renderer.
Shared build files, exports and Engine layout must be reviewed against current
work from the other session. Do not run concurrent builds in the same directory.
Visual acceptance is already complete and is not repeated.

The earlier module-split scope gate was lifted by the owner on 2026-10-11.
The subsequent source work extends RendererContentAdapter (engine-owned registry
capture), RenderContent/Renderer (committed hints), EntityAssembly/EntityModelCache
(rendererassets), ModPreprocessor (content), and FileIO (io). No shared CMake
ownership or module exports from the other session were reverted. Renderer header
layout changed, so dependent Engine objects still need a coordinated rebuild;
copying a new renderer DLL beside old Engine objects cannot validate this batch.
The acceptance build uses an independent temporary directory. Lua/simulation owners do not call Renderer:
dynamic outfits reach the existing shared request queue through immutable snapshots.

Batch 5 implementation uses soft budgets: active models are protected, and
retired GPU use is tracked separately. The default limits are 256 MiB of
estimated model storage, 128 MiB of texture allocations, 64 MiB of shared
poses/colors, 256 cached models, 600 idle frames, 60-frame maintenance, and
16 evictions per pass. GPU preparation defaults to two models / 8 MiB per frame,
with one oversized-first resource allowed to avoid starvation. CPU preparation
uses one rendererassets-owned worker, at most 32 deduplicated requests and a
64 MiB ready-data threshold; a single in-progress resource can exceed the
threshold. Reload, capacity-releasing world cleanup, and shutdown cancel queued
work and join the current job before releasing asset state.

Model retirement captures upload completion tokens, including queued batches,
and the current frame-fence mask. Later streaming uploads cannot prolong those
tokens. Texture weak keys do not hold images alive; active and retired material
owners retain them. Table compaction always replaces the immutable GPU table,
while submitted slots retain the old table and offsets. Cached appearance/clip
offsets are invalidated when changing the fallback/primary model.

`NC_RENDERER_ONLY_SMOKE` on the manual runner excludes Lua, network and
prototype integration checks. It uses Renderer/Core and their current leaf
dependencies; the completed split moves FileIO into NewColonyIO (io.dll),
publicly linked by NewColonyCore. Manual linking must include its io import
library and NC_IO_SHARED definition. The coherent acceptance rebuild covers
the current split and its consumers. New checks cover
queued-copy retirement under continuous later uploads, shared texture lifetime,
binding churn, table compaction/budget changes, bounded async requests/uploads,
outfit fallback, and cancellation; those GPU cases passed.
Snapshot identities are preserved; UUID changes clear a pending fallback even
when its primary binding is otherwise unchanged. Anonymous direct-vector
callers can supply identities to distinguish replacement from slot reuse.
`EntityRenderBenchmark.SpatialOutfitDiversity` adds 12 nonoverlapping spatial
cases: 1,000/10,000 entities, 1/16/64 structures, and camera distances 80/320,
with four parts, 32 colors and measured visible counts. All 12 spatial cases and
the 30-case assembly repeat passed in the coherent package. Eight additional
forced CPU/GPU cases support the default adaptive culling policy; details and
limits are in the benchmark report. Distance LOD is excluded.

## Batch 6 acceptance

- [x] GPU frustum culling, visible-instance compaction and indirect submission.
- [x] Adaptive CPU/GPU selection and device-capability fallback without blocking readback.
- [x] Four-influence weighted skinning with mesh-specific inverse-bind palettes.
- [x] Eight-target position/normal/tangent morph format and animated weight channels.
- [x] Local TRS blending and bounded procedural local yaw/pitch.
- [x] Core glTF metallic-roughness PBR maps, two UV sets and correct image color spaces.
- [x] Pose state across prototypes, guarded Lua, snapshots, actual saves and full/delta TCP replication.
- [x] Coherent Release compilation, 64 CPU/integration checks and five GPU checks.
- [x] Actual shader-deformation math comparison and clean synchronization validation.
- [x] Current 50-case performance repeat and documented costs/limitations.

This closes the accepted plan scope. Imported HDR environments, broad KHR
material extensions and compute evaluation of dynamic animation controls remain
outside this supported contract. Visual acceptance was already confirmed.

### Historical cache/import follow-up after the external build failure

The other session's incremental DLL validation failed at EntityModelCache.cpp:332
with an undeclared `source`. This was an error in the new byte-decoder extraction:
source-dependent image validation had remained inside the source-independent
function. The renderer task corrected the source, preserving image invalidation
in the source-aware entry point and publishing the output only after validation.
No follow-up compilation or test has been run by this session; the earlier
rendererassets.dll artifact cannot establish that this correction compiles.

The same follow-up makes compilation hash/import the same main GLB bytes and
fingerprint pinned external geometry buffers (`buffers[].uri`) as well. Changing
or removing an external BIN invalidates a source-aware cache read. The main GLB
and each external BIN are read once for compilation, and tinygltf reads its
geometry from those pinned buffers. External images remain validated through
the NCEM material path/hash; their hash comes from the encoded image bytes that
actually produced the cached RGBA, without reopening the image for hashing.
NCEM stays version 6. Embedded-buffer files retain their previous source hash;
older caches with external BIN dependencies are regenerated at preprocessing.

Windows source directories and decoded image URIs use UTF-8-safe native paths.
File-size callbacks stat resources rather than rereading their contents. New
source checks cover source-aware versus pure-byte dependency policy, preservation
of output on failed validation, pinned main GLB and external BIN imports, BIN
replacement/removal, and a UTF-8 source directory with a percent-encoded image URI.
All remain authored checks, not test results. These changes affect preprocessing
and CPU asset preparation; no per-instance source dependency scan was introduced.

### Historical resource identity and live TCP check source handoff

Source audit found that prototype prewarming retained `gltf:` while snapshot
collection removed it. Library bare-model keys and assembly keys now use the
same authoring-prefix normalization, including attachment names. This prevents
separate requests/resources/caches for the prototype and its actual draw binding.
The assembly compiler revision is now 4, with old records pruned/regenerated.
The alias CPU case and asynchronous GPU case have been updated; neither ran here.

`Tests/Manual/entity_appearance_network_smoke.cpp` provides separate server/client
roles over authenticated localhost TCP. The source CMake target
`NewColonyEntityNetworkSmoke` is excluded from ALL and CTest, and is available
only in a test-enabled configuration. It uses public capture/apply methods and
the socket worker, rather than injecting encoded packets into private methods.
Acknowledged phases cover socket/rig outfits, body/node/slot colors, visibility,
structural replacement/removal, entity deletion, a new UUID and fresh-session
rejoin with a complete authoritative snapshot. Client checks include collected
render inputs and geometry reuse for color-only changes. Directions and limits
are in the benchmark report. This source is not a passing multiplayer result,
and it does not replace the GPU correctness cases or full gameplay validation.

### Historical completion-gate audit (2026-10-11, 09:20 local)

The latest inspected release renderer.dll is dated 08:41:38 and rendererassets.dll
08:38:51. Renderer/EntityModel sources changed at 09:12:53; GltfLoader and the
cache/import corrections changed at 09:02:35. Those DLLs therefore do not validate
the current sources. No ninja/cl/MSBuild, game/test process or manual network-check
process was live at this observation. The new network-check executable was not
present in build-tests/bin. This is not a verified wait on a running build.

| Completion gate | Current source/check entry | Evidence still required |
| --- | --- | --- |
| Coherent build across Renderer and dependent DLLs | Current asset/backend/resource/renderer boundaries; cache decoder correction and revision-4 identities | Successful build covering current sources and dependent objects |
| Cache/import/assembly correctness | EntityModelCacheTest, EntityAssemblyCache, material cases and prefix-alias checks | Passing current CPU cases, including external GLB/BIN/image changes and rejected/corrupt inputs |
| GPU lifetime, async preparation and reload | EntityResourceResidency, EntityAsyncPreparation, EntityAnimationGpuSmoke, EntityAssemblyMaterials | Passing current hidden-window cases with clean Vulkan synchronization validation |
| Full-world appearance persistence | EntityAppearanceIntegration.WholeWorldSaveRestoresAssemblyAndCollectsIdenticalRenderInput | Successful actual save/load round trip and matching collected input |
| Native appearance replication | NetworkSnapshotAppearance and NewColonyEntityNetworkSmoke server/client roles | Passing native full/delta cases and both separate TCP processes reporting PASS/exit 0 |
| Runtime performance and conditional scaling changes | Existing assembly benchmark plus SpatialOutfitDiversity and entity_spatial_benchmark.csv | Current measured CPU/GPU/upload/residency results; decide LOD/culling/indirect work against those results |
| Visual acceptance | Previously confirmed by the owner | Already accepted; do not repeat |

At that observation the named source entries had only been inspected; their presence was not a passing
result. No current build/test/benchmark evidence was supplied to this session.
The owner selected manual verification and did not authorize agent-run builds
or tests. The objective remains unproven until those gates have actual results;
do not mark the plan complete or infer a performance improvement from source
inspection. The subsequent explicit acceptance supersedes this historical gate
status; current results are in the benchmark report.
