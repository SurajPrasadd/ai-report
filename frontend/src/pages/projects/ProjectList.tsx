import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiUsers } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProjectsThunk, deleteProjectThunk } from '@/store/slices/projectSlice';
import { Project } from '@/types';
import { PROJECT_STATUSES } from '@/utils/constants';
import { formatDate } from '@/utils/helpers';
import Button from '@/components/ui/Button';
import Table, { Column } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import SearchBar from '@/components/ui/SearchBar';
import PageHeader from '@/components/ui/PageHeader';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ProjectForm from './ProjectForm';
import styles from './Projects.module.css';

const ProjectList: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { projects, pagination, isLoading } = useAppSelector(s => s.projects);
  const { user } = useAppSelector(s => s.auth);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback((p = page, s = search, st = statusFilter) => {
    dispatch(fetchProjectsThunk({ page: p, limit: 10, search: s || undefined, status: st || undefined }));
  }, [dispatch, page, search, statusFilter]);

  useEffect(() => { load(); }, []);

  const handleSearch = useCallback((v: string) => {
    setSearch(v); setPage(1);
    setTimeout(() => load(1, v, statusFilter), 300);
  }, [load, statusFilter]);

  const handleStatusFilter = (v: string) => {
    setStatusFilter(v); setPage(1); load(1, search, v);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await dispatch(deleteProjectThunk(deleteTarget.id)).unwrap();
      toast.success('Project deleted');
      setDeleteTarget(null);
    } catch (e: any) { toast.error(e); }
    finally { setDeleting(false); }
  };

  const columns: Column<Project>[] = [
    { key: 'projectCode', header: 'Code', width: '90px', render: r => <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.8rem' }}>{r.projectCode}</span> },
    { key: 'projectName', header: 'Project Name', render: r => <div><div style={{ fontWeight: 600 }}>{r.projectName}</div>{r.pmName && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>PM: {r.pmName}</div>}</div> },
    { key: 'status', header: 'Status', width: '110px', render: r => <Badge status={r.status} /> },
    { key: 'startDate', header: 'Start Date', width: '115px', render: r => <span style={{ fontSize: '0.8rem' }}>{formatDate(r.startDate)}</span> },
    { key: 'endDate', header: 'End Date', width: '115px', render: r => <span style={{ fontSize: '0.8rem' }}>{formatDate(r.endDate) || <span style={{ color: 'var(--text-muted)' }}>Ongoing</span>}</span> },
    {
      key: 'actions', header: 'Actions', width: '160px',
      render: r => (
        <div style={{ display: 'flex', gap: 4 }}>
          <Button size="sm" variant="ghost" icon={<FiEye />} onClick={e => { e.stopPropagation(); navigate(`/projects/${r.id}`); }} title="View" />
          <Button size="sm" variant="ghost" icon={<FiUsers />} onClick={e => { e.stopPropagation(); navigate(`/projects/${r.id}?tab=team`); }} title="Team" />
          <Button size="sm" variant="ghost" icon={<FiEdit2 />} onClick={e => { e.stopPropagation(); setEditId(r.id); setShowForm(true); }} title="Edit" />
          {user?.role === 'Admin' && <Button size="sm" variant="ghost" icon={<FiTrash2 />} onClick={e => { e.stopPropagation(); setDeleteTarget(r); }} title="Delete" style={{ color: 'var(--error)' }} />}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Projects" subtitle={`${pagination?.total ?? 0} projects total`}
        actions={<Button icon={<FiPlus />} onClick={() => { setEditId(undefined); setShowForm(true); }}>New Project</Button>} />

      <div className={styles.toolbar}>
        <SearchBar value={search} onChange={handleSearch} placeholder="Search by name or code…" />
        <select value={statusFilter} onChange={e => handleStatusFilter(e.target.value)}
          style={{ padding: '8px 12px', border: '1.5px solid var(--border)', borderRadius: 8, background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none' }}>
          <option value="">All Statuses</option>
          {PROJECT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <Table columns={columns} data={projects} isLoading={isLoading}
        pagination={pagination} onPageChange={p => { setPage(p); load(p); }}
        rowKey={r => r.id} onRowClick={r => navigate(`/projects/${r.id}`)}
        emptyMessage="No projects found. Create your first project." />

      {showForm && (
        <ProjectForm isOpen={showForm} onClose={() => { setShowForm(false); setEditId(undefined); }}
          projectId={editId} onSuccess={() => { setShowForm(false); load(); }} />
      )}

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete} isLoading={deleting}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteTarget?.projectName}"? This action cannot be undone.`}
        confirmLabel="Delete" />
    </div>
  );
};

export default ProjectList;
