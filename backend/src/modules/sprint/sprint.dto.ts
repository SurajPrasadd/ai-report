export interface CreateSprintDto {
  sprintName: string;
  jiraSprintId?: string;
  projectId: string;
  startDate: Date;
  endDate: Date;
  status?: string;
  goal?: string;
}

export interface UpdateSprintDto {
  sprintName?: string;
  jiraSprintId?: string;
  startDate?: Date;
  endDate?: Date;
  status?: string;
  goal?: string;
  velocity?: number;
}
