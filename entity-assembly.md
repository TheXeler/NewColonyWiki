# GLB entity assembly

Follow-up acceptance (2026-10-11): current source format is NCEM v9 / assembly
revision 8, with eight skin influences and 64 morph targets. The final Renderer
sweep passed all 47 data/GPU checks, including wide-Morph assembly, HDR/KHR
materials, scene transmission, MSAA/SSAO recreation, indexed aggregate drawing
and per-model adaptive pose selection. The final complexity/submission benchmarks
also passed (32 and 16 measured scenarios), together with eight culling cases.
The latest rerun corrected LOAD resume synchronization and test DLL staging;
all 47 checks subsequently passed. Eight equal-wall-window whole-game comparison
runs passed as well; simulation/UI publication dominate the thousand-colonist
load. The complete project test suite remains a separate pending gate in the
benchmark report; earlier Batch 6 results below are historical.

Entity appearance can be assembled from independent GLB assets. `visual.model`
is the body or an invisible node rig; `visual.attachments` selects up to 16
parts. A part can contain an entire subtree and multiple materials. The same
mechanism serves hair, clothing, body sections, hats, weapons, and backpacks;
there is no entity-specific renderer implementation.

## Authoring and prototype data

Publish each GLB under `assets/models/entities/` in its owning mod. Use the
same world-unit scale and coordinate convention for all pieces: Y is up and
local -Z is the project's visible front. Assembly offsets stay in model space;
the entity's world transform and front-direction conversion apply once after
composition. An invisible rig GLB may have nodes and animation without meshes;
it needs attached geometry to produce a drawable entity.

```json
{
  "type": "visual",
  "model": "gltf:my_mod/colonist_rig",
  "attachments": [
    { "slot": "body", "model": "gltf:my_mod/body", "rig": true },
    { "slot": "shirt", "model": "gltf:my_mod/shirt", "rig": true, "tint": 4294923605 },
    { "slot": "hair", "model": "gltf:my_mod/hair_short", "node": "head", "tint": 4281558681 },
    { "slot": "weapon", "model": "gltf:my_mod/axe", "node": "right_hand",
      "translation": [0, 0.1, 0], "rotation": [0, 90, 0], "scale": [1, 1, 1] }
  ]
}
```

The example belongs inside the entity's `capabilities` array. Slot names are
case-sensitive ASCII letters, digits, underscores, or hyphens, at most 64
bytes, and must be unique. Duplicate slot hashes are rejected. Model references
use the usual `gltf:mod/name` form without an extension. Runtime JSON rejects
embedded NULs, traversal paths, nonfinite transforms, invalid types, duplicate
slots, and more than 16 parts.

| Part field | Default | Meaning |
| --- | --- | --- |
| `slot` | Required | Stable outfit slot; replacing it swaps that part. |
| `model` | Required | Independent GLB resource reference. |
| `node` | Empty | Body socket name. Empty attaches at the scene origin. |
| `rig` | `false` | Bind each part node to the body's node with the same name. |
| `translation` | `[0,0,0]` | Local offset in model/world units. |
| `rotation` | `[0,0,0]` | Local XYZ Euler angles in degrees. |
| `scale` | `[1,1,1]` | Local scale; every axis must be nonzero. |
| `tint` | `4294967295` | RGBA8 tint, `0xAABBGGRR` in Lua/C++. |
| `visible` | `true` | Hide/show the entire part without changing geometry. |

`rig:true` and a nonempty `node` cannot be combined. Both modes are rigid
node binding, not weighted skinning:

- **Socket mode:** author the part around its local mount origin. Its entire
  node hierarchy inherits the named body's node. A hat follows the head; an
  axe follows a hand socket. Missing or ambiguous sockets reject the assembly.
- **Common rig mode:** author clothing/body pieces in the body's common bind
  scene. Every part node must have a unique matching body node name. Geometry
  preserves its bind-scene placement and follows that body's node animation.
  This also works when a part's nodes are ordered differently from the body.

