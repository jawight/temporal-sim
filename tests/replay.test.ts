import { describe, it, expect } from 'vitest';
import { simulationReducer, initialState } from '../src/core/reducer';

describe('replay animation', () => {
  it('should progress through all history events', () => {
    let state = initialState;

    // 1. Run workflow to generate some history
    state = simulationReducer(state, { type: 'RUN_WORKFLOW', timestamp: '1' });
    
    // We need more events to make the replay interesting
    const taskId = state.tasks[0].id;
    const workerId = state.workers[0].id;
    
    // Start task
    state = simulationReducer(state, { type: 'START_TASK', taskId, workerId, timestamp: '2' });
    // Complete task
    state = simulationReducer(state, { type: 'COMPLETE_TASK', taskId, timestamp: '3' });

    // 2. Start replay
    state = simulationReducer(state, { type: 'START_REPLAY', stepIndex: 0 });
    
    // Verify initial replay state
    expect(state.replayState).not.toBeNull();
    
    // 3. Advance replay
    // We should expect it to progress multiple times
    let steps = 0;
    while (state.replayState && steps < 10) {
      state = simulationReducer(state, { type: 'ADVANCE_REPLAY' });
      steps++;
    }
    
    // Should have finished
    expect(state.replayState).toBeNull();
  });
});
