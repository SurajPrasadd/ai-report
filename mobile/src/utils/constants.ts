export const API_BASE_URL = 'http://10.0.2.2:3000/api/v1'; // Android emulator
// export const API_BASE_URL = 'http://localhost:3000/api/v1'; // iOS simulator

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user_data',
  THEME: 'app_theme',
  REMEMBER_ME: 'remember_me',
};

export const SDLC_PHASES = [
  'User Story Creation',
  'Solution Design',
  'Architecture Design',
  'Code Generation',
  'Code Review',
  'Unit Testing',
  'Test Case Generation',
  'Documentation',
  'Debugging',
] as const;

export const AI_TOOLS = [
  'GitHub Copilot',
  'ChatGPT',
  'Claude',
  'Gemini',
  'Amazon CodeWhisperer',
  'Tabnine',
  'Cursor',
  'Other',
];

export const PROJECT_STATUSES = ['Active', 'Inactive', 'Completed', 'On Hold', 'Cancelled'];
export const SPRINT_STATUSES = ['Planned', 'Active', 'Completed', 'Cancelled'];
export const JIRA_STATUSES = ['To Do', 'In Progress', 'In Review', 'Done', 'Blocked'];
export const JIRA_PRIORITIES = ['Highest', 'High', 'Medium', 'Low', 'Lowest'];
export const EMPLOYEE_ROLES = ['Admin', 'PM', 'Developer', 'QA', 'BA', 'Architect'];
export const PROJECT_ROLES = ['Developer', 'QA', 'BA', 'Architect', 'PM'];
export const AI_USAGE_STATUSES = ['Draft', 'Submitted', 'Reviewed', 'Approved'];

export const PAGINATION_LIMIT = 10;
