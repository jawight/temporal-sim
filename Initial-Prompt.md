I want to create a website featuring an interactive diagram of the temporal durable execution framework. I want to help users understand how temporal works under the hood. 
I want my app to include a section where users can edit a workflow representation, including activities and deterministic logic. They should be able to type a name for the activity or deterministic logic line. The workflow should look like a list of tasks.
There needs to be a section to represent the "Temporal Server". In the temporal server section, it should display the task queue and the different workflow event histories. Each workflow run should have its own event history, but they will all share the same task queue. The tasks in the task queue should have different states that correspond with the events in the event history. The task state should also include an icon on the task card to show if a task is scheduled, started, completed, or did not complete gracefully
There needs to be a "Temporal Client" section with a "Run workflow" button.
When the button is clicked, it should:
1. Create a new event history with the title `${WorkflowName}-${CurrentISODate}`  2. Append `${CurrentISODate} | Workflow Execution Started | Workflow Type Name ${WorkflowName}` to the event history.
3. Add a Workflow Execution task to the task queue.
I want the user to be able to click a button to add a worker representation. The worker should visually poll the task queue for tasks. When a task is available, and the worker is not processing another task, it should do these steps: 
1. Show the task in the task queue is running
2. Display the task running in the worker box.
3. Append `${CurrentISODate} | ${Workflow | Activity} Task Started` to the event history.
4. Display a working symbol with an animated hammer.
5. Wait 2 seconds
6. Change the symbol to a green checkmark
7. Depending on the task type, append a message to the event history:
    - Worker Task: `${CurrentIsoDate} | Workflow Task Completed | Identity ${WorkerId}`,
    - Activity Task: `${CurrentIsoDate} | Activity Task Completed | Result ${JsonResult}`
7.  The worker should check the workflow to see what the next task is and send it to the task queue.
When a task or activity is in the queue, the worker should dequeue it and indicate they are working on it by displaying a loading symbol and the task name. After a second or two, the worker should complete or fail the task by displaying a check mark or x. If the task is completed, it should be added to the workflow event history. 
Here is the list of events that could be in the event history:
Overall workflow execution events:
WorkflowExecutionCompleted
WorkflowExecutionFailed
WorkflowExecutionTimedOut
WorkflowExecutionCanceled
WorkflowExecutionTerminated
WorkflowExecutionContinuedAsNew
WorkflowExecutionSignaled
Deterministic Workflow logic execution events:
WorkflowTaskScheduled
WorkflowTaskStarted
WorkflowTaskCompleted
WorkflowTaskTimedOut
WorkflowTaskFailed
Activity Events:
ActivityTaskScheduled
ActivityTaskStarted
ActivityTaskCompleted
ActivityTaskFailed
ActivityTaskTimedOut
ActivityTaskCancelRequested
ActivityTaskCanceled
Timer Events:
TimerStarted
TimerFired
TimerCanceled