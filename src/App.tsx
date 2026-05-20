import React, { useContext } from 'react';
import { SimulationContext } from './core/SimulationContext';
import { TemporalClient } from './components/Client/TemporalClient';
import { WorkerNode } from './components/Worker/WorkerNode';
import { EventHistory } from './components/Server/EventHistory';

const App: React.FC = () => {
  const { state, dispatch } = useContext(SimulationContext)!;
  const { workers, taskQueue, isPaused, replayState, eventHistory } = state;

  const addWorker = () => {
    dispatch({ type: 'ADD_WORKER', timestamp: new Date().toLocaleTimeString() });
  };

  React.useEffect(() => {
    if (!replayState.isActive) return;

    const timer = setTimeout(() => {
        // Simple completion check: does the event history contain a 'Completed' log for the current step?
        // Step IDs in workflowSteps start at '1'.
        const currentStepId = (replayState.stepIndex + 1).toString();
        const isCompleted = eventHistory.some(log => log.stepId === currentStepId && log.eventType.includes('Completed'));

        if (isCompleted || replayState.highlightTarget === 'history') {
             // If we've already done history (highlightTarget === 'history'), 
             // and we are here, it means we should probably advance.
             // Wait, the plan says: "Cycle highlights (1-second intervals) between the Workflow Definition steps and the Event History logs."
             // And "If [completed log exists] it advances. If not, the animation stops."
             
             // My implementation of ADVANCE_REPLAY in reducer toggles highlightTarget:
             // highlightTarget: state.replayState.highlightTarget === 'definition' ? 'history' : 'definition'
             
             // This needs to be more robust.
             dispatch({ type: 'ADVANCE_REPLAY' });
        } else {
            dispatch({ type: 'FINISH_REPLAY' });
        }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [replayState.isActive, replayState.stepIndex, replayState.highlightTarget, eventHistory, dispatch]);

  return (
    <div className="font-body-md text-body-md bg-background text-on-background h-screen flex flex-col overflow-hidden">
      <header className="bg-surface-container-low border-b border-outline-variant flex justify-between items-center w-full px-margin-desktop h-16 shrink-0 z-20">
        <h1 className="flex-1 font-headline-md text-headline-md font-bold text-primary">Temporal Sim</h1>
          <button 
            onClick={() => dispatch({ type: 'TOGGLE_PAUSE' })} 
            className={`font-bold p-2 rounded-DEFAULT flex items-center justify-center gap-2 transition-colors border duration-200 ${isPaused ? 'text-on-surface bg-surface' : 'text-tertiary bg-on-tertiary-container'}`}
          >
            {isPaused ? <i className='icon-play'></i> : <i className='icon-pause'></i>}
          </button>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 flex gap-panel-gap bg-outline-variant p-panel-gap overflow-hidden">
          <TemporalClient />
          <section className="flex flex-col flex-1 bg-surface h-full min-w-100">
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
                    <div className={`${task.state === 'Started' ? 'bg-tertiary-container' : 'bg-primary-container'} p-2 rounded-4xl`}>
                    <i className={`${task.state === 'Started' ? 'icon-play text-on-tertiary-container ' : 'icon-scheduled text-on-primary-container'} text-headline-lg`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-primary-container text-on-primary-container font-code-sm text-code-sm px-1.5 py-0.5 rounded-sm text-[10px]">{task.type}</span>
                        <span className="font-body-md text-body-md font-semibold text-on-surface truncate">{task.name}</span>
                      </div>
                      <div className="font-code-sm text-code-sm text-on-surface-variant truncate">State: {task.state}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <EventHistory />
          </section>
          <section className="flex flex-col bg-surface w-1/4 min-w-70 h-full overflow-y-auto">
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
