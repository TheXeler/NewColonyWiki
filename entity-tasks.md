# Entity TaskPool

2026-10-19 source change, not compiled or executed: immutable navigation searches
now retain the dependencies of actual endpoint body-footprint queries even when
no standing start or goal is admitted. Missing endpoints remain unavailable;
their zero-version dependencies can request data and invalidate the old result
after loading. Search-phase cache resets do not discard this endpoint evidence.
City battle command preflights use the same search and existing command planner;
saved data requests never become routes or simulation authority by themselves.

Updated: 2026-10-08. Source migration is in progress; this change has not been
compiled or tested. Static content and reference checks do not establish runtime
correctness.

## One entity AI execution path

Live entities can declare `chunk_loading.enabled` and `chunk_loading.radius`.
The authority derives their simulation footprint from effective world position
and radius. Terrain must be resident and pass the city barrier for a chunk
to become active. An entity belonging to a player-controlled faction uses the
same footprint to trigger city and team handover. The `player_display` Lua
observation reports camera coverage for presentation. Local and remote camera
ranges request terrain for display and prefetch.

`AISystem` schedules and advances `TaskInstance` records in `TaskPool`.
`TaskRegistry`, `TaskExecution`, and `TaskNavigation` provide definitions,
completion, and navigation. Entity AI no longer has a behavior-tree registry,
node state, blackboard, or a second execution branch.

Entities with `AIState` participate in scheduling. `Needs`, `Job`, `ColonistTag`,
and `BlockInteractor` are not universal prerequisites. Need-driven tasks inspect
`Needs`; colony interaction tasks require `BlockInteractor`; career and schedule
checks remain attached to the applicable task. AI-enabled prototypes do not
invent `Health`, `Needs`, `Mood`, or `Name` when these were not declared. The
engine attaches a `Job` only when declared, or an empty `Job` for a colonist
that needs the initial career-transition component. Other entities, including
animals, retain no profession component. An absent or empty profession does not
restrict ordinary task tags. Actual interaction/needs/navigation capabilities,
faction/colony ownership, explicit qualifications and task entry rules still
apply. A declared profession retains its own allowed-tag rules. `JobChange`
continues to require a colonist with a Job component.

Professionless actors receive `NoProfession` from experience application:
valid, no award, no Job/CareerProgress creation. Shared block-result preparation
and manufacturing reconstruction preserve this absence through entity snapshots.
Extraction and native agriculture check `BlockInteractor` rather than using
`ColonistTag` as an interaction capability. Their actual source, ownership and
harvest rules still apply.

## Physical crop damage without a profession

`engine.tasks.post_configured("damage_crop", faction, x, y, z, seconds,
crop_block_hash, nil, colony_uuid, config)` creates an explicit physical-damage
task. It is stored as `Cut` with `Custom` payload; agricultural harvest is `Cut`
with `Block` payload. `damage_crop` requires an existing crop block definition,
an actor with AI/movement/block-interaction capabilities, and the actor's faction.
Use `designated_worker` to direct an animal. The target field's colony does not
become the animal's faction or colony.

```lua
local task = engine.tasks.post_configured(
    "damage_crop", "core:neutral", x + 0.5, y, z + 0.5,
    duration_seconds, crop_block_hash, nil, "",
    {source_id=0, priority=5, designated_worker=animal_uuid,
     required_job="", required_job_level=0, item_requirements={}})
```

The ordinary scheduler navigates and advances this task. After completion the
native delivery cursor removes only the expected crop voxel via BlockEditService.
It produces neither harvest output nor career experience and needs no farming
zone or colonist tag. Existing work locks defer the edit; a replaced target is
preserved and the old damage attempt retires. The completion cursor remembers
the committed edit across notification retries, and pending completions continue
to gate saving. Block update/light/fluid notifications use the usual pipeline;
the farming update discards a plot when its crop block is gone. If the actor or
definition no longer admits damage, the attempt retires without editing.

Crop damage accepts finite coordinates representable as signed 32-bit block
coordinates. It uses the actual block storage and editor admission, with no
fixed 0..255 world-height restriction. `TERRAIN_GENERATION_HEIGHT` describes
initial terrain generation, not the runtime coordinate bounds; the removed
`WORLD_HEIGHT` name must not be used for this task.

