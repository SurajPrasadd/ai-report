-- AI Productivity Tracking System - PostgreSQL Schema
-- Version: 1.0.0

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- EMPLOYEES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'Developer' CHECK (role IN ('Admin', 'PM', 'Developer', 'QA', 'BA', 'Architect')),
    department VARCHAR(100),
    designation VARCHAR(100),
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    remember_me_token VARCHAR(500),
    refresh_token VARCHAR(500),
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- PROJECTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_code VARCHAR(50) UNIQUE NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Completed', 'On Hold', 'Cancelled')),
    start_date DATE NOT NULL,
    end_date DATE,
    jira_project_key VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES employees(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- PROJECT MANAGER MAPPING TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS project_manager_mapping (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    manager_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    assigned_by UUID REFERENCES employees(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- EMPLOYEE PROJECT MAPPING TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS employee_project_mapping (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Developer', 'QA', 'BA', 'Architect', 'PM')),
    assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    assigned_by UUID REFERENCES employees(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(employee_id, project_id, role)
);

-- =============================================
-- SPRINTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS sprints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sprint_name VARCHAR(255) NOT NULL,
    jira_sprint_id VARCHAR(100),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Planned' CHECK (status IN ('Planned', 'Active', 'Completed', 'Cancelled')),
    goal TEXT,
    velocity INTEGER DEFAULT 0,
    created_by UUID REFERENCES employees(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- JIRA USER STORIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS jira_user_stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    jira_id VARCHAR(100) UNIQUE NOT NULL,
    summary TEXT NOT NULL,
    description TEXT,
    acceptance_criteria TEXT,
    status VARCHAR(50) DEFAULT 'To Do' CHECK (status IN ('To Do', 'In Progress', 'In Review', 'Done', 'Blocked')),
    story_points INTEGER DEFAULT 0,
    priority VARCHAR(50) DEFAULT 'Medium' CHECK (priority IN ('Highest', 'High', 'Medium', 'Low', 'Lowest')),
    assignee_id UUID REFERENCES employees(id),
    sprint_id UUID REFERENCES sprints(id),
    project_id UUID NOT NULL REFERENCES projects(id),
    epic_key VARCHAR(100),
    labels TEXT[],
    reporter VARCHAR(255),
    jira_created_at TIMESTAMP WITH TIME ZONE,
    jira_updated_at TIMESTAMP WITH TIME ZONE,
    synced_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- AI USAGE TRACKING TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS ai_usage_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    jira_story_id UUID REFERENCES jira_user_stories(id),
    jira_id VARCHAR(100),
    project_id UUID NOT NULL REFERENCES projects(id),
    sprint_id UUID REFERENCES sprints(id),
    employee_id UUID NOT NULL REFERENCES employees(id),
    sdlc_phase VARCHAR(100) NOT NULL CHECK (sdlc_phase IN (
        'User Story Creation', 'Solution Design', 'Architecture Design',
        'Code Generation', 'Code Review', 'Unit Testing',
        'Test Case Generation', 'Documentation', 'Debugging'
    )),
    use_case VARCHAR(255),
    use_case_details TEXT,
    user_story_details TEXT,
    used_ai BOOLEAN DEFAULT false,
    tool_used VARCHAR(100),
    inputs_given TEXT,
    prompt_count INTEGER DEFAULT 0,
    no_of_reprompts INTEGER DEFAULT 0,
    estimated_time DECIMAL(10,2) DEFAULT 0,
    ai_usage_time DECIMAL(10,2) DEFAULT 0,
    review_time DECIMAL(10,2) DEFAULT 0,
    rework_time DECIMAL(10,2) DEFAULT 0,
    reporting_time DECIMAL(10,2) DEFAULT 0,
    actual_time_spent DECIMAL(10,2) DEFAULT 0,
    actual_effort_saved DECIMAL(10,2) DEFAULT 0,
    actual_effort_saved_pct DECIMAL(5,2) DEFAULT 0,
    saved_capacity_usage VARCHAR(100),
    reason_missing_effort TEXT,
    actual_coverage DECIMAL(5,2) DEFAULT 0,
    coverage_remarks TEXT,
    actual_accuracy DECIMAL(5,2) DEFAULT 0,
    accuracy_remarks TEXT,
    true_sdlc_coverage DECIMAL(5,2) DEFAULT 0,
    true_sdlc_accuracy DECIMAL(5,2) DEFAULT 0,
    true_sdlc_effort_saved DECIMAL(10,2) DEFAULT 0,
    true_sdlc_effort_saved_pct DECIMAL(5,2) DEFAULT 0,
    comparison_remarks TEXT,
    no_of_resources INTEGER DEFAULT 1,
    updates TEXT,
    status VARCHAR(50) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Submitted', 'Reviewed', 'Approved')),
    reviewer_id UUID REFERENCES employees(id),
    reviewer_name VARCHAR(255),
    coverage_accuracy_approach TEXT,
    reason_for_not_using_ai TEXT,
    reporting_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- AUDIT LOGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES employees(id),
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- REFRESH TOKENS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_revoked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_employee_id ON employees(employee_id);
CREATE INDEX IF NOT EXISTS idx_projects_code ON projects(project_code);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_pm_mapping_project ON project_manager_mapping(project_id);
CREATE INDEX IF NOT EXISTS idx_emp_project_mapping_employee ON employee_project_mapping(employee_id);
CREATE INDEX IF NOT EXISTS idx_emp_project_mapping_project ON employee_project_mapping(project_id);
CREATE INDEX IF NOT EXISTS idx_sprints_project ON sprints(project_id);
CREATE INDEX IF NOT EXISTS idx_sprints_status ON sprints(status);
CREATE INDEX IF NOT EXISTS idx_jira_stories_project ON jira_user_stories(project_id);
CREATE INDEX IF NOT EXISTS idx_jira_stories_sprint ON jira_user_stories(sprint_id);
CREATE INDEX IF NOT EXISTS idx_jira_stories_jira_id ON jira_user_stories(jira_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_project ON ai_usage_tracking(project_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_employee ON ai_usage_tracking(employee_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_sprint ON ai_usage_tracking(sprint_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- =============================================
-- UPDATED_AT TRIGGER FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pm_mapping_updated_at BEFORE UPDATE ON project_manager_mapping FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_emp_project_updated_at BEFORE UPDATE ON employee_project_mapping FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sprints_updated_at BEFORE UPDATE ON sprints FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jira_stories_updated_at BEFORE UPDATE ON jira_user_stories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_usage_updated_at BEFORE UPDATE ON ai_usage_tracking FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
