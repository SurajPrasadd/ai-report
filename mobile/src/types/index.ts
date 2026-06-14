// =============================================
// Auth Types
// =============================================
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

export type UserRole = 'Admin' | 'PM' | 'Developer' | 'QA' | 'BA' | 'Architect';

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// =============================================
// Project Types
// =============================================
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
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus = 'Active' | 'Inactive' | 'Completed' | 'On Hold' | 'Cancelled';

// =============================================
// Employee Types
// =============================================
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

// =============================================
// Sprint Types
// =============================================
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

export type SprintStatus = 'Planned' | 'Active' | 'Completed' | 'Cancelled';

// =============================================
// Jira User Story Types
// =============================================
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
  epicKey?: string;
  reporter?: string;
  createdAt: string;
  updatedAt: string;
}

export type JiraStatus = 'To Do' | 'In Progress' | 'In Review' | 'Done' | 'Blocked';
export type JiraPriority = 'Highest' | 'High' | 'Medium' | 'Low' | 'Lowest';

// =============================================
// AI Usage Types
// =============================================
export interface AiUsageRecord {
  id: string;
  jiraId?: string;
  projectId: string;
  projectName?: string;
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

export type SdlcPhase =
  | 'User Story Creation'
  | 'Solution Design'
  | 'Architecture Design'
  | 'Code Generation'
  | 'Code Review'
  | 'Unit Testing'
  | 'Test Case Generation'
  | 'Documentation'
  | 'Debugging';

export type AiUsageStatus = 'Draft' | 'Submitted' | 'Reviewed' | 'Approved';

// =============================================
// Dashboard Types
// =============================================
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

// =============================================
// API Types
// =============================================
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
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

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

// =============================================
// Navigation Types
// =============================================
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
};

export type MainDrawerParamList = {
  Dashboard: undefined;
  Projects: undefined;
  Employees: undefined;
  Sprints: undefined;
  JiraStories: undefined;
  AiUsage: undefined;
  ExcelExport: undefined;
};

export type ProjectStackParamList = {
  ProjectList: undefined;
  ProjectDetail: { projectId: string };
  ProjectForm: { projectId?: string };
  ManagerMapping: { projectId: string };
  EmployeeMapping: { projectId: string };
};

export type SprintStackParamList = {
  SprintList: undefined;
  SprintDetail: { sprintId: string };
  SprintForm: { sprintId?: string };
};

export type JiraStackParamList = {
  JiraList: undefined;
  JiraDetail: { storyId: string };
  JiraForm: { storyId?: string };
};

export type AiUsageStackParamList = {
  AiUsageList: undefined;
  AiUsageDetail: { recordId: string };
  AiUsageForm: { recordId?: string; jiraId?: string };
};
