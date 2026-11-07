# Furniture capabilities and model poses

Furniture behavior is selected by capability Tags. `core:bed` and `core:door`
are content definitions, not special engine object types. The existing red bed
and oak door still use the Minecraft source textures, workbench recipes,
carried finished-item installation and whole-component demolition.

- `c:sleepable` enables the shared Lua sleep behavior.
- `c:toggleable` enables the shared Lua state-switch command.

Declare Tags on a building definition, or on its blueprint blocks. The native
component view combines these Tags once and exposes the same capability set
from every occupied cell. This works for one-cell and multi-cell components;
there is no two-cell admission rule. A Mod sleeping bag uses `c:sleepable` on
its normal building/component definition, with no bespoke Lua behavior. It
still supplies its ordinary model, material and placement definition.

## Sleep

`CoreMod/scripts/systems/furniture.lua` owns selection, exclusive occupation,
arrival, model-state requests, recovery, waking and cleanup. The native AI
exposes general need-site and need-progress callbacks; it knows neither bed
IDs nor sleepable Tags, recovery bonuses or waking thresholds. Existing tasks
carry the selected component identity. No second bed-reservation store is
created. Travel does not recover fatigue. Interrupted, cancelled, damaged or
removed facilities release their users through the Lua behavior.

The defaults require no sleep-specific fields: neighboring access points,
normal recovery, the actor model's `sleep` animation and a derived visual
anchor. Optional content configuration changes these defaults:

```json
"tags": ["c:sleepable"],
"interactions": {
  "sleep": {
    "anchor": [0.5, 0.78, 1.85],
    "animation": "sleep",
    "recovery_multiplier": 1.5
  }
}
```

The red bed uses the example settings. Lua holds its task until fatigue reaches
95, and yields for severe hunger. Exhausted forced sleep retains the existing
on-the-spot fallback. Use points and anchors rotate with the building.

The core player GLB contains the `sleep` clip. Its root pose is authored in the
model animation; the renderer has no sleeping-body rotation. Lua calls the
existing generic `engine.ecs.set_visual_pose` API and restores the original
pose on release. The generic pose contract now also supports world-space
`translation_x/y/z` and `yaw_offset`, which affect rendering without moving
physics. Pose fields use normal appearance save/load and replication.
`engine.ecs.get_visual_pose` returns the complete pose JSON for restoration.
Other actor models supply their own named animations. This uses the existing
named-clip/blending mechanism; it does not add a separate engine sleep state
machine.

## Shared component state

`engine.buildings.component_info(uuid)` provides shared Tags and completeness.
`component_state(uuid)` reads the common inactive/active state.
`set_component_state(uuid, active)` atomically changes all declared state cells
through the existing native block editor. It accepts arbitrary component size,
checks loaded original cells, and rejects a transition into solid occupied
cells. Changing state preserves each cell's orientation. Shared-state and
demolition matching accept the registered variants, without replacing the
original component/building identity.

Declare an alternate state on each affected blueprint cell:

```json
{"block":"example:panel", "active_block":"example:panel_open", "pos":[0,0,0]}
```

Cells without `active_block` remain part of the object and are not rewritten
by a state switch. Variant block definitions supply their model and passability.
The `c:toggleable` Lua command checks player ownership and requests the native
transition. The current `core:door.set_open` command ID remains compatible,
but its handler accepts any object with that capability. Selection of any
occupied cell resolves the original object. Doors do not auto-open for walkers.

## Universal block orientation

Orientation belongs to the existing block-state byte, not block IDs. Models
are authored once. The six original mounting normals retain values 0 through 5;
bits 3 and 4 add a world-Y quarter-turn for vertical mounts. For example,
`up`, `up@1`, `up@2`, `up@3` express the four upright facings. Existing horizontal
mount rotation keeps its normal mapping. Blueprint cells may specify a
`direction` string, and building rotation derives coordinates and orientation.

Block batches now carry an optional orientation and preserve the original
orientation during ordinary state replacement. Cube and custom-model rendering,
region files, terrain packets, and blueprint-library records accept the same
orientation. No `_east`, `_south`, `_west`, `facing_blocks` or `open_blocks`
content families are needed. Network version remains 1; peers need the same
updated binary for the extended appearance payload.

## Execution boundary

This is source implementation documentation. No compilation, tests, static
checks, staging or game execution was performed for this batch. Acceptance
should cover all four facings and chunk boundaries, one-cell Mod furniture,
two workers competing for one object, blocked access, task interruption,
occupied closing refusal, demolition in either state, and save/load plus
multiplayer while sleeping or while a component is active.
