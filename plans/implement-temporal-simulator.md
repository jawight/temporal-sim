---
sessionId: session-260513-215811-h47s
---

# Requirements

### Overview & Goals
The goal is to transform the current basic React application into the "Temporal Durable Execution Simulator"—a high-fidelity, interactive educational dashboard. It will visualize how Temporal workflows, server-side task queues, and worker nodes interact to ensure resilient execution, state reconstruction, and event sourcing.

### Scope
**In Scope:**
- Migration from Bootstrap to Tailwind CSS.
- Implementation of the "Mission Control" dark mode design system (as specified in `DESIGN.md`).
- Implementation of the three main system components:
  1. **Temporal Client**: Workflow definition editor and execution controls.
  2. **Temporal Server**: Task queue visualization and high-fidelity Workflow Event History table.
  3. **Worker Nodes**: Simulated workers that poll, process, fail, and complete tasks.
- Simulation logic (state transitions, polling, retries, history appending).

**Out of Scope:**
- Actual backend integration (all orchestration will be simulated in the browser).
- Complex custom workflow authoring beyond a sequential list of predefined steps.

### User Stories
- As a user, I want to click "Run Workflow" and see an execution start and a task enter the Server Task Queue.
- As a user, I want to add simulated workers that automatically poll the queue, pick up tasks, and process them with visual indicators.
- As a user, I want to see the Event History dynamically update with timestamps and event types as tasks are scheduled, started, and completed.
- As a user, I want to manually fail a worker's task and watch the system recover by placing the task back into the queue for retry.
- As a user, I want to see a synchronized replay in the Event History during logic tasks to understand state reconstruction.

### Functional Requirements
- **Theme**: Dark mode, deep navy surfaces, precise 4px radius shapes, Inter for UI, JetBrains Mono for data/logs.
- **Task Queue**: Must show status (In-progress, Retrying) and auto-remove completed tasks after a delay.
- **Event History**: Accurate timestamps, sequential highlighting for replay visualization.
- **Workers**: Must support simulated failure injection resulting in error feedback and task eviction.

# Technical Design

### Current Implementation
The current project is a simple React app using `useState` for basic arrays (`activities`, `workers`, `taskQueue`) and styled with Bootstrap. It lacks the complex state tracking needed for simulating polling, asynchronous processing, and detailed event logging.

### Key Decisions
1. **Styling Engine**: Replace Bootstrap with Tailwind CSS. Tailwind is perfectly suited for building the dense, highly customized "IDE-like" interface required by the `DESIGN.md`.
2. **State Management**: Use React's `useReducer` paired with `Context API` to manage the simulation state. The event-driven nature of Temporal (event history, task generation, state reconstruction) maps cleanly to a Redux-like reducer pattern where actions (e.g., `START_TASK`, `FAIL_TASK`) predictably update the global simulation state.
3. **Simulation Loop**: Use declarative React hooks (`useEffect` with `setInterval` or timeouts) within the Worker and Server components to simulate asynchronous polling and execution delays without blocking the UI.

### Data Models
```typescript
type TaskType = 'Logic' | 'Activity' | 'Timer';
type TaskState = 'Scheduled' | 'Started' | 'Completed' | 'Failed' | 'TimedOut';

interface WorkflowStep {
  id: string;
  type: TaskType;
  name: string;
}

interface EventLog {
  id: string;
  timestamp: string; // yyyy-MM-dd hh:mm:ss:sss
  eventType: string; // e.g., 'WorkflowExecutionStarted', 'ActivityTaskScheduled'
  details: string;
}

interface TemporalTask {
  id: string;
  stepId: string;
  type: TaskType;
  state: TaskState;
  retryCount: number;
}

interface WorkerNodeState {
  id: string;
  status: 'Idle' | 'Working' | 'Error';
  currentTask: TemporalTask | null;
}
```

### Components
- `SimulationProvider`: The root context provider holding the reducer state.
- `ClientPanel`: Houses the workflow definitions and the "Run" trigger.
- `ServerPanel`: Contains the `TaskQueue` (flex container with badges) and `EventHistory` (table layout with monospace fonts).
- `WorkerPool`: Renders individual `WorkerCard` components. Each worker card manages its own local simulated timeout and dispatches results back to the server.

### File Structure
- `src/core/types.ts`: TypeScript models.
- `src/core/reducer.ts`: The main simulation state logic.
- `src/components/Client/...`: Client UI components.
- `src/components/Server/...`: Orchestration UI components.
- `src/components/Worker/...`: Worker UI and polling components.
- `src/styles/`: Tailwind entry point.

# Delivery Steps

### ✓ Step 1: Stage 1: Setup Tailwind CSS and Design System
- Install Tailwind CSS, PostCSS, and Autoprefixer.
- Remove `bootstrap` dependency and clean up `index.css`.
- Configure `tailwind.config.js` with the specific colors (e.g., surface, primary, semantic colors), typography (Inter and JetBrains Mono), and spacing defined in `DESIGN.md`.
- Set up the basic layout skeleton in `App.tsx` (Sidebar/Client, Main Stage/Server, Workers) using Tailwind grid/flex classes.

### ✓ Step 2: Stage 2: Implement Simulation State Models and Reducer
- Define TypeScript interfaces in `core.ts` for `WorkflowStep`, `Task`, `EventLog`, and `WorkerNode`.
- Create a `SimulationContext` and a `useReducer` to act as the global store.
- Define core actions (`ADD_WORKER`, `RUN_WORKFLOW`, `SCHEDULE_TASK`, `START_TASK`, `COMPLETE_TASK`, `FAIL_TASK`).
- Wrap the app in the provider.

### ✓ Step 3: Stage 3: Implement Temporal Server UI (Task Queue & Event History)
- Build the `TemporalServer` component to visualize the orchestration layer.
- Implement the `TaskQueue` component showing badges/cards for queued tasks with appropriate status indicators.
- Implement the `EventHistory` table using `JetBrains Mono` for logs, ensuring new events are appended with correct timestamps (yyyy-MM-dd hh:mm:ss:sss).

### ✓ Step 4: Stage 4: Implement Temporal Client UI and Triggers
- Build the `TemporalClient` component.
- Create a UI to display a list of workflow steps (deterministic logic and activities).
- Connect the "Run Workflow" button to the reducer to dispatch `RUN_WORKFLOW`, which initializes the Event History and pushes the first `WorkflowExecutionStarted` event and a task to the queue.

### ✓ Step 5: Stage 5: Implement Worker Polling and Task Execution
- Build the `WorkerNode` component to visually represent simulated workers.
- Implement a simulation loop (e.g., via `useEffect` hooks) where workers poll the Task Queue.
- Add state transitions: idle workers pick up tasks, show a "working" indicator (animated hammer), wait for a specified duration, and complete the task.
- Dispatch `COMPLETE_TASK` to append success events to the history and clear the task from the worker.

### ✓ Step 6: Stage 6: Add Advanced Simulation Logic (Failure, Retries, Replay)
- Add a "Fail Task" button to the worker UI.
- Implement logic for simulated task failures and timeouts (Red X / Red Clock).
- Ensure failed tasks return to the queue and append corresponding failure events to the history.
- Implement the "Synchronized Replay" visualization feature, highlighting previous history events sequentially when Logic tasks are executed.