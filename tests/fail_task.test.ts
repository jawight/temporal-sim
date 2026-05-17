import { describe, it, expect } from 'vitest';
import { simulationReducer, initialState } from '../src/core/reducer';

describe('fail task', () => {
  it('should only have 1 scheduled event after 2 failures', () => {
    let state = initialState;

    // 1. Run workflow
    state = simulationReducer(state, { type: 'RUN_WORKFLOW', timestamp: '1' });
    const taskId = state.tasks[0].id;
    const stepId = state.tasks[0].stepId;

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
});