This adds the action mechanism for an animal/Mod decision, not an automatic
wildlife target-selection policy. No animal is made a colonist or given a
profession to use it. Source implementation and regression scenarios have not
been compiled or executed in this batch.

Regression source in `Tests/UnitTests/test_city_native_terminal.cpp` posts the
documented Lua call, advances an already assigned actor at the work site through
AI, and delivers the actual Engine completion queue. It covers repeated waiting
under another task's work lock, unlock/retry acknowledgement, target replacement,
and a later delivery pass preserving a newly planted crop. The scene checks no
harvest piles, profession, career, colonist tag or inventory are created. It uses
minimal definition inputs and an explicit arrived assignment; wildlife decisions
and navigation are outside this scene. The assertions have not been executed.

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
the endpoints do not connect, generic callers may enter or finish through an
adjacent standing cell. Task navigation disables this substitution with
`PathfinderConfig::allow_adjacent_endpoints=false`, because its destination is
already a selected work stance. An adjacent endpoint is not necessarily within
task reach. The cell search considers every
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
Normal successful routes still finish during the primary search. Task routes
use only their selected start/goal cells; generic float queries retain the
optional endpoint fallback.

### Mining interaction box and exhausted endpoints (2026-10-17)

Mining treats the colonist as one cell wide/deep and two cells high. Relative
to the feet cell `(x,y,z)`, targets occupy `x-1..x+1`, `z-1..z+1` and
`y-1..y+2`: one floor layer, two body layers, one layer above the head. The two
body cells cannot themselves contain valid mining targets, leaving 34 possible
target cells out of 36. All horizontal directions, corners and overhead
positions share this range. The former special same-column `y+3` reach is
removed. A supported, body-clear stance and an unobstructed tool segment are
required; an intervening solid face/edge/corner rejects mining through it.
These are interaction bounds, not permission to mine every block in the box
simultaneously through obstructions or without a posted task.

`can_mine_from` provides the shared range/standing/occlusion check for stance
selection and execution. A miner already in range retains its actual position
instead of approaching another cell centre. Navigation searches possible feet
cells at target offsets `dx/dz=-1..1, dy=-2..1`. AI begins execution as soon as
the real target is in reach, cancels obsolete guidance, and rechecks before
advancing progress on later ticks. Losing reach after a push or terrain edit
returns the task to navigation. The range is specific to Mine; Cut and Build
retain their existing stance rules.

The inspected 2026-10-17 22:16:50--22:28:49 runtime log recorded 13 stalled
routes. Twelve belonged to one worker near `(14.800,72,-0.6)`; several of
those tasks were later completed by another worker. The final save retained
two busy miners with zero progress and exhausted single-cell routes ending
in x=15 while the requested work stances were x=16.5. Their current horizontal
distances to those stances were about 1.10 and 1.04 blocks, outside the old
one-block arrival radius. Adjacent endpoint substitution could repeatedly
produce these routes without arrival, while installing each new route reset
the stall timer. At the x=16 chunk seam, the hierarchical region search can
accept a neighboring goal in the starting chunk before traversing to the
original goal's chunk, even on otherwise connected flat ground.
AI now disables that substitution for both synchronous and
resumable task navigation. This prevents an adjacent fallback cell from being
reported as a completed task route. The log contains no DEBUG contact probes,
so it does not identify the exact collision partner for each earlier stall.

Designation previews and designated-worker submission also use the mining
reach check instead of treating horizontal proximity alone as arrival. Their
path checks use the same exact-endpoint mode as task execution.

Regression sources cover all 36 relative cells, obstruction, reach before a
route centre, lost reach, exact-endpoint failure, and a route across x=16. This change has
not been compiled, tested, or replayed in the saved world.

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

### Worker retry memory and proximity allocation (2026-10-17)

TaskPool also remembers failures by both task UUID and worker UUID. Returning
an assigned or claimed task through `interrupt_task`, or explicitly interrupting
a worker's queue with a nonzero skip duration, prevents that worker from
reclaiming it for 200, 400, 800 and at most 1200 ticks (10, 20, 40 and 60
simulation seconds). The task's shorter global block remains separate, so
another worker can try after that block and lifecycle cleanup expire. Different
workers do not overwrite one another's retry records. Public selection, direct
assignment, batch seeds/neighbours and pending personal queues all enforce this
memory; batch neighbours also honor the ECS path blacklist.

