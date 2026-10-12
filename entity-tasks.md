# Entity TaskPool

Updated: 2026-10-08. Source migration is in progress; this change has not been
compiled or tested. Static content and reference checks do not establish runtime
correctness.

## One entity AI execution path

`AISystem` schedules and advances `TaskInstance` records in `TaskPool`.
`TaskRegistry`, `TaskExecution`, and `TaskNavigation` provide definitions,
completion, and navigation. Entity AI no longer has a behavior-tree registry,
node state, blackboard, or a second execution branch.

Entities with `AIState` participate in scheduling. `Needs`, `Job`, `ColonistTag`,
and `BlockInteractor` are not universal prerequisites. Need-driven tasks inspect
`Needs`; colony interaction tasks require `BlockInteractor`; career and schedule
checks remain attached to the applicable task. AI-enabled prototypes do not
invent `Health`, `Needs`, `Mood`, or `Name` when these were not declared. The
engine attaches an empty `Job` to entities without a job capability; its Task
eligibility is limited to basic and survival Tasks.

`AIState` content declares `lod_level`. Navigation and the entity physics chain
continue to handle movement. No wander behavior is introduced by this migration.

Entity attention is refreshed after script combat and dead-entity cleanup, before
the network and render snapshots. An executing Task points at its target block
or planned-block center, including item pickup/delivery and workstation tasks.
Tasks carrying an explicit target entity use its current resolved position plus half its
collider height when available, so moving patients and hunted entities are not
tracked at stale Task coordinates. This includes Lua care Tasks whose navigation
kind remains Block while their target UUID identifies the patient. Attention does not require `BlockInteractor`
or `HeadVisual`; only actual block actions set the block-interaction interest.
Move, Battle, Flee, Sleep, Rest and StaffUpdate do not create work attention.
Navigation keeps locomotion facing; stationary execution faces the work target.

Selected melee opponents take priority over work and over the squad's distant
attack order. Without a melee contact, a conscripted captain and its soldiers
track the active Battle target. Combat facing overrides movement and formation
alignment, including attack-cooldown ticks. Each tick rebuilds attention from
current state, clearing it when work/reactions end or combat targets die or
disappear. A target directly above/below preserves horizontal yaw. Legacy
box/biped heads also track the interest vertically; GLB units use body yaw and
their exported head animation. This 2026-10-11 change has not been compiled or tested.

Prototype capability declarations are expanded into the entity's base attribute
Map during spawn, including the fixed-ID network spawn path. The original
capability JSON is not stored on the entity or in its save. A network snapshot carrying
a prototype ID fails entity creation if that prototype is unavailable locally;
it does not create an entity without its declared capabilities.

Hunt previews, designated-worker reachability checks, Task publication, and
later target refreshes read `position.x/y/z` through the unified attribute
reader. They use the resolved target and worker coordinates, so position
modifiers do not make the preview and the posted Task disagree.

Raid deployment now posts a designated `Move` task for each attacker. The AI
task executor chooses the path on its next tick, then the normal navigation and
physics systems move the entity. Raid code no longer writes `NavAgent` routes
directly. A changed raid objective updates the active task target, causing the
executor to replace the stale route. `Move` is an internal zero-duration task
that completes on arrival; it has no colony work or `Needs` prerequisite.
Raid engagement refreshes the same Move goals every half second: enemies in
the attacker's alert range are ranked by conscription first, then distance and
UUID. Conscripted soldiers count through their captain. Without a visible enemy,
the original raid objective is restored. Within melee range the movement goal
becomes the attacker's current position and movement intent is cleared; melee
permission comes from its raid identity rather than keeping a Move Task alive.
Active Reactions retain control over navigation and melee permission. Ordinary
unconscripted battlers still require a melee-enabled Reaction to counterattack.
These 2026-10-11 changes have not been compiled or tested.
The entity prototype reads top-level `velocity` into its `Speed` component, which
the movement system requires even when the initial velocity is zero.
Top-level `move_speed` sets the engine-owned base movement speed in blocks per
second on that component. It is finite and nonnegative; an omitted value is zero.
Movement uses this base multiplied by `move_speed_modifier` (neutral value 1).
An entity does not need `Job` or an attribute pack to use its top-level `move_speed`.

