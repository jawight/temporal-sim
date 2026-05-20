import { WorkflowStep, TemporalTask, EventLog, WorkerNodeState, ReplayState } from './types';

export interface SimulationState {
  workflowSteps: WorkflowStep[];
  tasks: TemporalTask[];
  taskQueue: TemporalTask[];
  currentWorkflowId: string | null;
  replayState: ReplayState | null;
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
  | { type: 'REQUEUE_TASK', taskId: string }
  | { type: 'START_REPLAY', stepIndex: number }
  | { type: 'ADVANCE_REPLAY' }
  | { type: 'FINISH_REPLAY' }
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
  workers: [{ id: 'worker-1', status: 'Idle', currentTask: null, cachedWorkflowId: null }],
  activeStepId: null,
  nextId: 2,
  isPaused: false,
  currentWorkflowId: null,
  replayState: null
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
      const newWorker: WorkerNodeState = { id: `worker-${nextId}`, status: 'Idle', currentTask: null, cachedWorkflowId: null };
      return {
        ...state,
        workers: [...state.workers, newWorker],
        nextId: nextId + 1
      };
    case 'REMOVE_WORKER': {
      const worker = state.workers.find(w => w.id === action.workerId);
      if (worker && worker.currentTask) {
        return {
          ...state,
          workers: state.workers.filter(w => w.id !== action.workerId),
          taskQueue: state.taskQueue.map(t => t.id === worker.currentTask?.id ? { ...t, state: 'Scheduled' } : t)
        };
      }
      return {
        ...state,
        workers: state.workers.filter(w => w.id !== action.workerId)
      };
    }
    case 'REQUEUE_TASK': {
      return {
        ...state,
        taskQueue: state.taskQueue.map(t => t.id === action.taskId ? { ...t, state: 'Scheduled' } : t),
      };
    }
    case 'RUN_WORKFLOW':
      return runWorkflow(state, action.timestamp)
    case 'START_REPLAY':
      return {
        ...state,
        replayState: { stepIndex: 0, historyIndex: state.eventHistory.length - 1, highlightTarget: 'definition' }
      };
    case 'ADVANCE_REPLAY': 
      return advanceReplay(state);
    case 'FINISH_REPLAY':
      return {
        ...state,
        replayState: null
      };
    case 'SCHEDULE_TASK':
      return scheduleTask(state, action.task, action.timestamp);
    case 'START_TASK':
      return startTask(state, action.taskId, action.workerId, action.timestamp);
    case 'COMPLETE_TASK':
      return completeTask(state, action.taskId, action.timestamp, action.resultValue);
    case 'FAIL_TASK':
      return failTask(state, action.taskId, action.timestamp);
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

function scheduleTask(state: SimulationState, task: TemporalTask, timestamp: string) {
  let nextId = state.nextId;
  const t: TemporalTask = {
    ...task,
    state: 'Scheduled',
  };
  let eventType;
  let details;
  let value;
  switch (t.type) {
    case 'Activity': 
      eventType = 'Activity Task Scheduled'; 
      details = 'Attempt';
      value = (t.retryCount + 1).toString();
      break;
    case 'Workflow': 
      eventType = 'Workflow Task Scheduled'; 
      details = 'Task Queue Name';
      value = "TheOnlyOne";
      break;
    case 'Timer': 
      eventType = 'Timer Started';
      details = 'Start time';
      value = timestamp;
      break;
  }
  return {
    ...state,
    tasks: [...state.tasks, t],
    taskQueue: [...state.taskQueue, t],
    eventHistory: [newEventLog((nextId++).toString(), timestamp, eventType || 'Task Scheduled', details || '', value || '', t.stepId), ...state.eventHistory],
    nextId: nextId
  };
}

function startTask(state: SimulationState, taskId: string, workerId: string, timestamp: string): SimulationState {
  let nextId = state.nextId;
  const task = state.taskQueue.find(t => t.id === taskId);
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
        taskQueue: state.taskQueue.filter(t => t.id !== taskId)
      };
    }
    
    const worker = state.workers.find(w => w.id === workerId);
    const isRehydrationNeeded = (task.type === 'Workflow' || task.type === 'Activity') &&
                                  state.eventHistory.length > 0 &&
                                  worker?.cachedWorkflowId !== state.currentWorkflowId;

    const baseState: SimulationState = {
      ...state,
      taskQueue: state.taskQueue.map(t => t.id === taskId ? { ...t, state: 'Started' } : t),
      workers: state.workers.map(w => w.id === workerId ? { ...w, status: 'Working', currentTask: task } : w),
      eventHistory: [newEventLog((nextId++).toString(), timestamp, eventType || 'Task Started', details || '', value || '', task.stepId), ...state.eventHistory],
      activeStepId: task.stepId,
      nextId: nextId
    };
    
    if (isRehydrationNeeded) {
        return { ...baseState, replayState: { isActive: true, stepIndex: 0, historyIndex: state.eventHistory.length-1, highlightTarget: 'definition' } };
    }
    
    return baseState;
}