The per-worker table is runtime-only, while the existing last-worker skip
fields retain their normal save behavior. Completion, cancellation, changed
target position and pool teardown discard the relevant runtime records.
Navigation failures additionally reset worker exclusions when their recorded
NavMesh dependencies change. A full minute beyond an expired exclusion resets
its escalation on the next failure. A zero skip during an explicit queue
handoff clears that worker's exclusion instead of imposing failure backoff.

The scheduler compares eligible free worker/task pairs by instruction priority
and straight-line 3D proximity before filling personal queues. A batch leaves
cells closer to another eligible idle worker in the public pool. Ordinary
unactivated claims are selected again from the worker's current position;
already activated delivery chains retain their sequence. Qualifications,
faction/designation, schedules, materials and the existing two-metre recent-tag
preference still apply. Scores use double precision so small distance
differences are not rounded into creation-order ties by the priority bonus.
This is proximity allocation, not a globally optimal assignment or a comparison
of computed route lengths.

Native farming keeps the publication budget of 16 orders per 20 ticks, but
orders cells by their minimum squared distance to current colonist positions
before applying that budget. Coordinate strings break equal-distance ties
only. Native task claiming still checks eligibility; publication distance does
not designate a worker. The whole-field till-before-sow prerequisite remains.

The completed 23:18-23:21 run in `2026-10-17.1.log` records mining stalls near
`(0.5,70,0.999)` with a lower waypoint `(0,69,0)`, and repeated farm approach
stalls near `(0.601,70,1.053)` toward `(1,71,1)`. The matching save's remaining
farm orders are tilling. Mining reach now checks actual partial-footprint voxel
support instead of requiring floor support under the centre column, allowing a
miner to work from a supported hole edge. At stair/drop height transitions,
movement steers toward the waypoint centre to correct lateral offset beside
taller neighboring terrain. The 23:22-23:28 `latest.log` separately shows a
single stalled Cut task released at 23:23:22 and completed by the same worker
at 23:23:24. It also records Attention tick cost spikes; these are distinct
from route stalls. No contact-level debug trace identifies every blocker.

Regression sources cover independent worker exclusions, eventual/escalating
retries, moved targets, blacklist-aware batching, proximity queue selection,
cross-worker allocation, nearby farm publication, hole-edge mining and lateral
stair guidance. No build, test execution or saved-world replay was run.

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

Validation update (2026-10-12): the focused `NewColonyNavigationTests` target
was compiled with MSVC in a separate Release test configuration and all 77
tests from 10 suites passed, including the 13 navigation regressions. The
run covers A*, NavMesh, directed hierarchy, snapshot replacement, 500 requests,
cancel/target changes, intermediate segments and overlapping waypoint windows.
The runtime build exposed a stale `WORLD_HEIGHT` identifier; validation now
uses the existing `TERRAIN_GENERATION_HEIGHT` constant. Result application also
allows an already-arrived task to activate without a NavAgent, and fixtures
explicitly match worker/task factions. Full repository tests, the standalone
performance benchmark and final export packaging have not been run in this
validation. These results establish focused correctness, not a speedup claim.

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
turn, during a height transition, or outside that corridor after a collision,
it steers toward the route
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
The movement controller now predicts approaching grounded mobile entities using a
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

### Standing ground and yielding (2026-10-17)

`AIState::stand_ground` is a derived contact stance, separate from stopping
locomotion. Ordinary active tasks set it to true; idle AI sets it to false.
For conscripted squads, `Defend` sets it to true, while normal `Hold` (Stop)
and `Move` leave it false even while the persistent Battle task remains busy.
Incapacitation, inactive entities and active Reactions clear the ordinary
stance. AI refreshes it after scheduling and the engine refreshes it again
after task callbacks, immediately before movement and physics. Combat orders
also update it immediately. Soldier bodies inherit their leader's stance.

