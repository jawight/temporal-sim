import { describe, it, expect } from 'vitest';
import { simulationReducer, initialState } from '../src/core/reducer';

describe('fail task', () => {
  it('should only have 1 scheduled event after 2 failures', () => {
    let state = initialState;

    // 1. Run workflow
    state = simulationReducer(state, { type: 'RUN_WORKFLOW', timestamp: '1' });
    // Implicit Workflow Task is scheduled. Complete it to start the first activity.
    state = simulationReducer(state, { type: 'COMPLETE_TASK', taskId: state.tasks[state.tasks.length - 1].id, timestamp: '1.5' });
    
    const taskId = state.tasks[state.tasks.length - 1].id;
    const stepId = state.tasks[state.tasks.length - 1].stepId;

    // 2. Fail task
    state = simulationReducer(state, { type: 'FAIL_TASK', taskId, timestamp: '2' });

    // Check event history for scheduled events
    const scheduledEvents = state.eventHistory.filter(e => e.eventType === 'Activity Task Scheduled' && e.stepId === stepId);
    expect(scheduledEvents.length).toBe(1);

    // 3. Fail task again
    state = simulationReducer(state, { type: 'FAIL_TASK', taskId, timestamp: '3' });

    // Check event history again
    const scheduledEvents2 = state.eventHistory.filter(e => e.eventType === 'Activity Task Scheduled' && e.stepId === stepId);
    expect(scheduledEvents2.length).toBe(1);
  });

  it('should replace started event when task fails', () => {
    let state = initialState;

    // 1. Run workflow and start the task
    state = simulationReducer(state, { type: 'RUN_WORKFLOW', timestamp: '1' });
    // Complete Workflow Task
    state = simulationReducer(state, { type: 'COMPLETE_TASK', taskId: state.tasks[state.tasks.length - 1].id, timestamp: '1.5' });
    
    const taskId = state.tasks[state.tasks.length - 1].id;
    const workerId = state.workers[0].id;
    
    // Start task
    state = simulationReducer(state, { type: 'START_TASK', taskId, workerId, timestamp: '2' });
    
    // Check that started event exists
    const startedEvents = state.eventHistory.filter(e => e.eventType === 'Activity Task Started');
    expect(startedEvents.length).toBe(1);

    // 2. Fail task
    state = simulationReducer(state, { type: 'FAIL_TASK', taskId, timestamp: '3' });

    // Check that started event is replaced
    const startedEventsAfterFail = state.eventHistory.filter(e => e.eventType === 'Activity Task Started');
    const failedEventsAfterFail = state.eventHistory.filter(e => e.eventType === 'Activity Task Failed');
    
    expect(startedEventsAfterFail.length).toBe(0);
    expect(failedEventsAfterFail.length).toBe(0);
  });
});
