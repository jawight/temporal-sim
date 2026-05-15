import { WorkflowStep, TemporalTask, EventLog, WorkerNodeState } from './types';

export interface SimulationState {
  workflowSteps: WorkflowStep[];
  tasks: TemporalTask[];
  taskQueue: TemporalTask[]; // Add this
  eventHistory: EventLog[];
  workers: WorkerNodeState[];
  activeStepId: string | null;
}

export type SimulationAction =
  | { type: 'ADD_WORKER' }
  | { type: 'RUN_WORKFLOW' }
  | { type: 'SCHEDULE_TASK', stepId: string }
  | { type: 'START_TASK', taskId: string, workerId: string }
  | { type: 'COMPLETE_TASK', taskId: string }
  | { type: 'FAIL_TASK', taskId: string };

export const initialState: SimulationState = {
  workflowSteps: [
    { id: '1', type: 'Activity', name: 'Check Inventory', color: '#adc6ff' },
    { id: '2', type: 'Logic', name: 'Verify Stock', color: '#adc6ff' },
    { id: '3', type: 'Activity', name: 'Charge Card', color: '#adc6ff' },
  ],
  tasks: [],
  taskQueue: [],
  eventHistory: [],
  workers: [{ id: Date.now().toString(), status: 'Idle', currentTask: null, color: '#4d8eff' }],
  activeStepId: null,
};

export function simulationReducer(state: SimulationState, action: SimulationAction): SimulationState {
  switch (action.type) {
    case 'ADD_WORKER':
      return {
        ...state,
        workers: [...state.workers, { id: Date.now().toString(), status: 'Idle', currentTask: null }],
      };
    case 'RUN_WORKFLOW':
      const newTasks: TemporalTask[] = state.workflowSteps.map(step => ({
        id: Date.now().toString() + step.id,
        stepId: step.id,
        type: step.type,
        state: 'Scheduled',
        retryCount: 0
      }));
      return {
        ...state,
        eventHistory: [
          ...state.eventHistory,
          { id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), eventType: 'WorkflowExecutionStarted', details: 'Workflow Execution Started' }
        ],
        tasks: [...state.tasks, ...newTasks],
        taskQueue: [...state.taskQueue, ...newTasks],
      };
    case 'SCHEDULE_TASK':
      return state;
    case 'START_TASK':
      const task = state.taskQueue.find(t => t.id === action.taskId);
      if (!task) return state;
      return {
        ...state,
        taskQueue: state.taskQueue.filter(t => t.id !== action.taskId),
        workers: state.workers.map(w => w.id === action.workerId ? { ...w, status: 'Working', currentTask: task } : w),
        eventHistory: [...state.eventHistory, { id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), eventType: 'ActivityTaskStarted', details: `Started task ${task.id}`, stepId: task.stepId }],
        activeStepId: task.stepId,
      };
    case 'COMPLETE_TASK':
      const completedTask = state.tasks.find(t => t.id === action.taskId);
      return {
        ...state,
        workers: state.workers.map(w => w.currentTask?.id === action.taskId ? { ...w, status: 'Idle', currentTask: null } : w),
        eventHistory: [...state.eventHistory, { id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), eventType: 'ActivityTaskCompleted', details: `Completed task ${action.taskId}`, stepId: completedTask?.stepId }],
        activeStepId: completedTask?.stepId || null,
      };
    case 'FAIL_TASK':
      const failedTask = state.tasks.find(t => t.id === action.taskId);
      if (!failedTask) return state;

      const updatedFailedTask = { ...failedTask, retryCount: failedTask.retryCount + 1, state: 'Scheduled' as const };

      return {
        ...state,
        workers: state.workers.map(w => w.currentTask?.id === action.taskId ? { ...w, status: 'Idle', currentTask: null } : w),
        taskQueue: [...state.taskQueue, updatedFailedTask],
        tasks: state.tasks.map(t => t.id === action.taskId ? updatedFailedTask : t),
        eventHistory: [...state.eventHistory, { id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), eventType: 'ActivityTaskFailed', details: `Failed task ${action.taskId}` }],
        activeStepId: failedTask.stepId,
      };
    default:
      return state;
  }
}