The contact solver reads this flag for both soft repulsion and horizontal
rigid response. A standing body does not take an external horizontal push;
its unanchored neighbor takes the correction, regardless of their mass ratio.
Two standing bodies stop at contact instead of pushing one another. Own
locomotion, terrain collision, gravity and vertical contact remain active.
Pairs without a standing body retain the existing mass response. Pushes keep
full-body terrain clearance and require support along a grounded horizontal
displacement; a blocked or unsupported push stops at contact. Already
penetrating standing bodies cannot forcibly displace one another and retain
the existing unresolved-overlap diagnostic if no legal separation exists.

Local passing also includes stationary grounded mobile entities whose stance is
false. The stationary entity takes the whole lateral shift at no more than
its resolved movement speed or the approaching body's speed. Without a safe
side, it retreats at half that speed, at most two blocks, while the mover
waits and rechecks for a passing pocket. A stance change, new movement order,
or completed encounter cancels this temporary movement. The controller clears
its own temporary request next tick; it never installs a permanent route for
yielding. Downed/dead entities and active Reactions do not receive voluntary
yield requests. Terrain, support, loaded-chunk and final entity-contact checks
still apply. A corridor with no passing space can still block traffic.

The stance and local encounter/request state are derived server runtime data,
not additional save fields or network payload. Loading rebuilds the stance
from task and squad state before simulating movement. Regression test sources
cover stance transitions, soft/rigid pushing, unsafe pushes and stationary
yielding; they have not been compiled or executed for this change.

As of 2026-10-18, standing-ground contact applies across entity types and factions;
voluntary local passing applies across entity types within the same faction,
without requiring `ColonistTag`. Animals, monsters,
colonists and other mobile bodies use the same rule. Local passing accepts
grounded bodies with Position, Speed, PhysicsCollider and MovementIntent;
stationary bodies also need positive resolved movement speed to step aside.
An entity without AIState is unanchored by default and can voluntarily yield
if it has these movement capabilities. Soldier bodies without their own AI
inherit their leader's stance in both local passing and physics, so Defend
also prevents a voluntary sidestep. Bodies without locomotion intent still use
the existing physical contact response; this does not grant them AI or walking
capabilities. Collision-disabled bodies, projectile flight and collision-exempt
leader/soldier pairs retain their existing exclusions. Terrain and support
checks still gate displacement. This extension has not been verified, compiled,
tested or replayed in-game.

Passing lanes, stationary sidesteps and bounded retreat require matching
nonempty faction instance UUIDs. When neither entity has an instance UUID,
matching nonzero civilization/faction hashes qualify instead. Distinct faction
instances sharing a definition do not qualify. World-facing faction hashes
use the combat system's resolver: legacy colonists default to player and
unaffiliated non-colonists default to neutral. A zero/unresolved hash in a local
snapshot does not qualify. Soldier bodies without affiliation inherit their
leader's affiliation.
Changing affiliation cancels an existing passing encounter on the next movement
update. Different factions still collide and use normal mass/standing-ground
physical push rules; they do not voluntarily make way for each other.

### Mining designation collision admission (2026-10-18)

Mining preview and authoritative submission share `designation_cell_collides`.
Previously every entity with Position contributed a box derived from visual
dimensions, falling back to a 1x1x1.8 body even without PhysicsCollider.
GroundItemPile entities therefore rejected nearby mining cells although they
had no physical collision. The 11:12 save contains 44 such piles. Rejected
preview cells are omitted by ordinary confirmation, so no task or persistent
mark is created; a later debug preview continues to report `target_collision`.
This explains a reproducible code path for the reported symptom, though the
log does not identify the exact rejected cells from the user's selection.

The shared admission now uses enabled PhysicsCollider bounds and the terrain
contact epsilon, ignoring entities without a collider, collision-disabled
bodies and projectile flight. Model dimensions no longer create collision
occupancy, and tiny floor/wall contact rounding does not reject adjacent cells.
Building occupancy and the existing formation-visual exclusion remain.
Block placement settlement shares the corrected query. Regression sources
cover piles, actual collider/model differences, contact tolerance and disabled
or projectile bodies; verification has not been run.