Blocks may declare `passable` independently of their render `block_class`.
Terrain collision, support and navigation use that shared passability query.
The physics layer multiplies horizontal MovementIntent velocity by the smallest
`movement_speed_multiplier` among cells overlapping the body, including head
height. The default is 1; multiple overlapping cells do not compound the penalty.
Core leaves retain the translucent render class, are passable and use 0.5.
Leaving foliage restores normal locomotion on the next physics update. Foliage
does not count as fluid or provide support, and does not slow gravity or falling.

Floating-point navigation requests retain the requested world destination in
`NavAgent`. The pathfinder searches a sequence of walkable voxel cells, using
the cell containing the entity's feet when possible. If the columns containing
the endpoints do not connect, it may enter or finish through an adjacent
standing cell within the task arrival range. The cell search considers every
permitted height transition in a neighboring column, including an upward step
when that column also has a walkable level at the current height.
The assigned route compresses straight, level cell runs into turn points.

Path-failure handling (2026-10-12) does not cap the number of normal path
requests per simulation tick. Synchronous queries retain their configured node
budget (4096 by default). Only after it fails, adjacent endpoint combinations
share one multi-source search and one additional node budget, instead of
restarting a full search for every pair. This search prefers the original goal
cell and retains a reached adjacent goal as a backup. A floating-point request
therefore uses at most two search budgets, independent of endpoint count.
Normal successful routes still finish during the primary search.

Unreachable scheduled tasks back off for 20, 40, 80, then at most 160 ticks
(1, 2, 4, 8 simulation seconds at 20 TPS). The failure history belongs to the
task UUID, so changing the worker does not restart the sequence. Success
clears that task's history; cancellation and a minute without failure prune
it, and world teardown clears all history. A changed task position or relevant
NavMesh dependency clears the history and worker blacklist on the next AI update, and
removes the recorded failure cooldown if it still belongs to that task.
Explicit locks and independently changed blockers retain their state.
Callback-only navigation has no terrain revision; target changes still reset
its failures, and terrain changes are discovered at the next scheduled retry.
The retry state is derived runtime data and is not serialized.
Regression test source has been added; this change has not been compiled,
tested or measured in a running game.

### Resumable hierarchical navigation (2026-10-12)

Runtime navigation now uses a dedicated 1-8 thread service, defaulting to half
the hardware thread count. Every valid request can enter the queue during its
submission tick; there is no per-tick request quota. Searches yield after 4096
work steps and retain their frontier, with a default total budget of 131072.
Cold region construction also consumes work steps. Default Weighted A* uses
1.2; explicit 1.0 remains available for exact cell-search comparisons.

The cell kernel uses a flat coordinate index, contiguous parent/cost records,
stable heap ties, combined passability/cost queries and reusable per-thread
buffers. NavMesh publications are shared immutable chunks. Background jobs
capture a snapshot, never ECS/Lua/TaskPool pointers or terrain callbacks.
Callback-only tooling stays synchronous on its owner thread. Existing Lua
material reservation and other `find_path` callers still return immediately
and retain their caller-specified budget. `NavigationService::solve` provides
the richer synchronous result contract without queuing background work.

Cross-chunk requests use directed strongly connected regions built for the
agent's clearance, footprint, permitted fluid depth, step-up and drop rules.
Every region transition retains a legal exit and entry; one-way drops do not
create reverse reachability. Same-chunk requests try the cell search first;
after 4096 expansions a difficult request switches to the region proof.
The service first establishes a complete region corridor, then refines and
publishes its successive cell segments. It never returns an exploratory
frontier as a route. Partial proofs describe the captured snapshot, not future
terrain changes. Raw route coordinates remain continuous at world wrap seams.

