import { WorkflowStep, TemporalTask, EventLog, WorkerNodeState } from './types';

export interface SimulationState {
  workflowSteps: WorkflowStep[];
  tasks: TemporalTask[];
  taskQueue: TemporalTask[]; // Add this
  eventHistory: EventLog[];
  workers: WorkerNodeState[];
  activeStepId: string | null;
  nextId: number;
  isPaused: boolean;
}

export type SimulationAction =
  | { type: 'ADD_WORKER', timestamp: string }
  | { type: 'RUN_WORKFLOW', timestamp: string }
  | { type: 'SCHEDULE_TASK', task: TemporalTask, timestamp: string }
  | { type: 'START_TASK', taskId: string, workerId: string, timestamp: string }
  | { type: 'COMPLETE_TASK', taskId: string, timestamp: string, resultValue?: string }
  | { type: 'FAIL_TASK', taskId: string, timestamp: string }
  | { type: 'UPDATE_STEP_NAME', stepId: string, name: string }
  | { type: 'TOGGLE_PAUSE' };

export const initialState: SimulationState = {
  workflowSteps: [
    { id: '1', type: 'Activity', name: 'CheckInventoryActivity', color: '#adc6ff' },
    { id: '2', type: 'Logic', name: 'VerifyStock', color: '#adc6ff' },
    { id: '3', type: 'Activity', name: 'ChargeCardActivity', color: '#adc6ff' },
  ],
  tasks: [],
  taskQueue: [],
  eventHistory: [],
  workers: [{ id: 'worker-1', status: 'Idle', currentTask: null }],
  activeStepId: null,
  nextId: 2,
  isPaused: false,
};

function newEventLog(id: string, timestamp: string, eventType: string, details: string, value: string, stepId?: string): EventLog{
  return { 
    id, 
    timestamp, 
    eventType, 
    details,
    value,
    stepId
  }
}