The body/rig is the animation authority. Attached GLBs' independent animation
clips are not merged; attach their rigid geometry to body nodes. Missing or
ambiguous rig names reject the assembly rather than silently leaving pieces
in their bind pose. Fully assembled geometry participates in baked-frame
bounds, so a large or offset part remains visible even if the body's own
geometry is outside the frustum. Hiding parts keeps these bounds conservative.

## Runtime outfit changes

These server-authorized APIs require a live entity with `EntityVisual` and
return a boolean. The setter accepts one part as a JSON string, using exactly
the prototype parser above.

```lua
engine.ecs.set_visual_attachment(entity_uuid,
  [[{"slot":"hair","model":"gltf:my_mod/hair_long","node":"head","tint":4281558681}]])
engine.ecs.set_visual_attachment(entity_uuid,
  [[{"slot":"weapon","model":"gltf:my_mod/axe","node":"right_hand","visible":false}]])
engine.ecs.remove_visual_attachment(entity_uuid, "weapon")
engine.ecs.clear_visual_attachments(entity_uuid)
```

The existing `set_visual_tint` and `set_visual_part` APIs remain available.
`visual.parts` can target a body node, a slot group such as `slot:hair`, or a namespaced part
node such as `hair/piece`. Part tint/visibility applies through its slot group;
node overrides multiply with inherited colors. Use the attachment setter to
replace its model or offset, or to modify its own tint and visibility.
`clear_visual_parts` clears node overrides; `clear_visual_attachments` removes
the independent models. They affect different state.

The prototype, JSON save, render snapshot, and network snapshot carry the same
part state. Old saves without `attachments` default to an empty assembly.
Network decoders validate counts, strings, transforms, booleans, and duplicate
slots before applying data. `NETWORK_VERSION` remains 1 as required by the
project; peers must use the same current engine protocol implementation.

## Compilation and resource sharing

Source GLBs compile to NCEM version 8. Materials retain decoded RGBA pixels,
sampler/alpha/PBR state, and external-image hashes alongside rigid geometry,
optional deformation data, nodes, channels, baked poses, and bounds. A changed external image invalidates the
source cache at startup. Runtime drawing does not decode PNGs or parse GLBs.

After all enabled mods' model caches are complete, startup compiles assemblies
declared in entity prototypes. Result files live in
`generate/entity_assemblies/<content-hash>.ncem`. Their key includes geometry
bindings/transforms and all input NCEM contents, including decoded textures.
The assembly compiler revision is also part of that key, so changes to
composition rules invalidate old assembled results.
Changing a dependency produces a new result; changing tint/visibility reuses
the geometry key. A new Lua-created structure queues preparation on its first
resource binding and then reuses that disk cache and shared GPU model. Default
runtime preparation is asynchronous and described below.

Composition combines geometry, namespaces nodes, remaps animation/joint/morph indices,
and bakes the combined pose hierarchy once per structure. All instances with
that structure share its buffers, materials, poses, and bounds; a multi-part
outfit still uploads one 60-byte entity instance rather than a matrix for every
part. Opaque/masked submeshes draw in model/material batches. Continuous
same-material ranges merge where possible. Composition deduplicates equivalent
part materials, including pixels and sampler/alpha state, before merging ranges.

The ECS appearance caches its immutable binding structure as a shared object.
Snapshots preserve that reference; the collector reuses model names and offsets
while only tint/visibility and animation time change. Mutating an outfit through
the validated setters, JSON loader, or network apply refreshes the structure.
C++ callers editing the public attachment vector directly must call
`refresh_attachment_geometry()` after structural edits; a color/visibility-only
edit does not require it.

This choice reduces per-frame transforms and submission but stores combined
geometry per distinct outfit structure. An unlimited set of unique structures
can therefore increase model/cache memory. Runtime model residency is budgeted;
generated disk generations are pruned during successful preprocessing.
Prefer reusable outfit structures and vary colors as instance state.

Snapshot collection now updates the retained instance list in place. It reports
resource binding, clip, and appearance changes to Renderer so they do not need
a second comparison pass. Unchanged model/material/clip strings and appearance
entries retain their storage; motion, playback time and whole-instance tint
do not invalidate those bindings. Eight exact orientation/scale bases are
cached per collection, including interleaved orientations, while positions
remain independent. Direct vector submission retains its comparison path.
`EntityRenderStats` includes `input_binding_changes`, `input_clip_changes`, and
`input_appearance_changes` for the most recent input update. These report input
changes; content reload can separately invalidate resolved GPU resources.
The current acceptance results and measurements are recorded in the
[benchmark report](entity-rendering-benchmark.md); older measurements retain
their batch labels and do not describe the current implementation.