AI retains the task claim while waiting. When a valid segment arrives, the
simulation owner rechecks position, target, body size, task eligibility and
ownership before activating the task and installing guidance. Results are
applied in stable request order among currently ready jobs, without waiting
for older unfinished jobs. Timing is server-authoritative and may differ with
worker speed. `AISystem::request_path` returns acceptance for NavMesh requests;
it no longer means a route was installed before the call returned.

Segments keep the final task target and use the existing 128-waypoint NavAgent
capacity in overlapping windows. Intermediate endpoints cannot start work;
the owner installs the next window or waits. Waiting does not count as a stalled
walk, and the movement controller must not fall back to a direct MovementTarget
while AI awaits navigation. Actual walking retains normal stall detection.

`Pending`, `Partial`, `Complete`, `Unreachable`, `BudgetExceeded`,
`NavigationUnavailable`, `Cancelled`, and `Stale` are distinct result states.
Only proved Unreachable results enter the unreachable history. Budget exhaustion
or missing navigation releases the request with a short retry delay and is not
cached as impossible. Region/proof caches use agent capabilities, publication
identities and dependency versions; missing neighbors are dependencies too.
An unrelated chunk replacement does not invalidate a route. Changed relevant
navigation or a target clears its failure history. Retained cache entries have
a conservative 128 MiB LRU limit; active requests are never refused to enforce
that limit. Simultaneous requests may therefore use more than 128 MiB overall.

Cancel, reassignment, body/target changes and world teardown discard old jobs.
World unload/shutdown cancels and joins navigation workers outside the simulation
lock. Search state, pending results and caches are derived and are not saved or
added to the network protocol. World load resumes planning from saved task state.

`AISystemStats` includes pending requests and consumed work/query/cache-hit
counters. `NavigationMetrics` also includes stale heap entries, route cost,
compute time and elapsed request time. With a separate test configuration,
`NEWCOLONY_BUILD_NAVIGATION_BENCHMARK=ON` builds the opt-in standalone
`NewColonyNavigationBenchmark`; it is not registered with CTest. It prints CSV
for 100/300/500 requests in short, long, disconnected, shared-goal and editing
scenarios, including cold/warm caches, latency percentiles, first-segment time,
throughput, result classes and retained cache bytes. The runner measures this
implementation; comparing revisions requires running the same workloads on
each revision. Regression and benchmark sources have not been compiled or run.