function completeTask(state: SimulationState, taskId: string, timestamp: string, resultValue?: string): SimulationState {
  let nextId = state.nextId;
  const completedTask = [...state.tasks].reverse().find(t => t.id === taskId);
  if (!completedTask) return state;
  
  const worker = state.workers.find(w => w.currentTask?.id === taskId);
  const isTimer = completedTask.type === 'Timer';
  
  const updatedWorkers = state.workers.map(w => {
      if (w.id === worker?.id) return { ...w, cachedWorkflowId: isTimer ? null : state.currentWorkflowId };
      if (isTimer) return { ...w, cachedWorkflowId: null };
      return w;
  });

  let eventType;
  let details;
  let value;
  switch (completedTask.type) {
    case 'Activity': 
      eventType = 'Activity Task Completed'; 
      details = 'Result';
      value = resultValue || JSON.stringify({ data: 'No data' });
      break;
    case 'Workflow': 
      eventType = 'Workflow Task Completed';
      details = 'Identity';
      value = worker?.id?.toString() ?? "Unknown";
      break;
    case 'Timer':
      eventType = 'Timer Fired';
      details = 'Completed time';
      value = timestamp;
      break;
    default:
      return state;
  }

  const completedLog = newEventLog((nextId++).toString(), timestamp, eventType, details, value, completedTask.stepId);
  
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

      const taskScheduledLog = newEventLog((nextId++).toString(), timestamp, 'Workflow Task Scheduled', 'Task Queue Name', 'TheOnlyOne', newTask.stepId);

      return {
          ...state,
          tasks: [...state.tasks, newTask],
          taskQueue: [...state.taskQueue.filter(t => t.id !== taskId), newTask],
          workers: updatedWorkers.map(w => w.currentTask?.id === taskId ? { ...w, status: 'Idle', currentTask: null } : w),
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
            let nextValue = nextStep.type === 'Activity' ? (newTask.retryCount + 1).toString() : timestamp;
            
            const taskScheduledLog = newEventLog((nextId++).toString(), timestamp, nextEventType, nextDetails, nextValue, newTask.stepId);
            
            return {
                ...state,
                tasks: [...state.tasks, newTask],
                taskQueue: [...state.taskQueue.filter(t => t.id !== taskId), newTask],
                workers: updatedWorkers.map(w => w.currentTask?.id === taskId ? { ...w, status: 'Idle', currentTask: null } : w),
                eventHistory: [taskScheduledLog, completedLog, ...state.eventHistory],
                activeStepId: nextStep.id,
                nextId: nextId
            };
          }
      }
      // Workflow completed
      const workflowCompletedLog = newEventLog((nextId++).toString(), timestamp, "Workflow Execution Completed", "Result", '{"message": "It is done."}');

      return {
        ...state,
        workers: updatedWorkers.map(w => w.currentTask?.id === taskId ? { ...w, status: 'Idle', currentTask: null } : w),
        taskQueue: state.taskQueue.filter(t => t.id !== taskId),
        eventHistory: [workflowCompletedLog, completedLog, ...state.eventHistory],
        activeStepId: null,
        nextId: nextId
      };
  } else if (completedTask.type === 'Timer') {
      return {
        ...state,
        workers: updatedWorkers.map(w => w.currentTask?.id === taskId ? { ...w, status: 'Idle', currentTask: null } : w),
        taskQueue: state.taskQueue.filter(t => t.id !== taskId),
        eventHistory: [completedLog, ...state.eventHistory],
        activeStepId: null,
        nextId: nextId
      };
  }
  return state;
}

