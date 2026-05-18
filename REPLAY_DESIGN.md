# Replay Mechanism Design

## Overview
The replay animation visualizes Temporal's durability model by reconstructing workflow state from event history after worker failures or cache evictions.

## Rehydration Conditions
The replay animation triggers when:
1. A worker picks up a 'Workflow' or 'Activity' task.
2. The workflow is partially completed (has prior completed steps in the history).
3. The worker does not already have this workflow cached.

## Implementation Details
- **State Management**: `ReplayState` in `SimulationState` (`isActive`, `stepIndex`, `highlightTarget`).
- **Cache Management**: `WorkerNodeState` tracks `cachedWorkflowId`. Timer completion triggers cache eviction (setting `cachedWorkflowId` to null).
- **Animation Loop**: `App.tsx` uses a `useEffect` with `setTimeout` to dispatch `ADVANCE_REPLAY` every second.
- **UI Highlights**: Tailwind classes (`ring-2 ring-yellow-400 shadow-glow-yellow`) applied to workflow steps and event logs based on `ReplayState`.
- **Worker Pause**: Worker processing is paused by checking `replayState.isActive` in `WorkerNode.tsx`.
