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
  | { type: 'REMOVE_WORKER', workerId: string }
  | { type: 'UPDATE_STEP_NAME', stepId: string, name: string }
  | { type: 'TOGGLE_PAUSE' };

export const initialState: SimulationState = {
  workflowSteps: [
    { id: '1', type: 'Activity', name: 'CheckInventoryActivity', color: '#adc6ff' },
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
    case 'REMOVE_WORKER':
      return {
        ...state,
        workers: state.workers.filter(w => w.id !== action.workerId)
      };
    case 'RUN_WORKFLOW':{
      const firstStep = state.workflowSteps[0];
      const workflowStartedLog = newEventLog((nextId++).toString(), action.timestamp, "Workflow Execution Started", "Workflow Type Name", "TemporalSimWorkflow");
      
      const newTask: TemporalTask = {
        id: `task-${nextId++}`,
        stepId: firstStep ? firstStep.id : 'none',
        type: 'Workflow',
        name: 'Workflow Logic',
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
        case 'Workflow': 
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
        activeStepId: firstStep ? firstStep.id : null,
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
        case 'Workflow': 
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
        case 'Workflow': 
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
        taskQueue: state.taskQueue.map(t => t.id === action.taskId ? { ...t, state: 'Started' } : t),
        workers: state.workers.map(w => w.id === action.workerId ? { ...w, status: 'Working', currentTask: task } : w),
        eventHistory: [newEventLog((nextId++).toString(), action.timestamp, eventType || 'Task Started', details || '', value || '', task.stepId), ...state.eventHistory],
        activeStepId: task.stepId,
        nextId: nextId
      };
    }
    case 'COMPLETE_TASK': {
      const completedTask = [...state.tasks].reverse().find(t => t.id === action.taskId);
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
        case 'Workflow': 
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
      
      // If completed Activity, schedule Workflow task
      if (completedTask.type === 'Activity') {
          const currentIndex = state.workflowSteps.findIndex(s => s.id === completedTask.stepId);
          const nextStep = state.workflowSteps[currentIndex + 1];

          const newTask: TemporalTask = {
              id: `task-${nextId++}`,
              stepId: nextStep ? nextStep.id : 'none',
              type: 'Workflow',
              name: 'Workflow Logic',
              state: 'Scheduled',
              retryCount: 0
          };

          const taskScheduledLog = newEventLog((nextId++).toString(), action.timestamp, 'Workflow Task Scheduled', 'Task Queue Name', 'TheOnlyOne', newTask.stepId);

          return {
              ...state,
              tasks: [...state.tasks, newTask],
              taskQueue: [...state.taskQueue.filter(t => t.id !== action.taskId), newTask],
              workers: state.workers.map(w => w.currentTask?.id === action.taskId ? { ...w, status: 'Idle', currentTask: null } : w),
              eventHistory: [taskScheduledLog, completedLog, ...state.eventHistory],
              activeStepId: null,
              nextId: nextId
          };
      } else if (completedTask.type === 'Workflow') {
          // If completed Workflow task, schedule next activity (if any)
          if (completedTask.stepId !== 'none') {
             const nextStep = state.workflowSteps.find(s => s.id === completedTask.stepId);
             if (nextStep) {
                const newTask: TemporalTask = {
                  id: `task-${nextId++}`,
                  stepId: nextStep.id,
                  type: nextStep.type,
                  name: nextStep.name,
                  state: 'Scheduled',
                  retryCount: 0
                };
                
                let nextEventType = nextStep.type === 'Activity' ? 'Activity Task Scheduled' : 'Timer Started';
                let nextDetails = nextStep.type === 'Activity' ? 'Attempt' : 'Start time';
                let nextValue = nextStep.type === 'Activity' ? (newTask.retryCount + 1).toString() : action.timestamp;
                
                const taskScheduledLog = newEventLog((nextId++).toString(), action.timestamp, nextEventType, nextDetails, nextValue, newTask.stepId);
                
                return {
                    ...state,
                    tasks: [...state.tasks, newTask],
                    taskQueue: [...state.taskQueue.filter(t => t.id !== action.taskId), newTask],
                    workers: state.workers.map(w => w.currentTask?.id === action.taskId ? { ...w, status: 'Idle', currentTask: null } : w),
                    eventHistory: [taskScheduledLog, completedLog, ...state.eventHistory],
                    activeStepId: nextStep.id,
                    nextId: nextId
                };
             }
          }
          // Workflow completed
          const workflowCompletedLog = newEventLog((nextId++).toString(), action.timestamp, "Workflow Execution Completed", "Result", '{"message": "It is done."}');

          return {
            ...state,
            workers: state.workers.map(w => w.currentTask?.id === action.taskId ? { ...w, status: 'Idle', currentTask: null } : w),
            taskQueue: state.taskQueue.filter(t => t.id !== action.taskId),
            eventHistory: [workflowCompletedLog, completedLog, ...state.eventHistory],
            activeStepId: null,
            nextId: nextId
          };
      }
      return state;
    }
    case 'FAIL_TASK':{
      const failedTask = [...state.tasks].reverse().find(t => t.id === action.taskId);
      if (!failedTask) return state;
      
      const updatedWorkers = state.workers.map(w => w.currentTask?.id === action.taskId ? { ...w, status: 'Idle', currentTask: null } : w);
      
      const newTask: TemporalTask = {
        ...failedTask,
        state: 'Scheduled',
        retryCount: failedTask.retryCount + 1
      };

      let scheduledEventType = failedTask.type === 'Workflow' ? 'Workflow Task Scheduled' : 'Activity Task Scheduled';
      let scheduledDetails = failedTask.type === 'Workflow' ? 'Task Queue Name' : 'Attempt';
      let scheduledValue = failedTask.type === 'Workflow' ? 'TheOnlyOne' : (newTask.retryCount + 1).toString();
      let startedEventType = failedTask.type === 'Workflow' ? 'Workflow Task Started' : 'Activity Task Started';
      let failureEventType = failedTask.type === 'Workflow' ? 'Workflow Task Failed' : 'Activity Task Failed';

      // Find Scheduled event
      const oldScheduledEventIndex = state.eventHistory.findIndex(e => e.stepId === failedTask.stepId && e.eventType === scheduledEventType);
      
      // Find Started event
      const oldStartedEventIndex = state.eventHistory.findIndex(e => e.stepId === failedTask.stepId && e.eventType === startedEventType);
      
      let newEventHistory = [...state.eventHistory];
      
      // Update/Add Failure event
      if (failedTask.type !== 'Activity') {
          const lastEvent = newEventHistory[0];
          if (lastEvent && lastEvent.eventType === failureEventType && lastEvent.stepId === failedTask.stepId) {
              // Update timestamp of the existing failure event
              newEventHistory[0] = { ...lastEvent, timestamp: action.timestamp };
          } else {
              // Add new Failure event
              newEventHistory = [newEventLog((nextId++).toString(), action.timestamp, failureEventType, 'Failure Message', 'Example failure message', failedTask.stepId), ...newEventHistory];
          }
      }
      
      // Update/Add Scheduled event
      const scheduledEventIndex = newEventHistory.findIndex(e => e.stepId === failedTask.stepId && e.eventType === scheduledEventType);
      if (failedTask.type === 'Activity' && scheduledEventIndex !== -1) {
          newEventHistory[scheduledEventIndex] = { ...newEventHistory[scheduledEventIndex], timestamp: action.timestamp, value: scheduledValue };
      } else {
          newEventHistory = [newEventLog((nextId++).toString(), action.timestamp, scheduledEventType, scheduledDetails, scheduledValue, failedTask.stepId), ...newEventHistory];
      }

      // Remove old Started event
      if (failedTask.type !== 'Workflow') {
          const startedEventIndex = newEventHistory.findIndex(e => e.stepId === failedTask.stepId && e.eventType === startedEventType);
          if (startedEventIndex !== -1) {
              newEventHistory.splice(startedEventIndex, 1);
          }
      }

      return {
        ...state,
        workers: updatedWorkers,
        tasks: [...state.tasks, newTask],
        taskQueue: [...state.taskQueue.filter(t => t.id !== action.taskId), newTask],
        eventHistory: newEventHistory,
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
