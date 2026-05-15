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
  | { type: 'SCHEDULE_TASK', task: TemporalTask }
  | { type: 'START_TASK', taskId: string, workerId: string }
  | { type: 'COMPLETE_TASK', taskId: string }
  | { type: 'FAIL_TASK', taskId: string }
  | { type: 'UPDATE_STEP_NAME', stepId: string, name: string };

export const initialState: SimulationState = {
  workflowSteps: [
    { id: '1', type: 'Activity', name: 'CheckInventoryActivity', color: '#adc6ff' },
    { id: '2', type: 'Logic', name: 'VerifyStock', color: '#adc6ff' },
    { id: '3', type: 'Activity', name: 'ChargeCardActivity', color: '#adc6ff' },
  ],
  tasks: [],
  taskQueue: [],
  eventHistory: [],
  workers: [{ id: Date.now().toString(), status: 'Idle', currentTask: null }],
  activeStepId: null,
};

function newEventLog(eventType: string, details: string, value: string, stepId?: string): EventLog{
  return { 
    id: Date.now().toString(), 
    timestamp: new Date().toLocaleTimeString(), 
    eventType, 
    details,
    value,
    stepId
  }
}

export function simulationReducer(state: SimulationState, action: SimulationAction): SimulationState {
  switch (action.type) {
    case 'ADD_WORKER':
      return {
        ...state,
        workers: [...state.workers, { id: Date.now().toString(), status: 'Idle', currentTask: null }],
      };
    case 'RUN_WORKFLOW':{
      const step = state.workflowSteps[0];
      const temp = {
        ...state,
        tasks: [],
        taskQueue: [],
        eventHistory: [newEventLog("Workflow Execution Started", "Workflow Type Name", "TemporalSimWorkflow")],
        activeStepId: step.id
      };
      const newTask: TemporalTask = {
        id: Date.now().toString() + step.id,
        stepId: step.id,
        type: step.type,
        name: step.name,
        state: 'Scheduled',
        retryCount: 0
      };
      return simulationReducer(temp, {type: 'SCHEDULE_TASK', task: newTask})
    }
    case 'SCHEDULE_TASK':{
      if (!action.task) return state;
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
          value = new Date().toLocaleTimeString();
          // IF THE TASK IS A TIMER, IT SHOULD NOT BE ADDED TO THE TASK QUEUE.
          break;
      }
      return {
        ...state,
        tasks: [...state.tasks, task],
        taskQueue: [...state.taskQueue, task],
        eventHistory: [newEventLog(eventType, details, value, task.stepId), ...state.eventHistory],
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
          console.error("Found a timer in the task queue.", task.name)
          // IF THE TASK IS A TIMER, IT SHOULD NOT BE ADDED TO THE TASK QUEUE.return 
          return {
            ...state,
            taskQueue: state.taskQueue.filter(t => t.id !== action.taskId)
          };
      }
      return {
        ...state,
        taskQueue: state.taskQueue.filter(t => t.id !== action.taskId),
        workers: state.workers.map(w => w.id === action.workerId ? { ...w, status: 'Working', currentTask: task } : w),
        eventHistory: [newEventLog(eventType, details, value, task.stepId), ...state.eventHistory],
        activeStepId: task.stepId,
      };
    }
    case 'COMPLETE_TASK':
      const completedTask = state.tasks.find(t => t.id === action.taskId);
      let eventType;
      let details;
      let value;
      switch (completedTask?.type) {
        case 'Activity': 
          eventType = 'Activity Task Completed'; 
          details = 'Result';
          const randNum = Math.random()*101;
          value = JSON.stringify({
            data: `The answer is ${Math.floor(randNum)}`
          });
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
          value = new Date().toLocaleTimeString();
          break;
        default:
          console.error("Couldn't find the completed task in the tasks list.")
          return state;
      }
      return {
        ...state,
        workers: state.workers.map(w => w.currentTask?.id === action.taskId ? { ...w, status: 'Idle', currentTask: null } : w),
        eventHistory: [newEventLog(eventType, details, value, completedTask.stepId), ...state.eventHistory],
        activeStepId: completedTask?.stepId || null,
      };
    case 'FAIL_TASK':{
      const failedTask = state.tasks.find(t => t.id === action.taskId);
      if (!failedTask) return state;
      const temp: SimulationState = {
        ...state,
        workers: state.workers.map(w => w.currentTask?.id === action.taskId ? { ...w, status: 'Idle', currentTask: null } : w),
        activeStepId: failedTask?.stepId || null,
      };
      return simulationReducer(temp, {type: 'SCHEDULE_TASK', task: {...failedTask, retryCount: failedTask.retryCount + 1, state: 'Scheduled' }});
    }
    case 'UPDATE_STEP_NAME':
      return {
        ...state,
        workflowSteps: state.workflowSteps.map(step =>
          step.id === action.stepId ? { ...step, name: action.name } : step
        ),
      };
    default:
      return state;
  }
}
