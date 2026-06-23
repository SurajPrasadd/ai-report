// ─── Auth ────────────────────────────────────────────────────────────────────
export type UserRole = 'Admin' | 'PM' | 'Developer' | 'QA' | 'BA' | 'Architect';

export interface User {
  id: string;
  employeeId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  department?: string;
  designation?: string;
  avatarUrl?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isRestoring: boolean;
  error: string | null;
}

// ─── Project ─────────────────────────────────────────────────────────────────
export type ProjectStatus = 'Active' | 'Inactive' | 'Completed' | 'On Hold' | 'Cancelled';

export interface Project {
  id: string;
  projectCode: string;
  projectName: string;
  description?: string;
  status: ProjectStatus;
  startDate: string;
  endDate?: string;
  jiraProjectKey?: string;
  pmName?: string;
  pmEmail?: string;
  pmId?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Employee ─────────────────────────────────────────────────────────────────
export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  department?: string;
  designation?: string;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface EmployeeMapping {
  id: string;
  employeeId: string;
  projectId: string;
  role: string;
  assignedDate: string;
  employeeName?: string;
  email?: string;
  designation?: string;
  isActive: boolean;
}

// ─── Sprint ──────────────────────────────────────────────────────────────────
export type SprintStatus = 'Planned' | 'Active' | 'Completed' | 'Cancelled';

export interface Sprint {
  id: string;
  sprintName: string;
  jiraSprintId?: string;
  projectId: string;
  projectName?: string;
  projectCode?: string;
  startDate: string;
  endDate: string;
  status: SprintStatus;
  goal?: string;
  velocity?: number;
  createdAt: string;
}

// ─── Jira ────────────────────────────────────────────────────────────────────
export type JiraStatus = 'To Do' | 'In Progress' | 'In Review' | 'Done' | 'Blocked';
export type JiraPriority = 'Highest' | 'High' | 'Medium' | 'Low' | 'Lowest';

export interface JiraStory {
  id: string;
  jiraId: string;
  summary: string;
  description?: string;
  acceptanceCriteria?: string;
  status: JiraStatus;
  storyPoints?: number;
  priority: JiraPriority;
  assigneeId?: string;
  assigneeName?: string;
  sprintId?: string;
  sprintName?: string;
  projectId: string;
  projectName?: string;
  projectCode?: string;
  epicKey?: string;
  reporter?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── AI Usage ────────────────────────────────────────────────────────────────
export type SdlcPhase =
  | 'User Story Creation' | 'Solution Design' | 'Architecture Design'
  | 'Code Generation' | 'Code Review' | 'Unit Testing'
  | 'Test Case Generation' | 'Documentation' | 'Debugging';

export type AiUsageStatus = 'Draft' | 'Submitted' | 'Reviewed' | 'Approved';

export interface AiUsageRecord {
  id: string;
  jiraId?: string;
  projectId: string;
  projectName?: string;
  projectCode?: string;
  sprintId?: string;
  sprintName?: string;
  employeeId: string;
  employeeName?: string;
  sdlcPhase: SdlcPhase;
  useCase?: string;
  useCaseDetails?: string;
  userStoryDetails?: string;
  usedAi: boolean;
  toolUsed?: string;
  inputsGiven?: string;
  promptCount: number;
  noOfReprompts: number;
  estimatedTime: number;
  aiUsageTime: number;
  reviewTime: number;
  reworkTime: number;
  reportingTime: number;
  actualTimeSpent: number;
  actualEffortSaved: number;
  actualEffortSavedPct: number;
  savedCapacityUsage?: string;
  reasonMissingEffort?: string;
  actualCoverage: number;
  coverageRemarks?: string;
  actualAccuracy: number;
  accuracyRemarks?: string;
  trueSdlcCoverage: number;
  trueSdlcAccuracy: number;
  trueSdlcEffortSaved: number;
  trueSdlcEffortSavedPct: number;
  comparisonRemarks?: string;
  noOfResources: number;
  updates?: string;
  status: AiUsageStatus;
  reviewerName?: string;
  reasonForNotUsingAi?: string;
  reportingDate: string;
  createdAt: string;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export interface DashboardStats {
  totalProjects: number;
  totalEmployees: number;
  totalSprints: number;
  totalJiraStories: number;
  aiUsagePercentage: number;
  effortSaved: number;
  aiUsedCount: number;
  totalRecords: number;
}

export interface AiUsageByProject {
  project_name: string;
  project_code: string;
  total_records: number;
  ai_used: number;
  ai_percentage: number;
}

export interface EffortBySprint {
  sprint_name: string;
  total_effort_saved: number;
  avg_pct: number;
}

export interface ResourceUtilization {
  employee_name: string;
  role: string;
  total_tasks: number;
  ai_tasks: number;
  effort_saved: number;
}

// ─── API ─────────────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
  pagination?: PaginationMeta;
  timestamp: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface TableFilters {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  [key: string]: unknown;
}
