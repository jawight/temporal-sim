import React, { useState } from 'react';
import { Worker, Workflow, TemporalActivity, nextPastel } from './types';
import { WorkflowElement } from './WorkflowElement';



const App: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);

  const addWorkflow = () => {
    const newWorkflow: Workflow = {
      id: workflows.length,
      color: nextPastel(workflows.length),
      activities: [],
      taskQueue: [],
      workers: [],
    };
    setWorkflows([...workflows, newWorkflow]);
  };

  const addActivity = (workflow: Workflow) => {
    const newActivity: TemporalActivity = {
      id: workflow.activities.length,
      color: nextPastel(workflow.activities.length)
    };
    workflow.activities.push(newActivity)
    setWorkflows([...workflows]);
  };

  const addWorker = (workflow: Workflow) => {
    const newWorker: Worker = {
      id: workflow.workers.length,
    };
    workflow.workers.push(newWorker);
    setWorkflows([...workflows]);
  };

  const addTask = (workflow: Workflow, task: string[]) => {
    workflow.taskQueue.push(task);
    setWorkflows([...workflows]);
  };

  return (
    <div className="container-fluid p-2 d-flex flex-column gap-3">
      <div className="p-2 d-flex justify-content-end gap-2">
        <button onClick={addWorkflow} className="btn btn-outline-dark p-2 bg-light">
          Add Workflow
        </button>
      </div>
      <div className="row g-3 p-2">
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Temporal Client</h5>
              {workflows.map((workflow) => (
                <button 
                  key={workflow.id} 
                  onClick={() => {
                    addTask(workflow, [
                      `Workflow ${workflow.id}`,
                      ...workflow.activities.map(a => `Activity ${a.id}`)
                    ]);
                  }} 
                  className="btn btn-sm btn-outline-dark w-100 mb-2" 
                  style={{ backgroundColor: workflow.color }}
                >
                  Run Workflow {workflow.id}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Temporal Server</h5>
              {workflows.map((workflow) => (
                <div key={workflow.id} className="card mb-2" style={{ backgroundColor: workflow.color, fontSize: '0.75rem' }}>
                  <div className="card-body p-2">
                    <h6 className="card-subtitle mb-2">WF Task Queue {workflow.id}</h6>
                    <div className="d-flex gap-1 mt-1 flex-wrap">
                      {workflow.taskQueue.map((_, i) => (
                        <span key={i} className="badge border border-dark text-dark" style={{ backgroundColor: workflow.color, width: '1.5rem', height: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>WF</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Workers</h5>
              {workflows.map((workflow) => 
                workflow.workers.map(worker => (
                  <div key={worker.id} className="card mb-2" style={{ backgroundColor: workflow.color }}>
                    <div className="card-body p-2 text-center">
                      WF {workflow.id} Worker {worker.id}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="card mt-3">
        <div className="card-body">
          <h5 className="card-title">Workflows</h5>
          <div className="d-flex flex-wrap gap-2">
            {workflows.map((workflow) => (
              <WorkflowElement key={workflow.id} workflow={workflow} addActivity={addActivity} addWorker={addWorker} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