## Residency and preparation

`RenderConfig::entity_resources` and `Renderer::set_entity_resource_budget`
control Renderer-local budgets. Defaults are 256 MiB estimated model storage,
128 MiB GPU texture allocations, 64 MiB shared animation/color storage, 256
cached models, 600 idle frames, maintenance every 60 frames and at most 16
evictions per pass. Model storage includes requested geometry bytes and retained
CPU arrays; allocator/driver bookkeeping is not included. Texture storage uses
the actual Vulkan image memory requirement, including mip levels and padding.

Budgets are soft: models used by current input or an outfit fallback remain
protected. Excess active storage is reported by `resource_budget_exceeded`.
Texture pressure also evicts unused models in bounded batches. Once detached
from the cache, old geometry and material descriptors wait for their captured
frame fences and upload completion tokens, including queued buffer-copy batches.
Future streaming uploads do not extend that retirement point. Weak texture
keys do not keep images alive after all active/retired material owners release
them. Unused binding handles are compacted; removing cached poses/colors builds
a new immutable table, while submitted slots retain the old table and offsets.
Capacity release, content replacement and shutdown flush any queued CPU upload
batch before waiting for device idle and destroying its destination resources.

Default `RenderConfig::async_entity_preparation` is true. One worker owned by
rendererassets performs cache reads and dynamic composition. At most 32 requests
are retained, equivalent structures share one request, and new CPU work pauses
at a 64 MiB ready-data threshold. One current resource may exceed that threshold;
it is not a hard process-memory limit. Visible bindings take priority over
unused prewarming hints. Queued/unused results expire; reload, capacity release,
and shutdown discard queued work and join the current job before replacing
asset state. Cancellation takes effect between jobs rather than interrupting
an in-progress cache write.

`Renderer::prewarm_entity_model(model, attachments)` starts CPU preparation
without changing ECS state. GPU ownership stays on the render thread: default
limits are two new models / 8 MiB of geometry and decoded-image payload per frame.
One oversized-first resource is allowed to avoid starvation. Images are shared
when already resident, and texture initialization waits for its own submission
fence. It does not wait for every later queue submission. First-time entities
wait for their resource; a replacement outfit keeps the previous drawable
binding until the new one is ready. Model-specific clip/color offsets are then
invalidated and resolved for the replacement. Explicit synchronous compatibility
mode remains available for callers and controlled benchmarks.

Snapshot collection carries the entity UUID into `EntityModelInstance::entity`.
Replacement fallback is reused only for the same identity; reordering snapshot
rows cannot display another entity's previous outfit. Anonymous direct-vector
callers retain positional slot semantics and should provide identities when
reusing/reordering slots for different entities.

`EntityRenderStats` additionally reports `resident_model_bytes`,
`resident_texture_bytes`, `retired_model_bytes`, `resident_models`,
`resident_textures`, `retired_models`, `evicted_models`, `binding_count`,
`pending_model_preparations`, `prepared_model_bytes`, and `uploaded_models`.
Texture totals include the white fallback and images retained for retirement;
pending preparation counts include ready results awaiting GPU upload. Model
retirement bytes are reported separately from cache residency. The GPU residency
and asynchronous-preparation checks passed with synchronization validation on
2026-10-11. Content lifecycle hints and dependency-based disk cleanup are
implemented as described below.

## Content prewarming and generated disk cache

The engine-owned RendererContentAdapter captures prototype model names and
attachment structures in `RenderContent::entity_models`. Renderer stages at most
32 distinct geometry hints with the candidate content, and `PreparedContent::commit`
only swaps owned data. An abandoned candidate cannot start its jobs. The next
render frame enqueues committed hints even with no entities or with an entity-hidden
view. Hints prepare CPU data only, without allocating invisible prototype GPU
geometry. They are optional and bounded; models outside these 32 hints are still
requested normally by snapshots. Actual bindings take priority over unused hints.
Lua, save loading and network publication continue to mutate ECS on their owner
and publish immutable snapshots, without calling Renderer from those threads.

