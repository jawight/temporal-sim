import React, { useContext, useEffect } from 'react';
import { SimulationContext } from '../../core/SimulationContext';
import { WorkerNodeState } from '../../core/types';

export const WorkerNode: React.FC<{ worker: WorkerNodeState }> = ({ worker }) => {
  const { state, dispatch } = useContext(SimulationContext)!;
  const { taskQueue } = state;

  useEffect(() => {
    if (worker.status === 'Idle' && taskQueue.length > 0) {
      const task = taskQueue[0];
      dispatch({ type: 'START_TASK', taskId: task.id, workerId: worker.id, timestamp: new Date().toLocaleTimeString() });
    }
  }, [worker.status, taskQueue, worker.id, dispatch]);

  useEffect(() => {
    if (worker.status === 'Working' && worker.currentTask) {
      const timer = setTimeout(() => {
        const randNum = Math.random() * 101;
        const resultValue = JSON.stringify({
          data: `The answer is ${Math.floor(randNum)}`
        });
        dispatch({ 
          type: 'COMPLETE_TASK', 
          taskId: worker.currentTask!.id, 
          timestamp: new Date().toLocaleTimeString(),
          resultValue
        });
      }, 2000); // Simulate processing time
      return () => clearTimeout(timer);
    }
  }, [worker.status, worker.currentTask, dispatch]);

  return (
    <div className="bg-surface-container-high border border-outline-variant rounded-DEFAULT p-1">
      <span className="p-2 font-body-md text-body-md font-semibold text-on-surface">worker-{worker.id.slice(-4)}</span>
      <div className={`border rounded-DEFAULT p-3 mt-2 flex flex-col gap-2 bg-surface-dim border-secondary/30`}>
        <div className="flex items-center gap-2">
          <span className="text-secondary text-[16px]">{worker.status === 'Working' ? (<i className='icon-hammer'></i>) : (<div className='polling-symbol'></div>)}</span>
          <span className="font-code-sm text-code-sm text-on-surface font-bold">
            {worker.status === 'Working' ? `Running: ${worker.currentTask?.stepId}` : 'Polling for tasks...'}
          </span>
        </div>
        {worker.status === 'Working' && (
          <div className='flex flex-col'>
            <div className="progress-bar border-tertiary"></div>
            {
            // <div className="w-full bg-surface-variant rounded-full h-1.5 overflow-hidden">
            //   <div className="bg-secondary h-1.5 rounded-full w-[65%]"></div>
            // </div>
            }
            <button 
              onClick={() => dispatch({ type: 'FAIL_TASK', taskId: worker.currentTask!.id, timestamp: new Date().toLocaleTimeString() })}
              disabled={worker.status !== 'Working'}
              className={`mt-2 flex-1 py-1 px-2 border border-outline-variant rounded-DEFAULT text-[10px] font-label-caps uppercase text-on-surface-variant 
                ${worker.status === 'Working' && "hover:bg-error-container/20 hover:text-error hover:border-error/50 transition-colors"}`}
            >
              Fail Task
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
