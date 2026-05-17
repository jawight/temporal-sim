This is an exam workflow history where a few different failures happened and were retried. 
Events 2-7 show a Workflow Task failure and retry. 
Events 8-10 show an Activity Task that was retried.

| Event ID | Timestamp | Event Type | Details |
| :--- | :--- | :--- | :--- |
| 20 | May 17, 2026, 11:49:07.86 AM MDT | Workflow Execution Completed | Result <mark background-color="#273860">`{"HelloMessage":"Hola, dude","GoodbyeMessage":"Ad...`</mark> |
| 19 | May 17, 2026, 11:49:07.86 AM MDT | Workflow Task Completed | Identity <mark background-color="#273860">{{WorkerId}}@{{MachineName}}.{{NetworkName}}@</mark> |
| 18 | May 17, 2026, 11:49:07.86 AM MDT | Workflow Task Started | History Size Bytes <mark background-color="#273860">3983</mark> |
| 17 | May 17, 2026, 11:49:07.86 AM MDT | Workflow Task Scheduled | Task Queue Name <u>{{TaskQueueName}}</u> |
| 16 | May 17, 2026, 11:49:07.86 AM MDT | Activity Task Completed | Result <mark background-color="#273860">`{"Translation":"Adiós"}`</mark> |
| 15 | May 17, 2026, 11:49:07.86 AM MDT | Activity Task Started | Attempt <mark background-color="#273860">1</mark> |
| 14 | May 17, 2026, 11:49:07.86 AM MDT | Activity Task Scheduled | Activity Type <mark background-color="#273860">{{ActivityName}}</mark> |
| 13 | May 17, 2026, 11:49:07.86 AM MDT | Workflow Task Completed | Identity <mark background-color="#273860">{{WorkerId}}@{{MachineName}}.{{NetworkName}}@</mark> |
| 12 | May 17, 2026, 11:49:07.85 AM MDT | Workflow Task Started | History Size Bytes <mark background-color="#273860">3159</mark> |
| 11 | May 17, 2026, 11:49:07.85 AM MDT | Workflow Task Scheduled | Task Queue Name <u>{{TaskQueueName}}</u> |
| 10 | May 17, 2026, 11:49:07.85 AM MDT | Activity Task Completed | Result <mark background-color="#273860">`{"Translation":"Hola"}`</mark> |
| 9 | May 17, 2026, 11:49:07.84 AM MDT | Activity Task Started | Attempt <mark background-color="#273860">7</mark> |
| 8 | May 17, 2026, 11:48:37.78 AM MDT | Activity Task Scheduled | Activity Type <mark background-color="#273860">{{ActivityName}}</mark> |
| 7 | May 17, 2026, 11:48:37.78 AM MDT | Workflow Task Completed | Identity <mark background-color="#273860">{{WorkerId}}@{{MachineName}}.{{NetworkName}}@</mark> |
| 6 | May 17, 2026, 11:48:37.77 AM MDT | Workflow Task Started | History Size Bytes <mark background-color="#273860">2088</mark> |
| 5 | May 17, 2026, 11:48:37.76 AM MDT | Workflow Task Scheduled | Task Queue Name <u>{{TaskQueueName}}</u> |
| 4 | May 17, 2026, 11:47:14.15 AM MDT | Workflow Task Failed | Failure Message <mark background-color="#273860">{{FailureMessage}}</mark> |
| 3 | May 17, 2026, 11:47:14.15 AM MDT | Workflow Task Started | History Size Bytes <mark background-color="#273860">344</mark> |
| 2 | May 17, 2026, 11:47:14.14 AM MDT | Workflow Task Scheduled | Task Queue Name <u>{{TaskQueueName}}</u> |
| 1 | May 17, 2026, 11:47:14.14 AM MDT | Workflow Execution Started | Workflow Type Name <mark background-color="#273860">{{WorkflowName}}</mark> |
