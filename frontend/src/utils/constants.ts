export const SDLC_PHASES = [
  'User Story Creation', 'Solution Design', 'Architecture Design',
  'Code Generation', 'Code Review', 'Unit Testing',
  'Test Case Generation', 'Documentation', 'Debugging',
] as const;

export const AI_TOOLS = [
  'GitHub Copilot', 'ChatGPT', 'Claude', 'Gemini',
  'Amazon CodeWhisperer', 'Tabnine', 'Cursor', 'Other',
];

export const PROJECT_STATUSES = ['Active', 'Inactive', 'Completed', 'On Hold', 'Cancelled'];
export const SPRINT_STATUSES = ['Planned', 'Active', 'Completed', 'Cancelled'];
export const JIRA_STATUSES = ['To Do', 'In Progress', 'In Review', 'Done', 'Blocked'];
export const JIRA_PRIORITIES = ['Highest', 'High', 'Medium', 'Low', 'Lowest'];
export const EMPLOYEE_ROLES = ['Admin', 'PM', 'Developer', 'QA', 'BA', 'Architect'];
export const PROJECT_ROLES = ['Developer', 'QA', 'BA', 'Architect', 'PM'];
export const AI_USAGE_STATUSES = ['Draft', 'Submitted', 'Reviewed', 'Approved'];

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
export const DEFAULT_PAGE_SIZE = 10;

export const PRIORITY_COLORS: Record<string, string> = {
  Highest: '#c62828', High: '#e65100', Medium: '#1565c0', Low: '#2e7d32', Lowest: '#757575',
};
