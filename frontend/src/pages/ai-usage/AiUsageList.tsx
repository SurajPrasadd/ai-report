import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAiUsageThunk, deleteAiUsageThunk } from '@/store/slices/aiUsageSlice';
import { AiUsageRecord } from '@/types';
import { SDLC_PHASES, AI_USAGE_STATUSES } from '@/utils/constants';
import { formatHours, formatPercent } from '@/utils/helpers';
import Table, { Column } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import SearchBar from '@/components/ui/SearchBar';
import PageHeader from '@/components/ui/PageHeader';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import AiUsageForm from './AiUsageForm';

const AiUsageList: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { records, pagination, isLoading } = useAppSelector(s => s.aiUsage);
  const { projects } = useAppSelector(s => s.projects);
  const { sprints } = useAppSelector(s => s.sprints);

  const [page, setPage] = useState(1);
  const [phaseFilter, setPhaseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [usedAiFilter, setUsedAiFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<AiUsageRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback((p = page) => {
    dispatch(fetchAiUsageThunk({ page: p, limit: 10, sdlcPhase: phaseFilter || undefined, status: statusFilter || undefined, projectId: projectFilter || undefined, usedAi: usedAiFilter || undefined }));
  }, [dispatch, page, phaseFilter, statusFilter, projectFilter, usedAiFilter]);

  useEffect(() => { load(); }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try { await dispatch(deleteAiUsageThunk(deleteTarget.id)).unwrap(); toast.success('Deleted'); setDeleteTarget(null); }
    catch (e: any) { toast.error(e); } finally { setDeleting(false); }
  };

  const columns: Column<AiUsageRecord>[] = [
    { key: 'jiraId', header: 'Jira ID', width: '100px', render: r => <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.8rem' }}>{r.jiraId || '—'}</span> },
    { key: 'employee', header: 'Employee', render: r => <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{r.employeeName || '—'}</span> },
    { key: 'sdlcPhase', header: 'SDLC Phase', render: r => <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--info)' }}>{r.sdlcPhase}</span> },
    { key: 'usedAi', header: 'AI Used', width: '80px', render: r => <span style={{ fontSize: '0.8rem', fontWeight: 700, color: r.usedAi ? 'var(--success)' : 'var(--error)' }}>{r.usedAi ? '✓ Yes' : '✗ No'}</span> },
    { key: 'toolUsed', header: 'Tool', width: '110px', render: r => <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{r.toolUsed || '—'}</span> },
    {
      key: 'effort', header: 'Effort', width: '160px',
      render: r => (
        <div style={{ fontSize: '0.78rem' }}>
          <div>Est: <strong>{formatHours(r.estimatedTime)}</strong> → Actual: <strong>{formatHours(r.actualTimeSpent)}</strong></div>
          <div style={{ color: 'var(--success)', fontWeight: 700 }}>Saved: {formatHours(r.actualEffortSaved)} ({formatPercent(r.actualEffortSavedPct)})</div>
        </div>
      ),
    },
    { key: 'status', header: 'Status', width: '100px', render: r => <Badge status={r.status} size="sm" /> },
    {
      key: 'actions', header: '', width: '100px',
      render: r => (
        <div style={{ display: 'flex', gap: 4 }}>
          <Button size="sm" variant="ghost" icon={<FiEye />} onClick={e => { e.stopPropagation(); navigate(`/ai-usage/${r.id}`); }} />
          <Button size="sm" variant="ghost" icon={<FiEdit2 />} onClick={e => { e.stopPropagation(); setEditId(r.id); setShowForm(true); }} />
          <Button size="sm" variant="ghost" icon={<FiTrash2 />} onClick={e => { e.stopPropagation(); setDeleteTarget(r); }} style={{ color: 'var(--error)' }} />
        </div>
      ),
    },
  ];

  const fStyle = { padding: '8px 12px', border: '1.5px solid var(--border)', borderRadius: 8, background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.8rem', outline: 'none' };

  return (
    <div>
      <PageHeader title="AI Usage Tracking" subtitle={`${pagination?.total ?? 0} records`}
        actions={<Button icon={<FiPlus />} onClick={() => { setEditId(undefined); setShowForm(true); }}>Log AI Usage</Button>} />

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <select value={projectFilter} onChange={e => { setProjectFilter(e.target.value); setPage(1); setTimeout(() => load(1), 0); }} style={fStyle}>
          <option value="">All Projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.projectName}</option>)}
        </select>
        <select value={phaseFilter} onChange={e => { setPhaseFilter(e.target.value); setPage(1); setTimeout(() => load(1), 0); }} style={fStyle}>
          <option value="">All Phases</option>
          {SDLC_PHASES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={usedAiFilter} onChange={e => { setUsedAiFilter(e.target.value); setPage(1); setTimeout(() => load(1), 0); }} style={fStyle}>
          <option value="">AI Used (All)</option>
          <option value="true">AI Used</option>
          <option value="false">No AI</option>
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); setTimeout(() => load(1), 0); }} style={fStyle}>
          <option value="">All Statuses</option>
          {AI_USAGE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <Table columns={columns} data={records} isLoading={isLoading}
        pagination={pagination} onPageChange={p => { setPage(p); load(p); }}
        rowKey={r => r.id} onRowClick={r => navigate(`/ai-usage/${r.id}`)}
        emptyMessage="No AI usage records found." />

      {showForm && <AiUsageForm isOpen={showForm} onClose={() => { setShowForm(false); setEditId(undefined); }} recordId={editId} onSuccess={() => { setShowForm(false); load(); }} />}
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} isLoading={deleting}
        title="Delete Record" message="Delete this AI usage record?" confirmLabel="Delete" />
    </div>
  );
};

export default AiUsageList;
