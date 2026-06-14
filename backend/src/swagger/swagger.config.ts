import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AI Productivity Tracking System API',
      version: '1.0.0',
      description: 'Complete API documentation for AI Productivity Tracking System',
      contact: { name: 'API Support', email: 'support@company.com' },
    },
    servers: [
      { url: 'http://localhost:3000/api/v1', description: 'Development' },
      { url: 'https://api.company.com/api/v1', description: 'Production' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        LoginRequest: {
          type: 'object',
          required: ['employeeId', 'email', 'password'],
          properties: {
            employeeId: { type: 'string', example: 'EMP001' },
            email: { type: 'string', format: 'email', example: 'user@company.com' },
            password: { type: 'string', format: 'password', example: 'Password@123' },
            rememberMe: { type: 'boolean', example: false },
          },
        },
        Project: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            projectCode: { type: 'string', example: 'CON' },
            projectName: { type: 'string', example: 'Connector Platform' },
            pmName: { type: 'string', example: 'John Smith' },
            status: { type: 'string', enum: ['Active', 'Inactive', 'Completed', 'On Hold', 'Cancelled'] },
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
          },
        },
        Sprint: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            sprintName: { type: 'string' },
            jiraSprintId: { type: 'string' },
            projectId: { type: 'string', format: 'uuid' },
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
            status: { type: 'string', enum: ['Planned', 'Active', 'Completed', 'Cancelled'] },
          },
        },
        AiUsage: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            jiraId: { type: 'string', example: 'CON-19253' },
            sdlcPhase: { type: 'string', enum: ['User Story Creation', 'Solution Design', 'Architecture Design', 'Code Generation', 'Code Review', 'Unit Testing', 'Test Case Generation', 'Documentation', 'Debugging'] },
            usedAi: { type: 'boolean' },
            toolUsed: { type: 'string' },
            promptCount: { type: 'integer' },
            estimatedTime: { type: 'number' },
            actualTimeSpent: { type: 'number' },
            actualEffortSaved: { type: 'number' },
            actualEffortSavedPct: { type: 'number' },
          },
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            totalPages: { type: 'integer' },
            hasNext: { type: 'boolean' },
            hasPrev: { type: 'boolean' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Projects', description: 'Project management' },
      { name: 'Employees', description: 'Employee management' },
      { name: 'Sprints', description: 'Sprint management' },
      { name: 'Jira', description: 'Jira user stories' },
      { name: 'AI Usage', description: 'AI usage tracking' },
      { name: 'Dashboard', description: 'Dashboard analytics' },
      { name: 'Excel', description: 'Excel export/import' },
    ],
  },
  apis: ['./src/modules/**/*.routes.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