Engine initialization attaches the world NavMesh, terrain callbacks, and the AI
worker pool before world creation or loading. This does not depend on tick zero:
new worlds begin at 08:00 (tick 9600), and loaded worlds resume their saved tick.
Pathfinding requires either the NavMesh or a solid checker. Missing world
queries reject walkable/passable checks and both route overloads, including a
same-cell request; they do not treat unsupported air as walkable.
World server teardown clears AI navigation-progress timers, derived worker
caches, movement diagnostics, and physics stair/diagnostic state. Dependency
wiring and loaded definitions remain attached. This explicit cleanup matters
when a save restores the same entity/task UUIDs: pruning dead entities alone
cannot prevent a previous world's stall timeout or stair slowdown from leaking
into the restored world.
Navigation provides the route without writing movement targets or velocity.
The entity movement controller advances its route and follows the fixed
direction of each segment while inside its half-block lateral corridor. Near a
turn, or outside that corridor after a collision, it steers toward the route
point using the actual horizontal distance. An exhausted forward projection
does not zero the request while a sideways correction remains. This changes
MovementIntent only; physics still owns Position and collision. Height
transitions remain separate route points so the controller can step up, descend,
or continue horizontal motion while falling. Exact entity height is used for
arrival; the search graph uses integer standing heights. `allow_step_up` controls
one-block ascending edges; descending limits use `max_drop_blocks`.
The entity controller skips an initial entry cell already occupied by its feet
on a multi-point route, without approaching the cell center. A feet height
within 0.002 below that layer or up to one layer above also permits entry.
Single-cell destinations and subsequent turns retain their arrival checks.
Physics now snaps grounded feet to an exact integer block top when collision
resolution leaves them within 0.002 blocks below it and that position is free.
This keeps the layer used by `floor(position.y)` aligned with the actual ground.
Entity locomotion requests horizontal movement and permits a step up of at most
one block. Colonists do not accept jump impulses from movement intent. When a
grounded body meets a one-block ledge, physics checks its upward clearance,
the horizontal passage above the ledge, and support at the landing position.
Physics clears the feet to the integer top and applies the reduced horizontal
advance in the same tick. There is no horizontal waiting phase or upward
velocity impulse. The landing must be supported, and the upward/horizontal
passages must both be free. Contact validation uses that two-part stair motion,
rather than a diagonal segment through the solid ledge. A low ceiling or a
two-block wall rejects the step; blocked flat movement advances to contact.
Requested horizontal velocity is halved before attribute modifiers while the
stair presentation completes, including through turns. The immutable local
RenderEntitySnapshot carries a display-only offset that decays at 2 blocks per
second, independently of Speed.y; rendering advances that decay between ticks.
Each additional stair adds its rise to the remaining offset, avoiding a snap
between adjacent stairs. Physics Position and collision remain on the cleared
surface. This presentation state is transient and is not replicated in the
network entity component payload or restored from a save.
An ascending route point requires grounded contact before it can complete.
Soft and rigid horizontal contact continue during stairs. A side contact does
not cancel stair presentation unless it loses the upper support. Vertical
contact, contact-island rollback, or losing the selected surface cancels it.
Ground support is queried only in a thin slab beneath the feet; side walls
cannot make a body grounded. Before motion, a body already intersecting terrain
is moved out by a bounded, shortest local correction. If no nearby free position
exists, it remains blocked rather than moving through solid terrain.
Collision queries count strict overlap of the body bounds, so exact contact
at a voxel face does not disagree with penetration recovery.
Entity-to-entity contact uses two boxes, including for moving entities. The
`physics_collider` capability's `half_width`, `height`, and `half_depth` define
the soft box and the full terrain body. Its `rigid_scale` (default 0.75, greater
than zero and at most one) scales all three dimensions of the inner entity box,
anchored at the feet. `mass` is finite and positive, defaulting to 1. These two
fields are saved with PhysicsCollider; older saves default to 0.75 and 1.
Soft overlap applies opposite horizontal movement responses, increasing with
penetration and capped at 2 blocks per second per body even in a crowd.
The lighter body's response factor is 1. The heavier body's factor is
`clamp(2 - own_mass / other_mass, 0, 1)`: equal masses receive 100 percent,
1.5 times the mass receives 50 percent, and twice the mass receives zero.
Horizontal rigid contact uses the same mass response factors, normalized to
distribute the required correction between both bodies. Equal masses split it
equally; at a 1.5 mass ratio the heavier body takes one third and the lighter
body two thirds. At a mass ratio of two or more, the heavier body keeps its
requested horizontal movement and pushes the lighter body out of its way.
Relative swept box checks preserve tangential movement and permit exact face
contact. A closing sweep that starts at exact rigid contact remains blocking,
including when its endpoints would exchange sides. If terrain blocks the push,
motion stops at contact to preserve both
terrain clearance and rigid non-overlap. Vertical contact still stops motion
at contact rather than pushing a grounded body downward.
Existing penetration is resolved horizontally with the same mass shares and
terrain clearance, transferring the correction to the free body when a wall
blocks the other. A bounded contact solve falls back to the clean starting positions
of only the affected contact islands if it cannot settle new movement.
If already overlapping starting bodies have no terrain-clear separation,
`[physics][contact]` logs that condition once until it clears. Collision
response updates effective Speed and physical Position inside physics;
MovementIntent, NavAgent, and route guidance retain the controller's request.
The movement controller now predicts approaching grounded colonists using a
half-second sweep of their requested horizontal motion. Equal-mass head-on
contacts otherwise cancel forward movement symmetrically every tick. A local
encounter chooses parallel passing lanes, preferring each body's right and
then its left. Lane coordinates remain fixed until the bodies have passed,
one route stops or turns away, or their standing heights diverge. Lane shifts
prefer the rigid mass-response shares; if only one body has passing space, it
may take the whole shift while an immune heavy body retains its lane.
If neither side is available, the lighter body retreats at half speed while
the other waits. Equal masses choose the larger entity UUID to retreat.
Retreat is limited to two blocks and rechecks passing pockets each tick. An
impossible narrow passage still relies on the existing AI stall handling;
this local controller does not perform a corridor-wide traffic reservation.
Lateral and retreat motion require full-body voxel clearance and ground
support throughout the segment, sampled at intervals of at most 0.1 blocks.
Missing strong chunks reject the motion. Collision-exempt leader/soldier
pairs and projectiles are excluded. The passing state is cleared at world
teardown. The engine supplies ChunkManager to EntityMovementSystem::update;
callers omitting it skip local passing. The controller changes MovementIntent
and facing only; Nav supplies guidance and physics remains responsible for
all position changes, stair movement and final entity collision resolution.
The new local-passing and tight-contact regression sources have not been
compiled or executed.
World block collapse uses `BuildingSupportSolver::evaluate_world_cell`, reversing
the building design solver's upward support and eight-neighbor horizontal
propagation, with the shared seven-cell horizontal span limit. Solid blocks at
y=0 anchor the runtime search; other solid blocks must trace support to that
foundation through `can_support` predecessors. This applies to natural terrain
and constructed blocks. Air, fluid, and passable blocks do not collapse.
Missing strong chunks or exhausted query budgets defer the decision.
Block changes queue local checks; a bounded rotating column scan discovers
unsupported bottoms in existing worlds. Discovery uses each resident chunk's
actual vertical block bounds, including coordinates outside the former fixed
world-height range. Notifications and support queries guard the extreme vertical
i32 coordinates so adjacent-cell Y arithmetic cannot overflow. The y=0 foundation
rule above is unchanged. An unsupported block descends through
air by at most one cell every two simulation ticks. Active falls continue until
blocked, rather than treating a passing wall as a new foundation.
Each downward relocation atomically preserves block data, orientation, voxel
attributes, inventory contents, and inventory reservation records. Existing
tasks still name their original target coordinates; moving a block does not
retarget those tasks. Terrain, lighting, mesh and neighbor notifications use
BlockEditService, and the fall queue resets when the world generation changes.
When the falling block's bottom crosses an entity rigid box's top with strict
horizontal overlap, it subtracts `falling_block_damage` from current health,
clamped at zero. Each block's active fall records its hit entities to avoid
repeated damage. Damage is fixed, independent of fall height, entity mass,
armor or squad shields; entities without Health are not damage targets.
The normal end-of-tick death/recovery handling remains responsible for zero HP.
`[physics][falling-block]` DEBUG logs identify the block, entity, origin and damage.
Entering the upper standing cell while grounded completes the ascending
segment before its center. A lower approach cell is also consumed when physical
stepping has already put the body on the following upper surface.
DEBUG `[physics][motion]` probes are limited to once per simulation second per
entity, retaining counters between reports. `step_committed`, `step_surface_lost`,
`step_contact_invalidated`, and `contact_island_rollback` report stair lifecycle.
`route_no_progress` starts after 0.5 seconds without physical progress, recording
the position, intent, speed, grounded flag, waypoint/index, last rejection,
contact partner/axes and stair start/cancel/rollback counters. Rejections
distinguish headroom, upper passage, unsupported landing and step height.
`embedded_recovered` and `embedded_recovery_failed` use the same limited probe,
including the original/current coordinates, replacing the unlimited unstuck log.
`[physics][cost]` samples physics updates exceeding 5 ms, at most once per
simulation second. It separates projection, voxel movement, entity contact
solve/probes and final publication, with entity/body counts. This diagnoses
physics cost only; frame-level Vulkan/input/mutex stalls need their existing
Perf records. The added regressions and probes have not been compiled or run.
If a route still stalls, `[AI][nav] stalled route released` records the task
UUID, next waypoint and route index before releasing the task.
The CoreMod test animal declares a base of 3 blocks per second. Wander Tasks
choose a multiplier of that base; a stress Reaction adds a speed buff. The
speed modifier group API accepts non-colonist entities, so animals can receive
that buff. The planned Reaction contract removes the buff on `ReactionEnd`.
An active Reaction suppresses new Reaction triggers and runs `on_tick` at the
interval declared by its Mod JSON definition; `on_end` will explicitly remove its
`reaction_effects.*` groups.
The native attribute layer now has a targeted cleanup operation for that
prefix; wiring it to the Reaction lifecycle remains pending.
Lua reads the base through `engine.entities.attribute(uuid, "move_speed")`.
The same accessor reads the ECS-owned `name` value directly when present.
The current health key is `current_hp`; `map_hp` is rejected in entity content.
`engine.entities.has_node(uuid, path)` checks an existing entity without
building a Lua table. It accepts engine values such as `move_speed` and exact
or ancestor paths in the entity attribute map. A key
`battler.magic.spell.cooldown` makes `battler`, `battler.magic`, and
`battler.magic.spell` exist as nodes. Payload tables can be inspected directly
in Lua before spawn.
Pack declarations use local keys. On spawn, each referenced pack expands into
the entity attribute map under its slot name, such as `battler.melee_hit`.
A pack reference may omit `name` and `custom_values`; the name then comes from
the default pack ID, and the pack's own defaults are used. Supplied
`custom_values` override or add declared values. The payload is complete and
may be edited through Lua before `engine.entities.spawn(id, payload)`.
Save and network Speed records carry `move_speed`; old records without this
field are not supported.

