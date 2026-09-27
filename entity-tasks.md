# Entity TaskPool

Updated: 2026-09-28. Source migration is complete; this change has not been
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
invent `Health`, `Needs`, `Mood`, or `Name` when these were not declared.

`AIState` content declares `lod_level`. Navigation and the entity physics chain
continue to handle movement. No wander behavior is introduced by this migration.

Raid deployment now posts a designated `Move` task for each attacker. The AI
task executor chooses the path on its next tick, then the normal navigation and
physics systems move the entity. Raid code no longer writes `NavAgent` routes
directly. A changed raid objective updates the active task target, causing the
executor to replace the stale route. `Move` is an internal zero-duration task
that completes on arrival; it has no colony work or `Needs` prerequisite.

## Current API and content format

- Lua API: `engine.tasks`.
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

Career `Job`, work efficiency/precision, work plans/policies, and building work
points remain business concepts. They are not renamed into generic AI tasks.

## Combat and Reaction boundary

The following decisions are recorded for subsequent implementation; this
migration does not implement them:

- All units can participate in combat. Conscript eligibility is checked by the
  conscription Lua script and requires a combat career, including mages.
- Conscripted units stop autonomous behavior, interrupt and clear their colony
  task queues, and receive player commands through forced `Battle` tasks.
- Unconscripted combat responses are selected by `Reaction`. Mods may configure
  responses such as fleeing or retaliation, or explicitly hand control to Lua.
- Reaction interrupts the active task without deleting it or clearing the
  queue. After Reaction releases control, that task is resumed first.
- Soldier recruitment persistence is deferred; for the current combat stage,
  entering conscription starts with a full squad.

Engine-owned entity values retain their ECS storage for performance. A unified
attribute interface must also expose capability-derived attributes. Completing
that attribute migration is separate from the TaskPool naming migration.
