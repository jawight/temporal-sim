import React, { useContext } from 'react';
import { SimulationContext } from '../../core/SimulationContext';

export const EventHistory: React.FC = () => {
  const { state } = useContext(SimulationContext)!;
  const { eventHistory, activeStepId, replayState } = state;

  return (
    <div className="flex-1 flex flex-col bg-surface-dim overflow-hidden">
      <div className="bg-surface-container-low border-b border-outline-variant p-2 px-3 flex justify-between items-center sticky top-0 z-10">
        <h2 className="font-label-caps text-label-caps text-on-surface">Workflow Event History</h2>
      </div>
      <div className="p-3 overflow-y-auto text-code-md flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-label-caps text-on-surface-variant border-b border-outline-variant">
              <th className="py-2 px-3 font-bold">Timestamp</th>
              <th className="py-2 px-3 font-bold">Event Type</th>
              <th className="py-2 px-3 font-bold">Details</th>
            </tr>
          </thead>
          <tbody className="font-code-sm text-on-surface">
            {eventHistory.map((event) => {
              const isHighlighted = replayState.isActive && replayState.highlightTarget === 'history' && event.stepId === (replayState.stepIndex + 1).toString();
              return (
              <tr key={event.id} className={`border-b border-outline-variant/30 hover:bg-surface-container-highest transition-colors ${activeStepId === event.stepId ? 'bg-primary/10' : ''} ${isHighlighted ? 'ring-2 ring-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)] border-yellow-400' : ''}`}>
                <td className="py-2 px-3 text-on-surface-variant opacity-50">{event.timestamp}</td>
                <td className="py-2 px-3 flex items-center gap-2 text-primary">{event.eventType}</td>
                <td className="py-2 px-3">{event.details}&nbsp;<span className="bg-primary text-on-primary font-code-sm text-code-sm px-1 py-0.5 rounded-sm tracking-wider text-[12px]">{event.value}</span></td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  );
};
