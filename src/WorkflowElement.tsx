import React from 'react';
import { Workflow } from './types';

interface WorkflowElementProps {
  workflow: Workflow;
  addActivity: (workflow: Workflow) => void;
  addWorker: (workflow: Workflow) => void;
}

export const WorkflowElement: React.FC<WorkflowElementProps> = ({ workflow, addActivity, addWorker }) => {
  return (
    <div className="card" style={{ width: '12rem', backgroundColor: workflow.color }}>
      <div className="card-body">
        <h6 className="card-title">Workflow {workflow.id}</h6>
        <div className="d-grid gap-1">
          <button onClick={() => addActivity(workflow)} className="btn btn-sm btn-outline-dark bg-white bg-opacity-50">Add Step</button>
          <button onClick={() => addActivity(workflow)} className="btn btn-sm btn-outline-dark bg-white bg-opacity-50">Add Activity</button>
          <button onClick={() => addWorker(workflow)} className="btn btn-sm btn-outline-dark bg-white bg-opacity-50">Add Worker</button>
        </div>
        <div className="d-flex gap-1 mt-2 flex-wrap">
          {workflow.activities.map((activity) => (
            <div key={activity.id} className="rounded-circle border border-dark d-flex align-items-center justify-content-center" style={{ width: '1.5rem', height: '1.5rem', backgroundColor: workflow.color, fontSize: '0.75rem' }}>
              {activity.id}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