Each `generate/entity_assemblies/<hash>.ncem` has a `<hash>.deps` record. This local
binary record contains NCAD1 magic (metadata version 1), assembly compiler revision
7, the assembly hash, and up to 17 model-name/content-hash dependencies (body plus
16 parts), followed by a checksum. Integer fields are little-endian 64-bit; names
use a 64-bit byte length followed by their UTF-8 bytes. Dependency hashes cover
the complete input NCEM files, including decoded images and baked animation.
NCEM is version 8; this sidecar does not change the shipped GLB format.

After every successful entity-model/declared-assembly preprocess, cleanup compares
records against NCEM paths derived from the enabled source GLBs. Leftover generated
files from removed or disabled sources do not count as live inputs. A changed
dependency, earlier compiler revision, corrupt/missing metadata, or an orphan
sidecar is removed. Valid combinations created dynamically remain eligible even
when no prototype declares them. Reusing an assembly refreshes its access timestamp
once at CPU resource preparation, without per-instance/frame filesystem operations.
Entries older than 30 days expire; the remaining oldest entries are pruned to
512 MiB (including sidecars) and 2,048 combinations. `EntityAssemblyCachePolicy`
permits other limits. Cleanup is a preprocessing operation, never render-frame
maintenance; failures are reported and do not reject usable content.

Composition and cleanup share a rendererassets-local mutex. Each dependency is
read once per distinct input name, and both hashing and decoding consume that
pinned byte buffer. NCEM and metadata writes publish same-directory temporary
files through `io::write_binary_file_atomic`, preserving the old destination on
failure. A crashed publication between the two files may leave an untracked cache,
which the next successful preprocessing removes/rebuilds. Legacy entries acquire
metadata on reuse. These are disposable caches; publication does not promise
filesystem crash durability or coordination between separate game processes.

Source-aware NCEM freshness additionally fingerprints the main GLB and its
external geometry-buffer URIs. Preprocessing imports the same main/geometry
bytes used by this fingerprint, so replacing a BIN during compilation cannot
stamp newer geometry with the earlier input hash. Changes/removal invalidate
the cache on the next source-aware check. External base-color images retain
their own path/content-hash checks; the image hash is computed from the encoded
bytes actually decoded into cached RGBA. Image URI percent escapes and Windows
UTF-8 source directories are handled through the same URI/native-path conversion.
Pure NCEM byte decoding and runtime cache reads with an empty source remain
independent of those original GLB/BIN/image files. The compile error from the
initial decoder extraction was corrected; the coherent Release build and
source-aware/pinned-input CPU checks passed on 2026-10-11.

The `gltf:` authoring prefix is removed from resource identity consistently in
prototype hints, snapshot collection, model-library lookups and assembly keys.
For example, `gltf:fixture/body` and the collected name `fixture/body` share one
preparation request and GPU model. Prefix aliases on attachment models likewise
share one generated assembly. Canonical identities were introduced in revision
4 and retained in revision 5; earlier assembly files are regenerated/cleaned during successful
preprocessing. Prototype prewarming must match the actual snapshot's resource
key to help first-time rendering; alias coverage passed in the CPU/GPU checks.

Common appearances share an immutable GPU color table. Each model retains at
most 256 historical combinations; additional colors use a frame-local palette
in the persistently mapped fallback buffer, deduplicated within that frame.
This prevents continuous tint changes from exhausting the immutable table.
Those colors need CPU upload each frame; common variants retain their shared
upload-once path. Pose/palette allocations respect the device's storage range.

## Materials

### Extended rendering (2026-10-11)

The current implementation uses NCEM v9 and assembly revision 8.
Models with JOINTS_0 / WEIGHTS_0 and optional JOINTS_1 / WEIGHTS_1 use eight normalized influences and a
mesh-specific joint palette. Inverse bind matrices include the mesh node's
bind-space conversion; separate meshes using one skin retain separate palettes.
Morph targets support up to 64 position/normal/tangent deltas, authored
defaults and STEP/LINEAR/CUBICSPLINE weight channels. Sparse float accessors are
decoded during compilation. These limits are enforced; JOINTS_2 and larger
target sets are rejected rather than silently discarded. Rigid models do not
allocate the extra deformation stream.