Idle colonists with unreserved backpack contents now receive designated Haul
delivery work after task completion, interruption or cancellation. These events
queue a check for the affected worker on the next simulation update, after
settlement and native assignment cleanup. Duplicate worker checks are combined;
successful partial unloading also triggers the next check. The existing
40-tick hauling scan remains a fallback for already idle workers, expired retry
delays and newly available storage. Priority 9 leaves
ordinary higher-priority work ahead of unloading. Source and storage-block
capacity are reserved on activation. Normal qualifications and work policy
remain applicable. No storage, interruption or rejected deposit leaves the
contents in the backpack; failed unloading waits 200 ticks before reposting.
See `item-storage-visuals.html` for destination rules, APIs and the optional
`source_inventory_slot` persisted hauling-row field. Implementation and
regression source are present; no verification was run.

World block collapse uses a resumable `BlockSupportUpdate`, sharing
the building design solver's upward support and eight-neighbor same-layer
propagation. Support is boolean: it has no coefficient, distance decay or
horizontal span limit. A transmitting supported block supports the cell above
and adjacent cells on its own layer; it does not transmit downward. Solid blocks at
y=0 anchor the runtime search; other solid blocks must trace support to that
foundation through `can_support` predecessors. This applies to natural terrain
and constructed blocks. Air, fluid, and passable blocks do not collapse.
Missing strong chunks defer dependent decisions; an exhausted per-Tick work
budget retains the graph, queues and cursors for the next simulation update.
Pending is an unfinished calculation, not a third physical support state.
Connected floating blocks cannot establish support without a valid anchor.
Only committed structural block changes activate checks. Each original changed
position, its upper neighbor and all eight same-layer neighbors seed forward
dependency discovery. Discovery then follows transmitting solid cells upward
and across their layer, including nested walls/roofs and diagonal dependencies.
Reverse-only dependency reads establish support sources without activating
unmodified lower terrain. There is no periodic column/world scan: generation,
ordinary chunk loading and old-save loading do not initiate collapse.
Support and missing-data information propagate across the retained graph before
unsupported affected cells are admitted to falling. Structural edits overlapping
observed cells and residency changes invalidate detached calculations; unrelated
edits and CPU-budget yields do not restart them. A bounded derived edit-history
gap conservatively restarts the recorded roots. Structural notifications waiting behind the delivery cursor must
finish before a calculation can publish movement decisions.
Residency revisions wake retained loading waits without rescanning chunk lists.
Work-lock revisions wake refused active falls; other native commit refusals
also have a simulation-time retry deadline, rather than retrying every Tick.
Content refresh reconsiders only already-recorded checks and active falls.
Notifications and support queries guard extreme vertical i32 coordinates so
adjacent-cell Y arithmetic cannot overflow. An unsupported block descends through
air by at most one cell every two simulation ticks. Active falls continue until
blocked, rather than treating a passing wall as a new foundation.
Each downward relocation atomically preserves block data, orientation, voxel
attributes, inventory contents, and inventory reservation records. Existing
tasks still name their original target coordinates; moving a block does not
retarget those tasks. Terrain, lighting, mesh and neighbor notifications use
BlockEditService. Relocation prepares only the touched one or two voxel
sub-chunks, retains unrelated light volumes, and transfers original attribute
and inventory nodes after preparing allocation capacity. It does not clone a
whole chunk column or its entire sparse owner tables for each falling block.
Collision targets are collected once per movement batch and narrowed by head
height before testing horizontal overlap.
World replacement clears all old generation work. `world.json` now includes
optional `falling_blocks`: ordered `changes` and `moves` coordinate arrays plus
`falling` records containing coordinates, namespaced `block_id`, `data`,
`direction`, `last_step`, `retry_at` and canonical `hit` entity UUIDs. Save capture
retains pending edit roots, loading waits, original fall state, movement order,
retry deadlines and hit identities. Detached graph caches are rebuilt from those
recorded roots after restore; restoring them is not a new world scan. Older
saves without the field start with no recorded collapse obligations. Invalid
present records are rejected before world activation. Remote clients receive
world/terrain presentation and do not execute authoritative falling simulation;
the pre-release network protocol remains version 1.
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
prefix; the native Reaction finish path applies it when a Reaction ends.
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
- Task-pool projection: `engine.tasks.ui_rows()`, read by the task-pool panel;
  no Lua `core:task_pool` channel exists.
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
For proved asynchronous failure, `[AI][nav] unreachable work` reports entity
and task UUIDs, the request's `from` and `target` coordinates, expanded work
steps and cell queries. Walkable endpoints do not guarantee a route.
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