export function simulationReducer(state: SimulationState, action: SimulationAction): SimulationState {
  let nextId = state.nextId;

  switch (action.type) {
    case 'ADD_WORKER':
      return {
        ...state,
        workers: [...state.workers, { id: `worker-${nextId}`, status: 'Idle', currentTask: null }],
        nextId: nextId + 1
      };
    case 'RUN_WORKFLOW':{
      const step = state.workflowSteps[0];
      const workflowStartedLog = newEventLog((nextId++).toString(), action.timestamp, "Workflow Execution Started", "Workflow Type Name", "TemporalSimWorkflow");
      
      const newTask: TemporalTask = {
        id: `task-${nextId++}`,
        stepId: step.id,
        type: step.type,
        name: step.name,
        state: 'Scheduled',
        retryCount: 0
      };

      let eventType;
      let details;
      let value;
      switch (newTask.type) {
        case 'Activity': 
          eventType = 'Activity Task Scheduled'; 
          details = 'Attempt';
          value = (newTask.retryCount + 1).toString();
          break;
        case 'Logic': 
          eventType = 'Workflow Task Scheduled'; 
          details = 'Task Queue Name';
          value = "TheOnlyOne";
          break;
        case 'Timer': 
          eventType = 'Timer Started';
          details = 'Start time';
          value = action.timestamp;
          break;
      }

      const taskScheduledLog = newEventLog((nextId++).toString(), action.timestamp, eventType || 'Task Scheduled', details || '', value || '', newTask.stepId);

      return {
        ...state,
        tasks: [newTask],
        taskQueue: [newTask],
        eventHistory: [taskScheduledLog, workflowStartedLog],
        activeStepId: step.id,
        nextId: nextId
      };
    }
    case 'SCHEDULE_TASK':{
      const task: TemporalTask = {
        ...action.task,
        state: 'Scheduled',
      };
      let eventType;
      let details;
      let value;
      switch (task.type) {
        case 'Activity': 
          eventType = 'Activity Task Scheduled'; 
          details = 'Attempt';
          value = (task.retryCount + 1).toString();
          break;
        case 'Logic': 
          eventType = 'Workflow Task Scheduled'; 
          details = 'Task Queue Name';
          value = "TheOnlyOne";
          break;
        case 'Timer': 
          eventType = 'Timer Started';
          details = 'Start time';
          value = action.timestamp;
          break;
      }
      return {
        ...state,
        tasks: [...state.tasks, task],
        taskQueue: [...state.taskQueue, task],
        eventHistory: [newEventLog((nextId++).toString(), action.timestamp, eventType || 'Task Scheduled', details || '', value || '', task.stepId), ...state.eventHistory],
        nextId: nextId
      };
    }
    case 'START_TASK':{
      const task = state.taskQueue.find(t => t.id === action.taskId);
      if (!task) return state;
      let eventType;
      let details;
      let value;
      switch (task.type) {
        case 'Activity': 
          eventType = 'Activity Task Started'; 
          details = 'Activity Type';
          value = task.name;
          break;
        case 'Logic': 
          eventType = 'Workflow Task Started'; 
          const eventHistoryString = state.eventHistory.map(x => `${x.timestamp},${x.eventType},${x.details}`).join("\n");
          const byteCount = new TextEncoder().encode(eventHistoryString).length;
          details = 'History Size Bytes';
          value = byteCount.toString();
          break;
        case 'Timer': 
          return {
            ...state,
            taskQueue: state.taskQueue.filter(t => t.id !== action.taskId)
          };
      }
      return {
        ...state,
        taskQueue: state.taskQueue.filter(t => t.id !== action.taskId),
        workers: state.workers.map(w => w.id === action.workerId ? { ...w, status: 'Working', currentTask: task } : w),
        eventHistory: [newEventLog((nextId++).toString(), action.timestamp, eventType || 'Task Started', details || '', value || '', task.stepId), ...state.eventHistory],
        activeStepId: task.stepId,
        nextId: nextId
      };
    }
    case 'COMPLETE_TASK': {
      const completedTask = state.tasks.find(t => t.id === action.taskId);
      if (!completedTask) return state;
      let eventType;
      let details;
      let value;
      switch (completedTask.type) {
        case 'Activity': 
          eventType = 'Activity Task Completed'; 
          details = 'Result';
          value = action.resultValue || JSON.stringify({ data: 'No data' });
          break;
        case 'Logic': 
          eventType = 'Workflow Task Completed';
          const worker = state.workers.find(w => w.currentTask?.id === action.taskId);
          details = 'Identity';
          value = worker?.id?.toString() ?? "Unknown";
          break;
        case 'Timer':
          eventType = 'Timer Fired';
          details = 'Completed time';
          value = action.timestamp;
          break;
        default:
          return state;
      }

      const completedLog = newEventLog((nextId++).toString(), action.timestamp, eventType, details, value, completedTask.stepId);
      
      const currentIndex = state.workflowSteps.findIndex(s => s.id === completedTask.stepId);
      const nextStep = state.workflowSteps[currentIndex + 1];

      if (nextStep) {
        const newTask: TemporalTask = {
          id: `task-${nextId++}`,
          stepId: nextStep.id,
          type: nextStep.type,
          name: nextStep.name,
          state: 'Scheduled',
          retryCount: 0
        };

        let nextEventType;
        let nextDetails;
        let nextValue;
        switch (newTask.type) {
          case 'Activity': 
            nextEventType = 'Activity Task Scheduled'; 
            nextDetails = 'Attempt';
            nextValue = (newTask.retryCount + 1).toString();
            break;
          case 'Logic': 
            nextEventType = 'Workflow Task Scheduled'; 
            nextDetails = 'Task Queue Name';
            nextValue = "TheOnlyOne";
            break;
          case 'Timer': 
            nextEventType = 'Timer Started';
            nextDetails = 'Start time';
            nextValue = action.timestamp;
            break;
        }

        const taskScheduledLog = newEventLog((nextId++).toString(), action.timestamp, nextEventType || 'Task Scheduled', nextDetails || '', nextValue || '', newTask.stepId);

        return {
          ...state,
          tasks: [...state.tasks, newTask],
          taskQueue: [...state.taskQueue, newTask],
          workers: state.workers.map(w => w.currentTask?.id === action.taskId ? { ...w, status: 'Idle', currentTask: null } : w),
          eventHistory: [taskScheduledLog, completedLog, ...state.eventHistory],
          activeStepId: nextStep.id,
          nextId: nextId
        };
      } else {
        const workflowCompletedLog = newEventLog((nextId++).toString(), action.timestamp, "Workflow Execution Completed", "Result", '{"message": "It is done."}');

        return {
          ...state,
          workers: state.workers.map(w => w.currentTask?.id === action.taskId ? { ...w, status: 'Idle', currentTask: null } : w),
          eventHistory: [workflowCompletedLog, completedLog, ...state.eventHistory],
          activeStepId: null,
          nextId: nextId
        };
      }
    }
    case 'FAIL_TASK':{
      const failedTask = state.tasks.find(t => t.id === action.taskId);
      if (!failedTask) return state;
      
      const updatedWorkers = state.workers.map(w => w.currentTask?.id === action.taskId ? { ...w, status: 'Idle', currentTask: null } : w);
      
      const newTask: TemporalTask = {
        ...failedTask,
        state: 'Scheduled',
        retryCount: failedTask.retryCount + 1
      };

      let eventType = 'Activity Task Scheduled'; 
      let details = 'Attempt';
      let value = (newTask.retryCount + 1).toString();

      return {
        ...state,
        workers: updatedWorkers,
        tasks: [...state.tasks, newTask],
        taskQueue: [...state.taskQueue, newTask],
        eventHistory: [newEventLog((nextId++).toString(), action.timestamp, eventType, details, value, failedTask.stepId), ...state.eventHistory],
        activeStepId: failedTask.stepId,
        nextId: nextId
      };
    }
    case 'UPDATE_STEP_NAME':
      return {
        ...state,
        workflowSteps: state.workflowSteps.map(step =>
          step.id === action.stepId ? { ...step, name: action.name } : step
        ),
      };
    case 'TOGGLE_PAUSE':
      return {
        ...state,
        isPaused: !state.isPaused
      };
    default:
      return state;
  }
}