function failTask(state: SimulationState, taskId: string, timestamp: string): SimulationState {
  let nextId = state.nextId;
  const failedTask = [...state.tasks].reverse().find(t => t.id === taskId);
  if (!failedTask) return state;

  const updatedWorkers: WorkerNodeState[] = state.workers.map(w => w.currentTask?.id === taskId ? { ...w, status: 'Idle', currentTask: null } : w);

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
          newEventHistory[0] = { ...lastEvent, timestamp: timestamp };
      } else {
          // Add new Failure event
          newEventHistory = [newEventLog((nextId++).toString(), timestamp, failureEventType, 'Failure Message', 'Example failure message', failedTask.stepId), ...newEventHistory];
      }
  }

  // Update/Add Scheduled event
  const scheduledEventIndex = newEventHistory.findIndex(e => e.stepId === failedTask.stepId && e.eventType === scheduledEventType);
  if (failedTask.type === 'Activity' && scheduledEventIndex !== -1) {
      newEventHistory[scheduledEventIndex] = { ...newEventHistory[scheduledEventIndex], timestamp: timestamp, value: scheduledValue };
  } else {
      newEventHistory = [newEventLog((nextId++).toString(), timestamp, scheduledEventType, scheduledDetails, scheduledValue, failedTask.stepId), ...newEventHistory];
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
    taskQueue: [...state.taskQueue.filter(t => t.id !== taskId), newTask],
    eventHistory: newEventHistory,
    activeStepId: failedTask.stepId,
    nextId: nextId
  };
}

function runWorkflow(state: SimulationState, timestamp: string): SimulationState {
  let nextId = state.nextId;
  const firstStep = state.workflowSteps[0];
  const workflowStartedLog = newEventLog((nextId++).toString(), timestamp, "Workflow Execution Started", "Workflow Type Name", "TemporalSimWorkflow");
  
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
      value = timestamp;
      break;
  }

  const taskScheduledLog = newEventLog((nextId++).toString(), timestamp, eventType || 'Task Scheduled', details || '', value || '', newTask.stepId);

  return {
    ...state,
    tasks: [newTask],
    taskQueue: [newTask],
    currentWorkflowId: newTask.id,
    eventHistory: [taskScheduledLog, workflowStartedLog],
    activeStepId: firstStep ? firstStep.id : null,
    nextId: nextId
  };
}


function advanceReplay(state: SimulationState): SimulationState {
  const rpState = state.replayState;
  if (!rpState) return {
    ...state,
    replayState: null
  };

  const step = state.workflowSteps.at(rpState.stepIndex);

  if (!step){
    console.error("No valid workflow step found while replaying. StepId: ", rpState.stepIndex);
    return {
      ...state,
      replayState: null
    };
  }

  const nextLogIdx = nextMatchingLogIndex(rpState.historyIndex, step.id, state.eventHistory);
  if (nextLogIdx) return {
    ...state,
    replayState: {
      ...rpState,
      highlightTarget: 'history',
      historyIndex: nextLogIdx,
    }
  };

  // NOTE: If there are no events for this step, then it hasn't run yet and we should finish the replay animation.
  if (!state.eventHistory.find(e => e.stepId === step.id)) {
    return {
      ...state,
      replayState: null,
    }
  }

  const nextStepIdx = rpState.stepIndex + 1;
  if (nextStepIdx >= state.workflowSteps.length){
    return {
      ...state,
      replayState: null,
    }
  }

  return {
    ...state,
    replayState: {
      ...rpState,
      highlightTarget: 'definition',
      stepIndex: nextStepIdx,
    }
  };
}

function nextMatchingLogIndex(endIdx: number, stepId: string, history: EventLog[]): number | undefined {
  const index = history.slice(0,endIdx).findLastIndex(log => log.stepId === stepId);
  return index === -1 ? undefined : index;
}