Pending-registration colonists use the same `Move` task path through
`engine.ecs.move_to`: it checks reachability before posting or retargeting a
designated task. While registration is active, the entity cannot take colony
work or need tasks. `engine.ecs.has_path` includes an executable queued Move
task, so a pending path request is visible before the AI tick assigns a route.

## Current API and content format

- Lua API: `engine.tasks`.
- The existing `Move` task can be posted from Lua with type `move` and zero
  duration. Set its designated entity with `engine.tasks.set_metadata`; task
  scheduling, navigation and completion remain native.
- Native task identity: `TaskId`, a UUID; task instances preserve their UUID
  through assignment, interruption and completion.
- Lifecycle events: `core:task_activated`, `core:task_execution_starting`,
  `core:task_completed`, `core:task_cancelled`, `core:task_interrupted`.
- Lifecycle identity field: `task_uuid`; APIs and business records with a task
  ID use `task_id` where applicable.
- Definition directory and registry type: `data/task_definitions/` and
  `task_definitions`.
- Task-pool channel: `core:task_pool`, projected through the task-pool client
  modules and UI provider.
- Save file: `tasks.json`, with a `tasks` array plus reservations. Network world
  state uses a `tasks` document. No old API, file, field, or event aliases exist.
- Entity `AIState` saves its busy flag, current task UUID and plan step. Restore
  rejects mismatches between an assigned task and the entity that runs it.
  Network entity snapshots carry the same plan step with the task UUID.