Core metallic-roughness PBR channels include base color, metallic/roughness
(G/B), normal XY scale, occlusion R/strength and emissive RGB. Base/emissive
images use sRGB; the other maps use linear UNORM. TEXCOORD_0 and TEXCOORD_1
selectors and each texture's sampler state are preserved. Lighting uses GGX,
Smith visibility, Schlick Fresnel, sun and procedural sky terms. This is the
engine's procedural environment lighting. Imported HDR environments and the
broader KHR material-extension family are outside the supported material contract.

`visual.pose` contains `secondary_animation`, `secondary_time`, `blend` (0..1),
`look_node` (authored node name), `look_yaw`/`look_pitch` (local radians), and
`morph_weights` (up to 64 coefficients). Optional 64-bit `morph_mask` selects which
coefficients override authored/animated values; without it an array selects all
its entries. Save files write `look_node_id` as the stable node-name hash.
Prototype and Lua inputs reject malformed values before publication.

Lua uses `ecs.set_visual_pose(entity_uuid, json_string)` and
`ecs.clear_visual_pose(entity_uuid)` under the existing authority guard.
Setting a pose replaces the control state; it does not change outfit geometry.
For example:

```lua
ecs.set_visual_pose(entity_uuid,
  '{"secondary_animation":"idle","secondary_time":0.2,"blend":0.5,' ..
  '"look_node":"head","look_yaw":0.3,"morph_weights":[0.8]}')
```

Blend translation/scale linearly and rotation with quaternion slerp in local
space, then compose ancestors. Procedural look-at applies a bounded local
rotation after blending. The caller controls blending progress/times; the
renderer does not infer gameplay transitions. Dynamic palettes and their bounds
are shared by exact model/clip/time/control identity within each frame. Larger
populations with enough unique controls can use compute track sampling, local
blending/look, hierarchy composition and vertex-reduced local bounds. The GPU
culler consumes those bounds without CPU readback; CPU culling retains shared
CPU pose evaluation. Ordinary authored playback uses baked shared palettes.
The GPU check evaluates the actual shared deformation GLSL
and compares bind, animated, and blend/look/morph positions with CPU references.

Embedded or external PNG/JPEG base-color images compile to RGBA8. Without a
`visual.texture` override, each GLB material samples its own sRGB image; an
untextured material samples white. A body override preserves temporary legacy
skins and missing-texture behavior, while attached parts retain their own
materials. Identical decoded images with identical sampler state share a GPU
texture across models and outfits.

The renderer handles base-color factors, `TEXCOORD_0`/`TEXCOORD_1`, nearest/linear filtering,
repeat/clamp/mirrored-repeat wrapping, mipmap minification, `doubleSided`, and
`OPAQUE`/`MASK`/`BLEND`. Mip levels are generated once during GPU texture upload
on devices supporting the required blit/filter features. Reflected transforms
preserve winding and normals; nonuniform normals use inverse-transpose
direction. Alpha-mask cutoff comes from the GLB, while explicit hidden parts
discard independently of alpha mode.

The v9 material record additionally preserves KHR_materials_clearcoat,
KHR_materials_transmission, KHR_materials_volume, KHR_materials_ior,
KHR_materials_specular, KHR_materials_sheen, KHR_materials_iridescence,
KHR_materials_anisotropy, KHR_materials_emissive_strength, KHR_materials_unlit
and KHR_texture_transform. Each of 17 texture slots has independent UV set,
offset, scale and rotation. Material parameters upload once with the texture
resource; core scalar factors are indexed by the draw table when batching.
Clearcoat, sheen, film interference and anisotropic GGX use real shading paths.
The RGB film model and sheen energy compensation are approximations, not a
spectral reference-renderer equivalence claim.

