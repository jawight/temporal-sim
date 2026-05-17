import { describe, it, expect } from 'vitest';
import { simulationReducer, initialState } from '../src/core/reducer';

describe('retry count', () => {
  it('should increment retry count correctly', () => {
    let state = initialState;

    // 1. Run workflow
    state = simulationReducer(state, { type: 'RUN_WORKFLOW', timestamp: '1' });
    const taskId = state.tasks[0].id;

    // 2. Fail task (expected: retry 0 -> 1)
    state = simulationReducer(state, { type: 'FAIL_TASK', taskId, timestamp: '2' });
    const retry1 = state.tasks[state.tasks.length - 1].retryCount;
    expect(retry1).toBe(1);

    // 3. Fail task (expected: retry 1 -> 2)
    state = simulationReducer(state, { type: 'FAIL_TASK', taskId, timestamp: '3' });
    const retry2 = state.tasks[state.tasks.length - 1].retryCount;
    expect(retry2).toBe(2);
  });
});
