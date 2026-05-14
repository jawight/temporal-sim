import React, { useContext } from 'react';
import { SimulationContext } from './core/SimulationContext';
import { TemporalClient } from './components/Client/TemporalClient';
import { WorkerNode } from './components/Worker/WorkerNode';
import { EventHistory } from './components/Server/EventHistory';

const App: React.FC = () => {
  const { state, dispatch } = useContext(SimulationContext)!;
  const { workers, taskQueue } = state;

  const addWorker = () => {
    dispatch({ type: 'ADD_WORKER' });
  };

  return (
    <div className="font-body-md text-body-md bg-background text-on-background h-screen flex flex-col overflow-hidden">
      <header className="bg-surface-container-low border-b border-outline-variant flex justify-between items-center w-full px-margin-desktop h-16 shrink-0 z-20">
        <div className="flex items-center gap-gutter">
          <span className="font-headline-md text-headline-md font-bold text-primary">Temporal Sim v1.0</span>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 flex gap-panel-gap bg-outline-variant p-panel-gap overflow-hidden">
          <TemporalClient />
          <section className="flex flex-col flex-1 bg-surface h-full min-w-[400px]">
            <div className="bg-surface-container-low border-b border-outline-variant p-3 sticky top-0 z-20">
              <h1 className="font-headline-md text-headline-md font-bold text-on-surface">Temporal Server</h1>
            </div>
            <div className="flex-1 flex flex-col border-b border-outline-variant overflow-hidden">
              <div className="bg-surface-container-low border-b border-outline-variant p-3 flex justify-between items-center sticky top-0 z-10">
                <h2 className="font-headline-md text-headline-md text-on-surface">Task Queue</h2>
              </div>
              <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-2">
                {taskQueue.map((task) => (
                  <div key={task.id} className="bg-surface-container-low flex items-center p-3 border border-outline-variant rounded-DEFAULT gap-4">
                    <div className="w-8 h-8 rounded-DEFAULT bg-tertiary-container/20 flex items-center justify-center border border-tertiary/30 shrink-0">
                      <span className="material-symbols-outlined text-tertiary">check_circle</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-body-md text-body-md font-semibold text-on-surface truncate">{task.stepId}</span>
                        <span className="bg-primary-container text-on-primary-container font-code-sm text-code-sm px-1.5 py-[2px] rounded-sm text-[10px]">{task.type}</span>
                      </div>
                      <div className="font-code-sm text-code-sm text-on-surface-variant truncate">TaskID: {task.id.slice(-6)} | {task.state}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <EventHistory />
          </section>
          <section className="flex flex-col bg-surface w-1/4 min-w-[280px] h-full overflow-y-auto">
            <div className="bg-surface-container-low border-b border-outline-variant p-3 sticky top-0 z-10 flex justify-between items-center">
              <h2 className="font-headline-md text-headline-md text-on-surface">Worker Nodes</h2>
              <span className="bg-tertiary/10 text-tertiary border border-tertiary/30 font-label-caps text-label-caps px-2 py-0.5 rounded-full flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>{workers.length} Active</span>
            </div>
            <div className="p-4 flex flex-col gap-4">
              {workers.map(worker => (
                <WorkerNode key={worker.id} worker={worker} />
              ))}
              <button onClick={addWorker} className="border border-outline-variant bg-surface-container text-on-surface font-label-caps text-label-caps py-2 rounded-DEFAULT hover:bg-surface-container-highest transition-colors duration-200 mt-2">
                Add Worker
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default App;
