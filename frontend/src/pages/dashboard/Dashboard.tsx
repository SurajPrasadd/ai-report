import React, { useEffect, useState, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid,
} from 'recharts';
import { FiRefreshCw } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchDashboardThunk } from '@/store/slices/dashboardSlice';
import { fetchProjectsThunk } from '@/store/slices/projectSlice';
import { fetchSprintsThunk } from '@/store/slices/sprintSlice';
import StatCard from '@/components/ui/StatCard';
import PageHeader from '@/components/ui/PageHeader';
import { formatHours, formatPercent, formatDateTime } from '@/utils/helpers';
import styles from './Dashboard.module.css';

const CHART_COLORS = ['#1976d2', '#26c6da', '#ff6f00', '#2e7d32', '#7b1fa2', '#c62828'];

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { stats, aiByProject, effortBySprint, resourceUtil, isLoading, lastUpdated } = useAppSelector(s => s.dashboard);
  const { projects } = useAppSelector(s => s.projects);
  const { sprints } = useAppSelector(s => s.sprints);
  const [filterProject, setFilterProject] = useState('');
  const [filterSprint, setFilterSprint] = useState('');

  const load = useCallback(() => {
    const params: Record<string, string> = {};
    if (filterProject) params.projectId = filterProject;
    if (filterSprint) params.sprintId = filterSprint;
    dispatch(fetchDashboardThunk(params));
  }, [dispatch, filterProject, filterSprint]);

  useEffect(() => {
    dispatch(fetchProjectsThunk({ limit: 100 }));
    dispatch(fetchSprintsThunk({ limit: 100 }));
  }, []);

  useEffect(() => { load(); }, [load]);

  const barData = effortBySprint.slice(0, 8).map(s => ({
    name: s.sprint_name?.replace('Sprint ', 'S') ?? '',
    saved: Number(s.total_effort_saved) || 0,
    pct: Number(s.avg_pct) || 0,
  }));

  const pieData = aiByProject.slice(0, 6).map(p => ({
    name: p.project_code,
    value: Number(p.ai_percentage) || 0,
  }));

  const phaseData = [
    { name: 'Code Generation', used: 72, total: 100 },
    { name: 'Code Review', used: 65, total: 100 },
    { name: 'Unit Testing', used: 58, total: 100 },
    { name: 'Documentation', used: 45, total: 100 },
    { name: 'Debugging', used: 40, total: 100 },
    { name: 'Test Case Gen', used: 38, total: 100 },
    { name: 'Solution Design', used: 30, total: 100 },
    { name: 'User Story', used: 25, total: 100 },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="AI productivity analytics and insights"
        actions={
          <button className={styles.refreshBtn} onClick={load} disabled={isLoading}>
            <FiRefreshCw className={isLoading ? styles.spinning : ''} />
            Refresh
          </button>
        }
      />

      {/* Filters */}
      <div className={styles.filterBar}>
        <span className={styles.filterLabel}>Filters:</span>
        <select className={styles.filterSelect} value={filterProject} onChange={e => setFilterProject(e.target.value)}>
          <option value="">All Projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.projectName}</option>)}
        </select>
        <select className={styles.filterSelect} value={filterSprint} onChange={e => setFilterSprint(e.target.value)}>
          <option value="">All Sprints</option>
          {sprints.map(s => <option key={s.id} value={s.id}>{s.sprintName}</option>)}
        </select>
        {(filterProject || filterSprint) && (
          <button className={styles.filterSelect} style={{ cursor: 'pointer', color: 'var(--error)' }}
            onClick={() => { setFilterProject(''); setFilterSprint(''); }}>✕ Clear</button>
        )}
        {lastUpdated && (
          <span className={styles.lastUpdated} style={{ marginLeft: 'auto' }}>
            Updated {formatDateTime(lastUpdated)}
          </span>
        )}
      </div>

      {/* KPI Cards Row 1 */}
      <div className={styles.statsGrid}>
        <StatCard title="Total Projects" value={stats?.totalProjects ?? 0} icon="📁" color="#1976d2" />
        <StatCard title="Total Employees" value={stats?.totalEmployees ?? 0} icon="👥" color="#26c6da" />
        <StatCard title="Total Sprints" value={stats?.totalSprints ?? 0} icon="⚡" color="#ff6f00" />
      </div>

      {/* AI Metrics Row */}
      <div className={styles.aiHighlight}>
        <StatCard title="Jira Stories" value={stats?.totalJiraStories ?? 0} icon="📋" color="#7b1fa2" />
        <StatCard
          title="AI Usage Rate"
          value={formatPercent(stats?.aiUsagePercentage)}
          icon="🤖"
          color="#2e7d32"
          subtitle={`${stats?.aiUsedCount ?? 0} of ${stats?.totalRecords ?? 0} tasks used AI`}
        />
        <StatCard
          title="Total Effort Saved"
          value={formatHours(stats?.effortSaved)}
          icon="⏱️"
          color="#0277bd"
          subtitle="Hours saved across all tasks"
        />
      </div>

      {/* AI Adoption progress bar */}
      <div className={styles.chartCard} style={{ margin: '20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span className={styles.chartTitle} style={{ margin: 0 }}>Overall AI Adoption Rate</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2e7d32' }}>
            {formatPercent(stats?.aiUsagePercentage)}
          </span>
        </div>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${Math.min(stats?.aiUsagePercentage ?? 0, 100)}%` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>0%</span><span>Target: 80%</span><span>100%</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className={styles.chartsGrid}>
        {/* Bar Chart: Effort Saved by Sprint */}
        <div className={styles.chartCard}>
          <p className={styles.chartTitle}>Effort Saved by Sprint (hrs)</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData} margin={{ top: 0, right: 10, left: -10, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`${v}h`, 'Saved']} contentStyle={{ borderRadius: 8, border: '1px solid var(--border)' }} />
              <Bar dataKey="saved" fill="#1976d2" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart: AI Usage by Project */}
        <div className={styles.chartCard}>
          <p className={styles.chartTitle}>AI Usage by Project (%)</p>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} innerRadius={50} dataKey="value" label={({ name, value }) => `${name}: ${value.toFixed(0)}%`} labelLine={false}>
                  {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => [`${v}%`, 'AI Usage']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              No data available
            </div>
          )}
        </div>

        {/* SDLC Phase Breakdown */}
        <div className={styles.chartCard}>
          <p className={styles.chartTitle}>AI Adoption by SDLC Phase</p>
          <div className={styles.phaseList}>
            {phaseData.map(p => (
              <div key={p.name} className={styles.phaseItem}>
                <div className={styles.phaseHeader}>
                  <span className={styles.phaseName}>{p.name}</span>
                  <span className={styles.phaseValue}>{p.used}%</span>
                </div>
                <div className={styles.phaseBar}>
                  <div className={styles.phaseFill} style={{ width: `${p.used}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resource Utilization */}
        <div className={styles.chartCard}>
          <p className={styles.chartTitle}>Resource Utilization</p>
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.resourceTable}>
              <thead>
                <tr>
                  {['Employee', 'Role', 'AI Tasks', 'Effort Saved'].map(h => (
                    <th key={h} className={styles.resourceTh}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {resourceUtil.length === 0 ? (
                  <tr><td colSpan={4} className={styles.resourceTd} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No data</td></tr>
                ) : (
                  resourceUtil.slice(0, 8).map((r: any, i) => (
                    <tr key={i}>
                      <td className={styles.resourceTd}>{r.employee_name}</td>
                      <td className={styles.resourceTd}><span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--primary)' }}>{r.role}</span></td>
                      <td className={styles.resourceTd}>{r.ai_tasks}/{r.total_tasks}</td>
                      <td className={styles.resourceTd} style={{ color: 'var(--success)', fontWeight: 700 }}>{formatHours(r.effort_saved)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Line Chart: AI Usage trend */}
      <div className={styles.chartCard}>
        <p className={styles.chartTitle}>AI Usage Trend by Sprint (%)</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={barData} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} unit="%" />
            <Tooltip formatter={(v) => [`${v}%`, 'AI Usage']} contentStyle={{ borderRadius: 8, border: '1px solid var(--border)' }} />
            <Line type="monotone" dataKey="pct" stroke="#1976d2" strokeWidth={2.5} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
