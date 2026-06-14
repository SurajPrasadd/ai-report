export interface CreateProjectDto {
  projectCode: string;
  projectName: string;
  description?: string;
  status?: string;
  startDate: Date;
  endDate?: Date;
  jiraProjectKey?: string;
}

export interface UpdateProjectDto {
  projectName?: string;
  description?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  jiraProjectKey?: string;
}

export interface ProjectQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface AssignManagerDto {
  projectId: string;
  managerId: string;
  assignedDate?: Date;
}

export interface AssignEmployeeDto {
  employeeId: string;
  projectId: string;
  role: 'Developer' | 'QA' | 'BA' | 'Architect' | 'PM';
  assignedDate?: Date;
}
