import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiRefreshCw, FiEye } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchJiraStoriesThunk, syncJiraThunk } from '@/store/slices/jiraSlice';
import { JiraStory } from '@/types';
import { JIRA_STATUSES, JIRA_PRIORITIES, PRIORITY_COLORS } from '@/utils/constants';
import { truncate } from '@/utils/helpers';
import Table, { Column } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import SearchBar from '@/components/ui/SearchBar';
import PageHeader from '@/components/ui/PageHeader';
import JiraForm from './JiraForm';

const JiraList: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { stories, pagination, isLoading, isSyncing } = useAppSelector(s => s.jira);
  const { projects } = useAppSelector(s => s.projects);
  const { sprints } = useAppSelector(s => s.sprints);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | undefined>();

  const load = useCallback((p = page) => {
    dispatch(fetchJiraStoriesThunk({ page: p, limit: 10, search: search || undefined, status: statusFilter || undefined, projectId: projectFilter || undefined }));
  }, [dispatch, page, search, statusFilter, projectFilter]);

  useEffect(() => { load(); }, []);

  const handleSync = async () => {
    const proj = projects.find(p => p.jiraProjectKey);
    if (!proj) { toast.error('No project with Jira key configured'); return; }
    try {
      const r = await dispatch(syncJiraThunk({ projectId: proj.id, jiraProjectKey: proj.jiraProjectKey! })).unwrap();
      toast.success(`Synced ${r.synced} stories`); load();
    } catch (e: any) { toast.error(e || 'Sync failed'); }
  };

  const columns: Column<JiraStory>[] = [
    { key: 'jiraId', header: 'Jira ID', width: '110px', render: r => <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.8rem' }}>{r.jiraId}</span> },
    { key: 'summary', header: 'Summary', render: r => <div><div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{truncate(r.summary, 65)}</div>{r.assigneeName && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>👤 {r.assigneeName}</div>}</div> },
    { key: 'project', header: 'Project', width: '80px', render: r => <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--primary)', background: 'var(--primary-50)', padding: '2px 7px', borderRadius: 4 }}>{r.projectCode}</span> },
    { key: 'status', header: 'Status', width: '115px', render: r => <Badge status={r.status} /> },
    { key: 'priority', header: 'Priority', width: '90px', render: r => <span style={{ fontSize: '0.78rem', fontWeight: 600, color: PRIORITY_COLORS[r.priority] }}>{r.priority}</span> },
    { key: 'storyPoints', header: 'SP', width: '55px', render: r => <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>{r.storyPoints || '—'}</span> },
    { key: 'sprint', header: 'Sprint', width: '100px', render: r => <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.sprintName || '—'}</span> },
    {
      key: 'actions', header: '', width: '80px',
      render: r => (
        <div style={{ display: 'flex', gap: 4 }}>
          <Button size="sm" variant="ghost" icon={<FiEye />} onClick={e => { e.stopPropagation(); navigate(`/jira/${r.id}`); }} />
          <Button size="sm" variant="ghost" icon={<FiEdit2 />} onClick={e => { e.stopPropagation(); setEditId(r.id); setShowForm(true); }} />
        </div>
      ),
    },
  ];

  const filterStyle = { padding: '8px 12px', border: '1.5px solid var(--border)', borderRadius: 8, background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none' };

  return (
    <div>
      <PageHeader title="Jira Stories" subtitle={`${pagination?.total ?? 0} stories`}
        actions={<>
          <Button variant="outline" icon={<FiRefreshCw className={isSyncing ? 'spin' : ''} />} onClick={handleSync} loading={isSyncing}>Sync Jira</Button>
          <Button icon={<FiPlus />} onClick={() => { setEditId(undefined); setShowForm(true); }}>New Story</Button>
        </>} />

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <SearchBar value={search} onChange={v => { setSearch(v); setTimeout(() => load(1), 300); }} placeholder="Search Jira ID or summary…" />
        <select value={projectFilter} onChange={e => { setProjectFilter(e.target.value); setPage(1); load(1); }} style={filterStyle}>
          <option value="">All Projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.projectName}</option>)}
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); load(1); }} style={filterStyle}>
          <option value="">All Statuses</option>
          {JIRA_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} style={filterStyle}>
          <option value="">All Priorities</option>
          {JIRA_PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <Table columns={columns} data={stories} isLoading={isLoading}
        pagination={pagination} onPageChange={p => { setPage(p); load(p); }}
        rowKey={r => r.id} onRowClick={r => navigate(`/jira/${r.id}`)}
        emptyMessage="No Jira stories found." />

      {showForm && <JiraForm isOpen={showForm} onClose={() => { setShowForm(false); setEditId(undefined); }} storyId={editId} onSuccess={() => { setShowForm(false); load(); }} />}
    </div>
  );
};

export default JiraList;
