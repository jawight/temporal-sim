import React, { useContext } from 'react';
import { SimulationContext } from '../../core/SimulationContext';

export const TemporalClient: React.FC = () => {
  const { state, dispatch } = useContext(SimulationContext)!;
  const { workflowSteps } = state;

  return (
    <section className="flex flex-col bg-surface w-1/4 min-w-[300px] h-full overflow-y-auto">
      <div className="bg-surface-container-low border-b border-outline-variant p-3 sticky top-0 z-10">
        <h2 className="font-headline-md text-headline-md text-on-surface">Workflow Definition</h2>
      </div>
      <div className="p-4 flex flex-col gap-4">
        {workflowSteps.map(step => (
          <div key={step.id} className="bg-surface-container-high border border-outline-variant rounded-DEFAULT p-3 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="bg-primary-container text-on-primary-container font-code-sm text-code-sm px-2 py-0.5 rounded-sm uppercase tracking-wider text-[10px]">{step.type}</span>
            </div>
            <div>
              <label className="font-label-caps text-label-caps text-on-surface-variant mb-1 block">Step Name</label>
              <input className="w-full bg-surface border border-outline-variant rounded-DEFAULT px-2 py-1 text-body-sm text-on-surface focus:outline-none focus:border-primary" type="text" value={step.name} readOnly />
            </div>
          </div>
        ))}
        <div className="mt-8 pt-4 border-t border-outline-variant">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-4">Temporal Client</h2>
          <button 
            onClick={() => dispatch({ type: 'RUN_WORKFLOW' })} 
            className="w-full bg-primary text-on-primary font-bold py-3 rounded-DEFAULT flex items-center justify-center gap-2 hover:bg-primary-fixed transition-colors duration-200"
          >
            Run Workflow
          </button>
        </div>
      </div>
    </section>
  );
};
