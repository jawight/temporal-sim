import React, { useContext, useEffect } from 'react';
import { SimulationContext } from '../../core/SimulationContext';
import { WorkerNodeState } from '../../core/types';

export const WorkerNode: React.FC<{ worker: WorkerNodeState }> = ({ worker }) => {
  const { state, dispatch } = useContext(SimulationContext)!;
  const { taskQueue } = state;

  useEffect(() => {
    if (worker.status === 'Idle' && taskQueue.length > 0) {
      const task = taskQueue[0];
      dispatch({ type: 'START_TASK', taskId: task.id, workerId: worker.id });
    }
  }, [worker.status, taskQueue, worker.id, dispatch]);

  useEffect(() => {
    if (worker.status === 'Working' && worker.currentTask) {
      const timer = setTimeout(() => {
        dispatch({ type: 'COMPLETE_TASK', taskId: worker.currentTask!.id });
      }, 2000); // Simulate processing time
      return () => clearTimeout(timer);
    }
  }, [worker.status, worker.currentTask, dispatch]);

  return (
    <div className="bg-surface-container-high border border-outline-variant rounded-DEFAULT p-3">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary">engineering</span>
          <span className="font-body-md text-body-md font-semibold text-on-surface">worker-{worker.id.slice(-4)}</span>
        </div>
        <span className="text-on-surface-variant font-code-sm text-code-sm">v1.22.0</span>
      </div>
      <div className={`border rounded-DEFAULT p-2 flex flex-col gap-2 ${worker.status === 'Working' ? 'bg-secondary-container/10 border-secondary/30' : 'bg-surface-dim border-outline-variant/50'}`}>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-[16px]">build</span>
          <span className="font-code-sm text-code-sm text-on-surface font-bold">
            {worker.status === 'Working' ? `Running: ${worker.currentTask?.stepId}` : 'Polling for tasks...'}
          </span>
        </div>
        {worker.status === 'Working' && (
          <div className="w-full bg-surface-variant rounded-full h-1.5 overflow-hidden">
            <div className="bg-secondary h-1.5 rounded-full w-[65%]"></div>
          </div>
        )}
        <div className="flex gap-2 mt-2">
          <button 
            onClick={() => dispatch({ type: 'FAIL_TASK', taskId: worker.currentTask!.id })}
            className="flex-1 py-1 px-2 border border-outline-variant rounded-DEFAULT text-[10px] font-label-caps text-on-surface-variant hover:bg-error-container/20 hover:text-error hover:border-error/50 transition-colors uppercase"
            disabled={worker.status !== 'Working'}
          >
            Fail Task
          </button>
          <button className="flex-1 py-1 px-2 border border-outline-variant rounded-DEFAULT text-[10px] font-label-caps text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface transition-colors uppercase" disabled>
            Timeout
          </button>
        </div>
      </div>
    </div>
  );
};