- Blocking or locking an assigned task releases its reservation and queues an
  interruption notification before another entity can claim the same task.
  Unlocking a task leaves any current assignment intact.

Career `Job`, work efficiency/precision, work plans/policies, and building work
points remain business concepts. They are not renamed into generic AI tasks.
Career progression still uses `work_experience`, and equipment transitions use
`transition_work_duration_seconds`. Generic movement and other non-Core tasks
do not grant career work experience.

## Hauling diagnostics

The DEBUG log emits `[AI][haul][diagnostic]` every 100 simulation ticks when
player hauling tasks exist. The accompanying `[AI][haul][task]` rows sample up
to six designated and six pending unclaimed tasks, with up to three idle workers
per task. `reason=selected_other` means the worker can take the logged task but
the scheduler preferred the task in `selected`. Other reasons identify the
first failed eligibility check, such as `job_or_capability`, `work_policy`, or
`path_blacklist`. `invalid_target` means the chosen task has no walkable target.
`candidate=none` means the designated worker was not in the idle worker set at
that tick. These rows stop before a path search; path search failures have
separate `[AI][work]` warnings.

CoreMod logs `[haul][posted]` for pickup (`to_source`) and delivery
(`to_destination`) tasks. Delivery is designated to the worker carrying the
item. `[haul][activation_rejected]` records inventory slot and source pile
availability when a pickup cannot activate. Match the task UUID in these rows
with the native task diagnostic to follow one item through both stages.
The posted rows include `task_pos`, the position passed to the task pool;
`target` is the chosen storage cell. Pickup rows also include `pile_pos`.
On a path search failure, `[AI][work] pathfinding failed` reports `task_pos`,
the navigation `target`, snapped `start_cell` and `goal_cell`, and whether each
snapped cell is walkable for the logged agent size. `target_valid` describes
the navigation target, and `stale` records whether the path was recalculated
after the candidate changed. Walkable endpoints do not guarantee a route.
The detailed warning is emitted on the first failure in a retry sequence;
later attempts update failure counters and cooldowns without repeating it.
Missing-stance and individual candidate probes use DEBUG logs.

