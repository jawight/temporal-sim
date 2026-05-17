import { TaskType } from "../core/types";

interface TaskTypeBadgeProps {
    taskType: TaskType
}

function TaskTypeBadge(props: TaskTypeBadgeProps) {
    let colorStyles;
    switch (props.taskType) {
        case 'Workflow': colorStyles = "bg-primary-container text-on-primary-container"; break;
        case 'Activity': colorStyles = "bg-secondary-container text-on-secondary-container"; break;
        case 'Timer': colorStyles = "bg-tertiary-container text-on-tertiary-container"; break;
    }

    return <span className={colorStyles  + " font-code-sm text-code-sm px-2 py-0.5 rounded-sm uppercase tracking-wider text-[10px]"}>{props.taskType}</span>
}

export default TaskTypeBadge;