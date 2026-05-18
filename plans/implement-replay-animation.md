---
sessionId: session-260517-194559-dpn0
---

### ✓ Step 1: Update state management for Replay mode
### ✓ Step 2: Implement animation timing logic
### ✓ Step 3: Add visual glowing highlights to the UI
### ✓ Step 4: Document requirements and implementation plan

# Requirements

### Overview & Goals
Implement a visual animation that simulates Temporal's Replay mechanism. This animation will run when a worker picks up a Workflow task, visualizing how the worker rehydrates its state from the event log after picking up a partially completed workflow. The worker's processing and loading bar animation should be paused until the replay animation completes.

### Scope
- **In Scope**: 
  - Keeping the task in the queue (re-scheduling it) instead of dropping it when its worker is killed (for both Workflow and Activity tasks).
  - Triggering a replay animation when a worker *starts* a task (Workflow or Activity), **but only if the worker needs to rehydrate its state**.
  - Tracking which worker has the current workflow in its cache, and simulating cache eviction (e.g. when timers fire).
  - Cycling highlights (1-second intervals) between the Workflow Definition steps and the Event History logs during replay.
  - Pausing the worker node's loading bar and completion timer while the replay animation is active.

### User Stories
- As a user, when I kill a worker that is actively running a task, I want to see the task remain in the queue. When another worker picks it up, I want to see it visually replay the event history step-by-step to reconstruct its state before it resumes normal execution.
- As a user, I want to see the replay animation run when a timer fires and schedules a workflow task, demonstrating that long-running delays can cause workers to evict their workflow caches and require rehydration.

# Technical Design

### Current Implementation
Currently, when a worker is killed via the UI, it dispatches `FAIL_TASK`, which drops the task and reschedules a new one. When a task is started, the worker immediately begins a 5-second timer to complete it, showing a loading bar.

### Key Decisions
- **Task Requeuing**: When a worker executing a task is killed, the task will not be failed or dropped. Instead, it will be requeued (its state set back to `Scheduled`) so another worker can pick it up.
- **Rehydration Conditions**: The replay animation only runs if a worker needs to reconstruct the workflow state. This occurs when:
  1. The worker picks up a `Workflow` or `Activity` task.
  2. The workflow is partially completed (i.e., has prior completed steps in the history).
  3. The worker does not already have this workflow cached.
- **Cache Management**: We will track `currentWorkflowId` in `SimulationState` and `cachedWorkflowId` on each `WorkerNodeState`. A worker caches the workflow upon completing a task. The cache is lost if the worker is killed, or evicted globally when a long-running operation like a Timer completes.
- **Replay State**: We will introduce a `ReplayState` object in the Redux-like simulation state to track the animation's progress. It will track:
  - `isActive`: Boolean indicating if replay is currently happening.
  - `stepIndex`: The index of the workflow step currently being evaluated.
  - `highlightTarget`: Either `'definition'` (highlighting the workflow logic step) or `'history'` (highlighting the logs for that step).
- **Replay Trigger & Worker Pause**: `START_TASK` will evaluate the Rehydration Conditions. If met, it activates `replayState`. The `WorkerNode` will observe `replayState.isActive` and pause its 5-second completion timer and CSS progress bar until the replay is finished.
- **Animation Loop**: A `useEffect` hook will observe `replayState`. Every 1 second, it dispatches an action to advance the frame.
- **Completion Check**: During the `'history'` phase, if `eventHistory` contains a completed log for that step, it advances. If not, the animation stops (`FINISH_REPLAY`).

### Proposed Changes
- **`src/components/Worker/WorkerNode.tsx`**:
  - Update the close button `onClick` to dispatch `REQUEUE_TASK` instead of `FAIL_TASK`.
  - Update the `useEffect` timer and the `.progress-bar` classes to pause when `state.replayState?.isActive` is true.
- **`src/core/reducer.ts`**:
  - Add `currentWorkflowId` to `SimulationState` (generate on `RUN_WORKFLOW`) and `cachedWorkflowId` to `WorkerNodeState`.
  - Add `replayState` to `SimulationState`.
  - Add a `REQUEUE_TASK` action that changes a task's state back to `Scheduled` without adding a new task.
  - Update `START_TASK` to check rehydration conditions. If the worker needs to rehydrate, initialize `replayState`.
  - Update `COMPLETE_TASK` for Workflow and Activity tasks to set the worker's `cachedWorkflowId` to `currentWorkflowId`.
  - Update `COMPLETE_TASK` for Timer tasks to set all workers' `cachedWorkflowId` to `null` (simulating cache eviction).
  - Add `ADVANCE_REPLAY` and `FINISH_REPLAY` actions.
- **`src/components/Client/TemporalClient.tsx`**:
  - Add Tailwind classes to highlight the workflow step matching `replayState.stepIndex` when `highlightTarget === 'definition'`.
- **`src/components/Server/EventHistory.tsx`**:
  - Add similar glowing yellow styling to log rows matching the current `stepId` when `highlightTarget === 'history'`.