For CoreMod hauling, an unassigned pickup requires an empty backpack slot
before the native scheduler claims it. A designated delivery remains eligible
with a full backpack. Among tasks at the same explicit priority, a worker's
designated Haul delivery is selected before ordinary pickup tasks; explicit
higher priorities still take precedence. The task diagnostic uses
`reason=backpack_full` when an unassigned pickup is excluded for this reason.

## Combat and Reaction boundary

The following decisions are recorded for subsequent implementation; this
migration does not implement them:

- Combat careers, including mages, grant `is_battler=true` at their first talent.
  Monsters may receive the same capability through a battler pack. Player
  conscription requires a combat career and is checked by the conscription Lua
  script.
- Conscripted units stop autonomous behavior, interrupt and clear their colony
  task queues, and receive player commands through forced `Battle` tasks.
- The conscripted squad's Stop command releases Battle control and returns the
  entity to autonomous AI.
- A combatant cannot voluntarily move down a drop of two or more blocks;
  forced movement such as knockback may cause that fall.
- Unconscripted combat responses are selected by `Reaction`. Mods may configure
  responses such as fleeing or retaliation, or explicitly hand control to Lua.
- Reaction interrupts the active task without deleting it or clearing the
  queue. After Reaction releases control, that task is resumed first.
- Soldier recruitment persistence is deferred; for the current combat stage,
  entering conscription starts with a full squad.
- Mods define formations, including shapes other than squares, for player
  selection. Definitions support both relative slot coordinates and generated
  slots that expand with squad size through a Mod Lua function. Fixed slots
  fill in list order, reject a squad larger than the list, and compact when
  soldiers are lost.

Engine-owned entity values retain their ECS storage for performance. A unified
attribute interface must also expose capability-derived attributes. Completing
that attribute migration is separate from the TaskPool naming migration.
