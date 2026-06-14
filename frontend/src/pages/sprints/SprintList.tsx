import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchSprintsThunk, deleteSprintThunk } from '@/store/slices/sprintSlice';
import { Sprint } from '@/types';
import { formatDate } from '@/utils/helpers';
import { SPRINT_STATUSES } from '@/utils/constants';
import Table, { Column } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import SearchBar from '@/components/ui/SearchBar';
import PageHeader from '@/components/ui/PageHeader';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import SprintForm from './SprintForm';

const SprintList: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { sprints, pagination, isLoading } = useAppSelector(s => s.sprints);
  const { projects } = useAppSelector(s => s.projects);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Sprint | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback((p = page) => {
    dispatch(fetchSprintsThunk({ page: p, limit: 10, status: statusFilter || undefined, projectId: projectFilter || undefined }));
  }, [dispatch, page, statusFilter, projectFilter]);

  useEffect(() => { load(); }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try { await dispatch(deleteSprintThunk(deleteTarget.id)).unwrap(); toast.success('Sprint deleted'); setDeleteTarget(null); }
    catch (e: any) { toast.error(e); } finally { setDeleting(false); }
  };

  const getDaysLeft = (end: string) => {
    const diff = Math.ceil((new Date(end).getTime() - Date.now()) / 86400000);
    if (diff < 0) return <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Ended</span>;
    if (diff === 0) return <span style={{ color: 'var(--warning)', fontWeight: 600, fontSize: '0.75rem' }}>Ends today</span>;
    return <span style={{ color: 'var(--info)', fontSize: '0.75rem' }}>{diff}d left</span>;
  };

  const columns: Column<Sprint>[] = [
    { key: 'sprintName', header: 'Sprint Name', render: r => <div><div style={{ fontWeight: 600 }}>{r.sprintName}</div>{r.jiraSprintId && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{r.jiraSprintId}</div>}</div> },
    { key: 'project', header: 'Project', render: r => <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', background: 'var(--primary-50)', padding: '2px 8px', borderRadius: 4 }}>{r.projectCode || '—'}</span> },
    { key: 'status', header: 'Status', width: '110px', render: r => <Badge status={r.status} /> },
    { key: 'startDate', header: 'Start', width: '110px', render: r => <span style={{ fontSize: '0.8rem' }}>{formatDate(r.startDate)}</span> },
    { key: 'endDate', header: 'End', width: '110px', render: r => <span style={{ fontSize: '0.8rem' }}>{formatDate(r.endDate)}</span> },
    { key: 'daysLeft', header: 'Timeline', width: '90px', render: r => getDaysLeft(r.endDate) },
    {
      key: 'actions', header: 'Actions', width: '120px',
      render: r => (
        <div style={{ display: 'flex', gap: 4 }}>
          <Button size="sm" variant="ghost" icon={<FiEdit2 />} onClick={e => { e.stopPropagation(); setEditId(r.id); setShowForm(true); }} />
          <Button size="sm" variant="ghost" icon={<FiTrash2 />} onClick={e => { e.stopPropagation(); setDeleteTarget(r); }} style={{ color: 'var(--error)' }} />
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Sprints" subtitle={`${pagination?.total ?? 0} sprints`}
        actions={<Button icon={<FiPlus />} onClick={() => { setEditId(undefined); setShowForm(true); }}>New Sprint</Button>} />

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <select value={projectFilter} onChange={e => { setProjectFilter(e.target.value); setPage(1); setTimeout(() => load(1), 0); }}
          style={{ padding: '8px 12px', border: '1.5px solid var(--border)', borderRadius: 8, background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none' }}>
          <option value="">All Projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.projectName}</option>)}
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); setTimeout(() => load(1), 0); }}
          style={{ padding: '8px 12px', border: '1.5px solid var(--border)', borderRadius: 8, background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none' }}>
          <option value="">All Statuses</option>
          {SPRINT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <Table columns={columns} data={sprints} isLoading={isLoading}
        pagination={pagination} onPageChange={p => { setPage(p); load(p); }}
        rowKey={r => r.id} emptyMessage="No sprints found." />

      {showForm && <SprintForm isOpen={showForm} onClose={() => { setShowForm(false); setEditId(undefined); }} sprintId={editId} onSuccess={() => { setShowForm(false); load(); }} />}
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} isLoading={deleting}
        title="Delete Sprint" message={`Delete sprint "${deleteTarget?.sprintName}"?`} confirmLabel="Delete" />
    </div>
  );
};

export default SprintList;
