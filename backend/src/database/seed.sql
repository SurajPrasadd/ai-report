-- AI Productivity Tracking System - Seed Data

-- Seed Employees (passwords are 'Password@123' hashed)
INSERT INTO employees (id, employee_id, first_name, last_name, email, password_hash, role, department, designation)
VALUES
  ('a1b2c3d4-0000-0000-0000-000000000001', 'EMP001', 'Admin', 'User', 'admin@company.com',
   '$2a$10$YourHashedPasswordHere1', 'Admin', 'IT', 'System Administrator'),
  ('a1b2c3d4-0000-0000-0000-000000000002', 'EMP002', 'John', 'Smith', 'john.smith@company.com',
   '$2a$10$YourHashedPasswordHere2', 'PM', 'Engineering', 'Project Manager'),
  ('a1b2c3d4-0000-0000-0000-000000000003', 'EMP003', 'Disha', 'Singh', 'disha.singh@company.com',
   '$2a$10$YourHashedPasswordHere3', 'Developer', 'Engineering', 'Senior Developer'),
  ('a1b2c3d4-0000-0000-0000-000000000004', 'EMP004', 'Suraj', 'Prasad', 'suraj.prasad@company.com',
   '$2a$10$YourHashedPasswordHere4', 'Developer', 'Engineering', 'Full Stack Developer'),
  ('a1b2c3d4-0000-0000-0000-000000000005', 'EMP005', 'Priya', 'Kumar', 'priya.kumar@company.com',
   '$2a$10$YourHashedPasswordHere5', 'QA', 'Quality', 'QA Engineer')
ON CONFLICT (employee_id) DO NOTHING;

-- Seed Projects
INSERT INTO projects (id, project_code, project_name, description, status, start_date, end_date, jira_project_key)
VALUES
  ('b1c2d3e4-0000-0000-0000-000000000001', 'CON', 'Connector Platform', 'Main connector platform project', 'Active', '2024-01-01', '2024-12-31', 'CON'),
  ('b1c2d3e4-0000-0000-0000-000000000002', 'CRM', 'CRM System', 'Customer relationship management system', 'Active', '2024-03-01', '2024-12-31', 'CRM'),
  ('b1c2d3e4-0000-0000-0000-000000000003', 'MOB', 'Mobile App', 'React Native mobile application', 'Active', '2024-06-01', '2025-03-31', 'MOB')
ON CONFLICT (project_code) DO NOTHING;

-- Seed Project Manager Mapping
INSERT INTO project_manager_mapping (project_id, manager_id, assigned_date)
VALUES
  ('b1c2d3e4-0000-0000-0000-000000000001', 'a1b2c3d4-0000-0000-0000-000000000002', '2024-01-01'),
  ('b1c2d3e4-0000-0000-0000-000000000002', 'a1b2c3d4-0000-0000-0000-000000000002', '2024-03-01')
ON CONFLICT DO NOTHING;

-- Seed Employee Project Mapping
INSERT INTO employee_project_mapping (employee_id, project_id, role, assigned_date)
VALUES
  ('a1b2c3d4-0000-0000-0000-000000000003', 'b1c2d3e4-0000-0000-0000-000000000001', 'Developer', '2024-01-15'),
  ('a1b2c3d4-0000-0000-0000-000000000004', 'b1c2d3e4-0000-0000-0000-000000000001', 'Developer', '2024-01-15'),
  ('a1b2c3d4-0000-0000-0000-000000000005', 'b1c2d3e4-0000-0000-0000-000000000001', 'QA', '2024-01-15')
ON CONFLICT DO NOTHING;

-- Seed Sprints
INSERT INTO sprints (id, sprint_name, jira_sprint_id, project_id, start_date, end_date, status)
VALUES
  ('c1d2e3f4-0000-0000-0000-000000000001', 'Sprint 1', 'JIRA-SPR-001', 'b1c2d3e4-0000-0000-0000-000000000001', '2024-01-01', '2024-01-14', 'Completed'),
  ('c1d2e3f4-0000-0000-0000-000000000002', 'Sprint 2', 'JIRA-SPR-002', 'b1c2d3e4-0000-0000-0000-000000000001', '2024-01-15', '2024-01-28', 'Completed'),
  ('c1d2e3f4-0000-0000-0000-000000000003', 'Sprint 3', 'JIRA-SPR-003', 'b1c2d3e4-0000-0000-0000-000000000001', '2024-01-29', '2024-02-11', 'Active')
ON CONFLICT DO NOTHING;

-- Seed Jira User Stories
INSERT INTO jira_user_stories (jira_id, summary, status, project_id, sprint_id, assignee_id, story_points)
VALUES
  ('CON-19253', 'BE: EDMS Integration - for file upload and storage in connector', 'In Progress',
   'b1c2d3e4-0000-0000-0000-000000000001', 'c1d2e3f4-0000-0000-0000-000000000003',
   'a1b2c3d4-0000-0000-0000-000000000003', 5),
  ('CON-19620', 'BE: Enhanced Lead Summary - Portal CMS', 'In Progress',
   'b1c2d3e4-0000-0000-0000-000000000001', 'c1d2e3f4-0000-0000-0000-000000000003',
   'a1b2c3d4-0000-0000-0000-000000000004', 8)
ON CONFLICT (jira_id) DO NOTHING;

-- Seed AI Usage Tracking
INSERT INTO ai_usage_tracking (
  jira_id, project_id, sprint_id, employee_id, sdlc_phase, used_ai, tool_used,
  prompt_count, estimated_time, ai_usage_time, review_time, rework_time,
  actual_time_spent, actual_effort_saved, actual_effort_saved_pct,
  actual_coverage, actual_accuracy, status, reporting_date
)
VALUES
  ('CON-19253', 'b1c2d3e4-0000-0000-0000-000000000001', 'c1d2e3f4-0000-0000-0000-000000000003',
   'a1b2c3d4-0000-0000-0000-000000000003', 'Code Generation', true, 'GitHub Copilot',
   5, 8.0, 2.0, 0.5, 0.5, 3.0, 5.0, 62.5, 85.0, 90.0, 'Submitted', '2024-02-01'),
  ('CON-19620', 'b1c2d3e4-0000-0000-0000-000000000001', 'c1d2e3f4-0000-0000-0000-000000000003',
   'a1b2c3d4-0000-0000-0000-000000000004', 'Code Generation', true, 'GitHub Copilot',
   8, 12.0, 3.0, 1.0, 0.5, 4.5, 7.5, 62.5, 90.0, 92.0, 'Submitted', '2024-02-01')
ON CONFLICT DO NOTHING;
