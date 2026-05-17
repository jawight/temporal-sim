export type TaskType = 'Workflow' | 'Activity' | 'Timer';
export type TaskState = 'Scheduled' | 'Started' | 'Completed' | 'Failed' | 'TimedOut';

export interface WorkflowStep {
  id: string;
  type: TaskType;
  name: string;
  color: string;
}

export interface EventLog {
  id: string;
  timestamp: string; // yyyy-MM-dd hh:mm:ss:sss
  eventType: string; // e.g., 'WorkflowExecutionStarted', 'ActivityTaskScheduled'
  details: string;
  value?: string;
  stepId?: string;
}

export interface TemporalTask {
  id: string;
  stepId: string;
  name: string;
  type: TaskType;
  state: TaskState;
  retryCount: number;
}

export interface WorkerNodeState {
  id: string;
  status: 'Idle' | 'Working' | 'Error';
  currentTask: TemporalTask | null;
}

export function nextPastel(seed: number) { 
  return `hsl(${(seed * 30) % 360}, 70%, 80%)`; 
}