Transmission uses a per-frame copy of the resolved opaque scene, with mip levels
for roughness and environment fallback outside the viewport. Volume attenuation
uses authored thickness converted through the full inverse instance/node basis.
The current world scene resolve is LDR: scene refraction inherits its precision
and does not recover clipped HDR highlights. It does not implement offscreen
ray tracing or refract another transparent surface. The capture and depth-store
path is optional; ordinary opaque draws retain the smaller shader variants.

HDR environments are mod-owned Radiance RGBE `.hdr` assets. Preprocessing emits
`generate/<mod>/entity_environments/<path-relative-to-assets>.hdr.ncib` (NCIB v1)
with RGBA16F diffuse convolution, roughness-prefiltered specular mip levels and
the split-sum BRDF LUT. Source bytes, compiler version and options participate in
the signature. Convolution runs during preprocessing, never per render frame.
An entry with type `rendering` can select it:

```json
{
  "entity_environment": {
    "texture": "textures/environment/studio.hdr",
    "intensity": 1.0,
    "rotation": 0.0,
    "priority": 0,
    "active": true
  }
}
```

Rotation is yaw in radians. Highest priority wins, then lexically greatest entry
ID. A missing/corrupt product rejects content preparation and preserves the
current environment. No configured environment reuses material fallback images.

Opaque/masked materials write depth and retain instancing. Blended materials
draw after them, sorted globally by entity depth across model batches, with
depth writes disabled. Adjacent compatible commands can share a multi-draw
submission while preserving that order. Object-depth
sorting does not solve intersecting transparent triangles or correctly sort
entity transparency against every unrelated terrain-transparent pass. Prefer
`MASK` for hair/clothing cutouts when possible.

Rigid and deformed meshes use separate compiled vertex shader variants. Weighted
skinning and morph deltas deform vertices on the GPU. Dynamic palettes are
frame-local and shared across identical controls; compute selection retains the
CPU reference/fallback path. GPU-produced matrix ranges are omitted from CPU
palette uploads. Ordinary playback keeps the shared immutable baked path.

Performance policy: the default GPU controlled-pose threshold is 32 distinct
poses per model in the preceding frame, with CPU sharing below that threshold.
It is intentionally per model: 64 independent models each needing one shared
pose must not trigger the same selection as one model needing 64 poses. Explicit
forced GPU selection remains available for benchmarks. The first complexity
measurements favor compute for 64 independent poses but show regressions for
some one-pose scenes. Exact dynamic-pose sharing always remains enabled.

On devices with shader draw parameters, multi-draw indirect and nonzero indirect
first-instance support, diverse models can share immutable aggregate vertex,
index and deformation buffers. Opaque commands group by shader/material image
resource; indexed draw parameters preserve differing scalar factors and atlas
rectangles. Different image sets still require a descriptor change. This path
does not require bindless textures or allocate one texture array per outfit.
Geometry is copied only when the participating resources change. Frame slots
retain their exact aggregate generation until their fence completes. Aggregate
allocations and retained generations count against the available model budget;
single-model, budget-limited and unsupported-device scenes keep the direct path.

The default adaptive aggregate policy also keeps scenes with fewer than eight
model batches and fewer than 2,048 candidate instances on direct submission.
Five repeated measurements found little consistent benefit for low-population
four-batch scenes. Either enough batch diversity or enough instances can select
aggregation; explicit benchmark configuration can disable this policy.

Opaque submission plans cache their exact model/buffer identities, binding and
instance ranges, UV rectangles, environment and CPU/GPU culling mode. Repeated
frames reuse the plan, and each of the three fence-protected frame slots uploads
its draw table/CPU indirect commands only when the plan version changes. Tint
and pose changes remain in instance/palette streams. Transparent plans rebuild
their global instance order each frame. Content replacement and world-resource
release invalidate the plan and retain existing lifetime guarantees.

## Validation and performance

Use `Tests/Manual/entity_animation_gpu_smoke.cpp` with an isolated temporary
package. Correctness checks cover socket/common-rig binding, invisible rigs,
cached dependency changes, tint-independent geometry keys, JSON/network/Lua,
embedded images, alpha state, mipmap synchronization, palette overflow,
content reload, and frame reuse. Visual acceptance is already complete and is
not repeated. Detailed measured assembly results are recorded in the
[benchmark report](entity-rendering-benchmark.md).
