import React, { useEffect, useState, useCallback } from 'react';
import { FiUser } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchEmployeesThunk } from '@/store/slices/employeeSlice';
import { Employee } from '@/types';
import { EMPLOYEE_ROLES } from '@/utils/constants';
import { getInitials, formatDate, formatDateTime } from '@/utils/helpers';
import Table, { Column } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import SearchBar from '@/components/ui/SearchBar';
import PageHeader from '@/components/ui/PageHeader';
import Select from '@/components/ui/Select';
import styles from './Employees.module.css';

const ROLE_COLORS: Record<string, string> = {
  Admin: '#7b1fa2', PM: '#1976d2', Developer: '#2e7d32',
  QA: '#e65100', BA: '#0277bd', Architect: '#c62828',
};

const EmployeeList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { employees, pagination, isLoading } = useAppSelector(s => s.employees);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback((p = page, s = search, r = roleFilter) => {
    dispatch(fetchEmployeesThunk({ page: p, limit: 10, search: s || undefined, role: r || undefined }));
  }, [dispatch, page, search, roleFilter]);

  useEffect(() => { load(); }, []);

  const handleSearch = (v: string) => { setSearch(v); setPage(1); setTimeout(() => load(1, v, roleFilter), 300); };
  const handleRole = (v: string) => { setRoleFilter(v); setPage(1); load(1, search, v); };

  const columns: Column<Employee>[] = [
    {
      key: 'name', header: 'Employee',
      render: r => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className={styles.avatar} style={{ background: `${ROLE_COLORS[r.role] ?? '#1976d2'}18`, color: ROLE_COLORS[r.role] ?? '#1976d2' }}>
            {getInitials(r.firstName, r.lastName)}
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{r.firstName} {r.lastName}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.employeeId}</div>
          </div>
        </div>
      ),
    },
    { key: 'email', header: 'Email', render: r => <span style={{ fontSize: '0.8rem' }}>{r.email}</span> },
    {
      key: 'role', header: 'Role', width: '110px',
      render: r => <span style={{ fontSize: '0.78rem', fontWeight: 700, color: ROLE_COLORS[r.role], background: `${ROLE_COLORS[r.role]}18`, padding: '3px 10px', borderRadius: 9999 }}>{r.role}</span>,
    },
    { key: 'designation', header: 'Designation', render: r => <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{r.designation || '—'}</span> },
    { key: 'department', header: 'Department', render: r => <span style={{ fontSize: '0.8rem' }}>{r.department || '—'}</span> },
    { key: 'lastLogin', header: 'Last Login', width: '140px', render: r => <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{formatDateTime(r.lastLogin) || 'Never'}</span> },
    { key: 'isActive', header: 'Status', width: '90px', render: r => <Badge status={r.isActive ? 'Active' : 'Inactive'} size="sm" /> },
  ];

  return (
    <div>
      <PageHeader title="Employees" subtitle={`${pagination?.total ?? 0} employees`} />

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <SearchBar value={search} onChange={handleSearch} placeholder="Search by name, email or ID…" />
        <select value={roleFilter} onChange={e => handleRole(e.target.value)}
          style={{ padding: '8px 12px', border: '1.5px solid var(--border)', borderRadius: 8, background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none' }}>
          <option value="">All Roles</option>
          {EMPLOYEE_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* Role summary chips */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {EMPLOYEE_ROLES.map(role => {
          const count = employees.filter(e => e.role === role).length;
          if (!count) return null;
          return (
            <div key={role} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, background: `${ROLE_COLORS[role]}18`, border: `1px solid ${ROLE_COLORS[role]}44` }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: ROLE_COLORS[role] }} />
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: ROLE_COLORS[role] }}>{role}: {count}</span>
            </div>
          );
        })}
      </div>

      <Table columns={columns} data={employees} isLoading={isLoading}
        pagination={pagination} onPageChange={p => { setPage(p); load(p); }}
        rowKey={r => r.id} emptyMessage="No employees found." />
    </div>
  );
};

export default EmployeeList;
