# Project Brief: Temporal Durable Execution Simulator

## Project Overview
The Temporal Durable Execution Simulator is a high-fidelity interactive dashboard designed to visualize the internal mechanics of the Temporal framework. It serves as an educational tool to demonstrate how workflow definitions, server-side task queues, and worker nodes interact to ensure resilient execution through state reconstruction and "replay."

## Core Objectives
- **Visual Education**: Make abstract concepts like "event sourcing" and "state reconstruction" tangible through synchronized UI updates.
- **Interactive Prototyping**: Allow users to define steps, trigger failures, and observe system recovery in real-time.
- **Architectural Clarity**: Clearly delineate the roles of the Temporal Client (Authoring), Temporal Server (Orchestration), and Worker Nodes (Execution).

## System Components

### 1. Temporal Client (Authoring & Triggers)
- **Workflow Definition Editor**: A dedicated sidebar for defining sequential steps (Logic, Activity, Timer).
- **Execution Controls**: Includes a "Run Workflow" button to initiate the sequence.
- **Active State Tracing**: Visual highlighting in the editor to indicate the current executing step.

### 2. Temporal Server (Orchestration)
- **Title & Branding**: A centralized "Temporal Server" column header to establish the orchestration layer.
- **Task Queue**: Visualizes the backlog of tasks waiting for worker pickup. 
  - **High-Fidelity Styling**: Consistent container styles across all task types (Logic, Activity, Timer).
  - **Status Indicators**: Support for "In-Progress" pulses and "Retrying" states with error indicators.
  - **Lifetime**: Tasks are removed a few seconds after they are completed.
- **Workflow Event History**: A detailed, high-fidelity table log of all system events.
  - **Format**: Timestamps follow the `yyyy-MM-dd hh:mm:ss:sss` pattern.
  - **Replay Visualization**: During Logic tasks, "Task Completed" history entries highlight sequentially to simulate state reconstruction.

### 3. Worker Nodes (Execution)
- **Node Management**: Simulated worker instances (e.g., `worker-node-1`, `worker-node-2`).
- **Failure Simulation**:
  - **Fail Task**: Triggers a failure state on the worker.
  - **Error Feedback**: Visual "Red X" (Failure) or "Red Clock" (Timeout) indicators appear on the worker task before it is evicted.
- **Resilience**: Failed tasks return to the Server Task Queue for retry, visually represented with error icons.

## Design Language
- **Theme**: "Temporal Simulator Console" (Dark Mode).
- **Color Palette**: Deep navy surfaces (#0B1326), high-contrast text, and semantic accents (Green for Success, Purple for Activities, Blue for Logic, Red for Errors).
- **Typography**: Inter (Modern, technical feel).
- **Interaction Patterns**: Synchronized highlighting between the Definition and History columns, subtle pulsing for active states, and timed transitions for error states.

## Key Behaviors
- **Synchronized Replay**: Logic tasks trigger a sequential highlight of all prior events in the Event History to show how the system recovers state.
- **Unified Task Styling**: Consistent UI for all task queue items to ensure focus remains on status and icons.
- **Automated Removal**: Worker tasks are automatically removed after a timeout or failure event to simulate eviction.